import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const modules = new Map();
async function moduleUrl(file) {
  if (modules.has(file)) return modules.get(file);
  const source = await fs.readFile(file, 'utf8');
  let { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  for (const match of [...outputText.matchAll(/from ['"](.\/[^'"]+)['"]/g)]) outputText = outputText.replace(match[0], `from '${await moduleUrl(path.resolve(path.dirname(file), match[1] + '.ts'))}'`);
  const url = 'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'); modules.set(file, url); return url;
}
const { CriticalFrameStream } = await import(await moduleUrl(path.resolve('src/lib/critical-frame-stream.ts')));
const { CriticalFrameSurface } = await import(await moduleUrl(path.resolve('src/lib/critical-frame-surface.ts')));
const { streamProfile } = await import(await moduleUrl(path.resolve('src/lib/frame-stream-policy.ts')));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const assembly = JSON.parse(await fs.readFile('public/assets/exploded-cycles/manifest.json', 'utf8'));
const jobs = [], files = new Map(), images = new Map();
for (const name of ['assembly', 'finale']) {
  const manifest = JSON.parse(await fs.readFile(`public/assets/frame-bundles-v1/${name}/manifest.json`, 'utf8'));
  for (const variant of ['desktop', 'mobile']) {
    const bundle = manifest.variants[variant];
    const urls = name === 'assembly' ? assembly.variants[variant].urls : Array.from({ length: 72 }, (_, i) => `/assets/finale-reveal-v1/${variant}/reveal-${String(i).padStart(3, '0')}.webp`);
    for (const pack of bundle.packs) {
      const bytes = await fs.readFile('public' + pack.url); assert.equal(bytes.length, pack.bytes); assert.equal(hash(bytes), pack.digest);
      assert.ok(pack.url.includes(pack.digest.slice(0, 12))); files.set(pack.url, bytes);
    }
    for (const source of bundle.sources) {
      const bytes = await fs.readFile('public' + source.url), pack = files.get(bundle.packs[source.pack].url);
      assert.ok(bytes.equals(pack.subarray(source.offset, source.offset + source.bytes)), 'Packed image is byte-for-byte the authored WebP, without resizing or recompression');
      assert.equal(hash(bytes), source.digest); files.set(source.url, bytes); images.set(source.digest, { width: bundle.width, height: bundle.height });
    }
    assert.deepEqual(bundle.frameMap.map(index => bundle.sources[index].url), urls, 'All poses, including assembly holds, preserve their exact source mapping');
    jobs.push({ name, variant, bundle, urls });
  }
}

const originals = { fetch: globalThis.fetch, decode: globalThis.createImageBitmap };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const report = { latencyMs: 250, decodeDelayMs: 6, scrollStepMs: 24, cases: [] };
let bitmaps = [], active = 0, peakActive = 0, failing = '', decodeDelay = 6;
globalThis.fetch = (url, { signal }) => new Promise((resolve, reject) => {
  active++; peakActive = Math.max(peakActive, active); let settled = false;
  const finish = callback => { if (settled) return; settled = true; active--; signal.removeEventListener('abort', abort); callback(); };
  const bytes = files.get(url); assert.ok(bytes, `Known asset ${url}`);
  const timer = setTimeout(() => finish(() => resolve({ ok: url !== failing, status: url === failing ? 404 : 200,
    arrayBuffer: async () => Uint8Array.from(bytes).buffer, blob: async () => new Blob([bytes], { type: 'image/webp' }) })), 250);
  const abort = () => { clearTimeout(timer); finish(() => reject(new DOMException('Aborted', 'AbortError'))); };
  signal.addEventListener('abort', abort, { once: true }); if (signal.aborted) abort();
});
globalThis.createImageBitmap = async blob => {
  const digest = hash(Buffer.from(await blob.arrayBuffer())), image = images.get(digest);
  assert.ok(image, 'Only an exact original WebP may reach the decoder');
  await delay(decodeDelay);
  const bitmap = { ...image, digest, closed: false, close() { this.closed = true; } }; bitmaps.push(bitmap); return bitmap;
};
try {
  for (const job of jobs) {
    bitmaps = []; peakActive = 0;
    const profile = streamProfile(job.variant === 'mobile', 4), stream = new CriticalFrameStream(job.urls, job.bundle, profile, () => {});
    try {
      stream.setTarget(0); stream.setWarm(true); await delay(1750);
      assert.equal(stream.diagnostics().bundleFramesAvailable, job.bundle.sources.length, 'The compressed film is prepared before interaction');
      const start = stream.diagnostics(); let matched = 0, exact = 0, maxLag = 0;
      const targets = [...Array.from({ length: 32 }, (_, i) => Math.round(i / 31 * (job.urls.length - 1))), ...Array.from({ length: 32 }, (_, i) => Math.round((1 - i / 31) * (job.urls.length - 1)))];
      for (const index of targets) {
        stream.setTarget(index); await delay(24);
        const frame = stream.getFrame();
        assert.ok(frame, 'Prepared motion always retains a decoded original image');
        const lag=Math.abs(frame.index-index);maxLag=Math.max(maxLag,lag);if(!lag)exact++;
        assert.ok(lag<=Math.ceil(job.urls.length*.05), 'The presented pose remains within five percent of a rapidly scrubbed film while decoding');
        assert.equal(frame.fullResolution, true); assert.equal(frame.crop, undefined);
        assert.equal(frame.bitmap.digest, job.bundle.sources[job.bundle.frameMap[frame.index]].digest, 'Displayed pixels belong to the exact presented authored pose');
        matched++;
      }
      const state = stream.diagnostics();
      assert.equal(state.originalHttpRequests, start.originalHttpRequests, 'Prepared motion does not fetch each WebP separately');
      assert.ok(state.peakCacheFrames <= profile.limit); assert.ok(state.peakBundleEncodedBytes <= job.bundle.bytes);
      assert.ok(peakActive <= profile.concurrency + 2);
      stream.setTarget(Math.floor(job.urls.length * .72)); await delay(300);
      assert.equal(stream.getFrame()?.index, Math.floor(job.urls.length * .72));
      stream.setWarm(false); await delay(40);
      assert.equal(active, 0); assert.ok(bitmaps.every(bitmap => bitmap.closed)); assert.equal(stream.diagnostics().bundleEncodedBytes, 0);
      stream.setWarm(true); await delay(400); assert.equal(stream.getFrame()?.index, Math.floor(job.urls.length * .72));
      report.cases.push({ sequence: job.name, variant: job.variant, originalPixelsMatched: matched, exactTargetSamples:exact,maxLagFrames:maxLag,samples: targets.length, noReducedResolutionImages: true, networkRequestsDuringPreparedMotion: state.originalHttpRequests - start.originalHttpRequests, ...state });
    } finally { stream.dispose(); await delay(40); }
  }
  const job = jobs[0], target = 77; failing = job.bundle.packs[job.bundle.sources[job.bundle.frameMap[target]].pack].url;
  const fallback = new CriticalFrameStream(job.urls, job.bundle, streamProfile(false, 2, true), () => {});
  fallback.setTarget(target); fallback.setWarm(true); await delay(900);
  assert.equal(fallback.getFrame()?.index, target); assert.equal(fallback.getFrame()?.fullResolution, true);
  assert.ok(fallback.diagnostics().bundleFailures >= 1); assert.ok(fallback.diagnostics().peakCacheFrames <= 2); assert.ok(fallback.diagnostics().bundleCount <= 2);
  fallback.dispose(); failing = ''; await delay(40);
  decodeDelay = 80; bitmaps = [];
  const late = new CriticalFrameStream(job.urls, job.bundle, streamProfile(false, 4), () => {});
  late.setWarm(true); await delay(270); late.dispose(); await delay(180);
  assert.ok(bitmaps.every(bitmap => bitmap.closed)); assert.equal(active, 0); decodeDelay = 6;
  report.failedBundleFallback = true; report.saveDataBudget = true; report.lateDecodeReleased = true;

  const keys = ['innerWidth', 'devicePixelRatio', 'navigator', 'document', 'IntersectionObserver', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const descriptors = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const observers = [], sizes = [], visibility = new Set(), paints = [];
  const dom = { hidden: false, addEventListener: (_, fn) => visibility.add(fn), removeEventListener: (_, fn) => visibility.delete(fn) };
  class Observer { constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); } observe() {} disconnect() {} intersect(value) { this.callback([{ isIntersecting: value }]); } }
  class SizeObserver { constructor(callback) { sizes.push(callback); } observe() {} disconnect() {} }
  const values = { innerWidth: 1366, devicePixelRatio: 1, navigator: { deviceMemory: 4 }, document: dom, IntersectionObserver: Observer, ResizeObserver: SizeObserver,
    requestAnimationFrame: callback => setTimeout(() => callback(performance.now()), 8), cancelAnimationFrame: clearTimeout };
  for (const [key, value] of Object.entries(values)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  let surface;
  try {
    const desktop = jobs.find(job => job.name === 'finale' && job.variant === 'desktop'), mobile = jobs.find(job => job.name === 'finale' && job.variant === 'mobile');
    const bundle = { count: 72, variants: { desktop: desktop.bundle, mobile: mobile.bundle } };
    const element = { dataset: {}, getBoundingClientRect: () => ({ width: 640, height: 680 }) };
    const output = { width: 0, height: 0, getContext: () => ({ clearRect() {}, drawImage(...args) { paints.push(args); } }) };
    surface = new CriticalFrameSurface(element, output, { frame: 0, count: 72, path: '/assets/finale-reveal-v1', prefix: 'reveal-', bundle, onPresent() {} });
    observers[0].intersect(true); observers[1].intersect(true); await delay(1000);
    surface.seek(36); await delay(100); assert.equal(element.dataset.displayedFrame, '36'); assert.equal(element.dataset.fullResolution, 'true');
    assert.ok(paints.every(args => args.length === 5), 'Every draw uses the complete original image; atlas crop drawing is forbidden');
    const paintCount = paints.length; await delay(300); assert.equal(paints.length, paintCount);
    globalThis.innerWidth = 390; sizes.forEach(callback => callback()); await delay(650);
    assert.equal(surface.diagnostics().variant, 'mobile'); assert.equal(element.dataset.displayedFrame, '36'); assert.equal(surface.diagnostics().cacheLimit, 6);
    dom.hidden = true; visibility.forEach(callback => callback()); await delay(40);
    assert.equal(surface.diagnostics().decodedBytes, 0); assert.equal(surface.diagnostics().bundleEncodedBytes, 0);
    dom.hidden = false; visibility.forEach(callback => callback()); await delay(650);
    assert.equal(element.dataset.displayedFrame, '36'); assert.equal(element.dataset.fullResolution, 'true');
    observers[0].intersect(false); observers[1].intersect(false); await delay(40); assert.equal(surface.diagnostics().pending, 0); assert.equal(surface.diagnostics().bundleEncodedBytes, 0);
    report.canvas = { originalImagesOnly: true, idleNoRepaint: true, responsiveVariantChanged: true, hiddenMemoryReleased: true, returnRecovered: true, exitRequestsCancelled: true };
  } finally {
    surface?.dispose(); for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
  await fs.mkdir('qa/frame-quality', { recursive: true }); await fs.writeFile('qa/frame-quality/verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { globalThis.fetch = originals.fetch; globalThis.createImageBitmap = originals.decode; }
