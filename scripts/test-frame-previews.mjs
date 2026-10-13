import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import sharp from 'sharp';

const modules = new Map();
async function moduleUrl(file) {
  if (modules.has(file)) return modules.get(file);
  const source = await fs.readFile(file, 'utf8');
  let { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  for (const match of [...outputText.matchAll(/from ['"](.\/[^'"]+)['"]/g)]) {
    outputText = outputText.replace(match[0], `from '${await moduleUrl(path.resolve(path.dirname(file), match[1] + '.ts'))}'`);
  }
  const url = 'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'); modules.set(file, url); return url;
}
const { CriticalFrameStream } = await import(await moduleUrl(path.resolve('src/lib/critical-frame-stream.ts')));
const { CriticalFrameSurface } = await import(await moduleUrl(path.resolve('src/lib/critical-frame-surface.ts')));
const { streamProfile, directedFrames } = await import(await moduleUrl(path.resolve('src/lib/frame-stream-policy.ts')));
assert.deepEqual(directedFrames(10, 72, -1, 4), [10, 9, 8, 11, 7, 6]);
assert.deepEqual(directedFrames(0, 72, -1, 4), [0, 1]);
assert.deepEqual(streamProfile(true, 2).limit, 2);
assert.deepEqual(streamProfile(false, 8).limit, 16);

const assembly = JSON.parse(await fs.readFile('public/assets/exploded-cycles/manifest.json', 'utf8'));
const jobs = [];
for (const name of ['assembly', 'finale']) {
  const manifest = JSON.parse(await fs.readFile(`public/assets/frame-previews-v1/${name}/manifest.json`, 'utf8'));
  for (const variant of ['desktop', 'mobile']) {
    const preview = manifest.variants[variant], urls = name === 'assembly' ? assembly.variants[variant].urls : Array.from({ length: 72 }, (_, i) => `/assets/finale-reveal-v1/${variant}/reveal-${String(i).padStart(3, '0')}.webp`);
    const unique = [...new Set(urls)], hashes = await Promise.all(unique.map(async url => createHash('sha256').update(await fs.readFile('public' + url)).digest('hex')));
    assert.equal(preview.sourceDigest, createHash('sha256').update(hashes.join('\n')).digest('hex'), 'Every original render remains byte-for-byte intact');
    assert.deepEqual(preview.frameMap, urls.map(url => unique.indexOf(url)), 'Every authored pose maps to the correct tile, including duplicate assembly holds');
    const atlas = await fs.readFile('public' + preview.url), metadata = await sharp(atlas).metadata();
    assert.equal(atlas.length, preview.bytes); assert.equal(metadata.width, preview.columns * preview.cellWidth); assert.equal(metadata.height, preview.rows * preview.cellHeight);
    assert.ok(preview.url.includes(createHash('sha256').update(atlas).digest('hex').slice(0, 12)), 'Immutable URL identifies the atlas bytes');
    jobs.push({ name, variant, preview, urls });
  }
}

const originals = { fetch: globalThis.fetch, decode: globalThis.createImageBitmap };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const report = { latencyMs: 250, scrollStepMs: 20, cases: [] };
let bitmaps = [], completed = [], requests = [], active = 0, peakActive = 0, failing = '', decodeDelay = 0;
globalThis.fetch = (url, { signal }) => new Promise((resolve, reject) => {
  requests.push(url); active++; peakActive = Math.max(peakActive, active);
  let settled = false;
  const finish = callback => { if (settled) return; settled = true; active--; signal.removeEventListener('abort', abort); callback(); };
  const timer = setTimeout(() => finish(() => resolve({ ok: url !== failing, status: url === failing ? 404 : 200, blob: async () => ({ size: jobs.find(job => job.preview.url === url)?.preview.bytes ?? 20000, url }) })), 250);
  const abort = () => { clearTimeout(timer); finish(() => reject(new DOMException('Aborted', 'AbortError'))); };
  signal.addEventListener('abort', abort, { once: true }); if (signal.aborted) abort();
});
globalThis.createImageBitmap = async blob => {
  if (decodeDelay) await delay(decodeDelay);
  const job = jobs.find(job => job.preview.url === blob.url || job.urls.includes(blob.url));
  const atlas = job?.preview.url === blob.url;
  const bitmap = { width: atlas ? job.preview.columns * job.preview.cellWidth : job?.preview.sourceWidth ?? 800,
    height: atlas ? job.preview.rows * job.preview.cellHeight : job?.preview.sourceHeight ?? 800,
    closed: false, close() { this.closed = true; } };
  bitmaps.push(bitmap); completed.push(blob.url); return bitmap;
};
try {
  for (const job of jobs) {
    bitmaps = []; completed = []; requests = []; peakActive = 0;
    const profile = streamProfile(job.variant === 'mobile', 4);
    const stream = new CriticalFrameStream(job.urls, job.preview, profile, () => {});
    try {
      stream.setTarget(0); stream.setWarm(true); await delay(350);
      assert.ok(stream.diagnostics().previewReady, 'Prewarming downloads the entire preview film in one request');
      let exactWhileMoving = 0;
      const startRequests = requests.length;
      const targets = [...Array.from({ length: 32 }, (_, i) => Math.round(i / 31 * (job.urls.length - 1))), ...Array.from({ length: 32 }, (_, i) => Math.round((1 - i / 31) * (job.urls.length - 1)))];
      for (const index of targets) {
        stream.setTarget(index);
        const frame = stream.getFrame();
        assert.equal(frame?.index, index, 'The visible pose follows forward and reverse scroll without waiting for a frame request');
        if (frame.crop) {
          const tile = job.preview.frameMap[index];
          assert.equal(frame.crop.x, tile % job.preview.columns * job.preview.cellWidth);
          assert.equal(frame.crop.y, Math.floor(tile / job.preview.columns) * job.preview.cellHeight);
        }
        exactWhileMoving++; await delay(20);
      }
      const scrollRequests = requests.length - startRequests;
      assert.ok(scrollRequests <= profile.concurrency, 'Scrolling does not create a full-resolution request for every skipped pose');
      stream.setTarget(Math.floor(job.urls.length * .72)); await delay(1050);
      const frame = stream.getFrame(), state = stream.diagnostics();
      assert.equal(frame?.index, Math.floor(job.urls.length * .72)); assert.equal(frame.fullResolution, true, 'A pause replaces the preview with the exact original image');
      assert.ok(state.peakCacheFrames <= profile.limit); assert.ok(peakActive <= profile.concurrency + 1);
      const atRestRequests = requests.length; await delay(300); assert.equal(requests.length, atRestRequests, 'The settled cache does not churn');
      stream.setTarget(1); stream.setWarm(false); await delay(50);
      assert.equal(active, 0); assert.ok(bitmaps.every(bitmap => bitmap.closed), 'Leaving the warm zone releases full images and atlas');
      stream.setWarm(true); await delay(400); assert.equal(stream.getFrame()?.index, 1, 'Returning loads the film again');
      report.cases.push({ sequence: job.name, variant: job.variant, previewBytes: job.preview.bytes, previewDecodedBytes: job.preview.decodedBytes, exactWhileMoving, samples: targets.length, highResolutionRequestsDuringMotion: scrollRequests, highResolutionAtRest: frame.fullResolution, peakConcurrentRequestsIncludingAtlas: peakActive, ...state });
    } finally { stream.dispose(); await delay(30); }
  }
  // An unavailable preview must leave the original sequence usable.
  const job = jobs[0]; failing = job.preview.url;
  const fallback = new CriticalFrameStream(job.urls, job.preview, streamProfile(false, 2, true), () => {});
  fallback.setTarget(77); fallback.setWarm(true); await delay(900);
  assert.equal(fallback.getFrame()?.index, 77); assert.equal(fallback.getFrame()?.fullResolution, true);
  assert.equal(fallback.diagnostics().previewFailures, 1); assert.ok(fallback.diagnostics().peakCacheFrames <= 2);
  const before = requests.length; await delay(350); assert.equal(requests.length, before, 'Save-Data cache remains stable even with a failed preview');
  fallback.dispose(); failing = ''; await delay(50);
  // Decoding can finish after exit: stale pixels must be closed, never retained.
  decodeDelay = 80; bitmaps = [];
  const late = new CriticalFrameStream(job.urls, job.preview, streamProfile(false, 4), () => {});
  late.setWarm(true); await delay(270); late.dispose(); await delay(150);
  assert.ok(bitmaps.every(bitmap => bitmap.closed)); assert.equal(active, 0);
  report.previewFailureFallback = true; report.saveDataStable = true; report.lateDecodeReleased = true;
  // Exercise the actual canvas adapter with observer/visibility events. This
  // catches a same-index preview getting stuck instead of refining at rest.
  decodeDelay = 0;
  const keys = ['innerWidth', 'devicePixelRatio', 'navigator', 'document', 'IntersectionObserver', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const descriptors = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const observers = [], sizes = [], visibility = new Set(), paints = [];
  const dom = { hidden: false, addEventListener: (_, fn) => visibility.add(fn), removeEventListener: (_, fn) => visibility.delete(fn) };
  class Observer {
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe() {} disconnect() {} intersect(value) { this.callback([{ isIntersecting: value }]); }
  }
  class SizeObserver { constructor(callback) { sizes.push(callback); } observe() {} disconnect() {} }
  const values = { innerWidth: 1366, devicePixelRatio: 1, navigator: { deviceMemory: 4 }, document: dom,
    IntersectionObserver: Observer, ResizeObserver: SizeObserver,
    requestAnimationFrame: callback => setTimeout(() => callback(performance.now()), 8), cancelAnimationFrame: clearTimeout };
  for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  let surface;
  try {
    const job = jobs.find(job => job.name === 'finale' && job.variant === 'desktop');
    const spec = { count: 72, variants: { desktop: job.preview, mobile: jobs.find(job => job.name === 'finale' && job.variant === 'mobile').preview } };
    const element = { dataset: {}, getBoundingClientRect: () => ({ width: 640, height: 680 }) };
    const output = { width: 0, height: 0, getContext: () => ({ clearRect() {}, drawImage(...args) { paints.push(args); } }) };
    surface = new CriticalFrameSurface(element, output, { frame: 0, count: 72, path: '/assets/finale-reveal-v1', prefix: 'reveal-', preview: spec, onPresent() {} });
    observers[0].intersect(true); observers[1].intersect(true); await delay(350);
    surface.seek(36); await delay(40);
    assert.equal(element.dataset.displayedFrame, '36'); assert.equal(element.dataset.fullResolution, 'false', 'The new pose appears before its original file arrives');
    await delay(1000); assert.equal(element.dataset.fullResolution, 'true', 'The same-index original replaces the preview');
    const paintCount = paints.length; await delay(300); assert.equal(paints.length, paintCount, 'Idle callbacks do not repaint unchanged pixels');
    globalThis.innerWidth = 390; sizes.forEach(callback => callback()); await delay(650);
    assert.equal(surface.diagnostics().variant, 'mobile'); assert.equal(element.dataset.displayedFrame, '36');
    assert.equal(surface.diagnostics().cacheLimit, 6);
    dom.hidden = true; visibility.forEach(callback => callback()); await delay(50);
    assert.equal(surface.diagnostics().decodedBytes, 0); assert.equal(surface.diagnostics().previewDecodedBytes, 0);
    dom.hidden = false; visibility.forEach(callback => callback()); await delay(650);
    assert.equal(element.dataset.fullResolution, 'true'); assert.equal(element.dataset.displayedFrame, '36');
    observers[0].intersect(false); observers[1].intersect(false); await delay(50);
    assert.equal(surface.diagnostics().pending, 0); assert.equal(surface.diagnostics().previewDecodedBytes, 0);
    report.canvas = { sameIndexRefined: true, idleNoRepaint: true, responsiveVariantChanged: true, hiddenMemoryReleased: true, returnRecovered: true, exitRequestsCancelled: true };
  } finally {
    surface?.dispose();
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
  await fs.mkdir('qa/frame-delivery', { recursive: true });
  await fs.writeFile('qa/frame-delivery/simulated-network.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { globalThis.fetch = originals.fetch; globalThis.createImageBitmap = originals.decode; }
