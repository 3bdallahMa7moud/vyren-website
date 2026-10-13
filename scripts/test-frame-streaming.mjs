import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = await fs.readFile(new URL('../src/lib/cycles-frame-cache.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { CyclesFrameCache } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
const originalFetch = globalThis.fetch, originalDecode = globalThis.createImageBitmap;
const bitmaps = [], completed = [];
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
let active = 0, peakActive = 0;
globalThis.fetch = (url, { signal }) => new Promise((resolve, reject) => {
  active++; peakActive = Math.max(peakActive, active);
  let settled = false;
  const finish = callback => { if (settled) return; settled = true; active--; signal.removeEventListener('abort', abort); callback(); };
  const timer = setTimeout(() => finish(() => resolve({ ok: true, blob: async () => ({ size: 20000, url }) })), 250);
  const abort = () => { clearTimeout(timer); finish(() => reject(new DOMException('Aborted', 'AbortError'))); };
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) abort();
});
globalThis.createImageBitmap = async blob => {
  const bitmap = { width: 800, height: 800, url: blob.url, closed: false, close() { this.closed = true; } };
  bitmaps.push(bitmap); completed.push(blob.url); return bitmap;
};
const cache = new CyclesFrameCache(5, 2, () => {});
let duringScroll = 0;
try {
  // A visitor scrolls continuously while each frame takes 250 ms to arrive.
  // The picture must make progress before the visitor stops, then settle on
  // the exact requested pose, with bounded memory and no background work.
  for (let frame = 0; frame <= 30; frame++) {
    cache.request([frame, frame + 1, frame - 1, frame + 2, frame - 2].filter(index => index >= 0).map(index => `frame-${index}`));
    await delay(40);
  }
  duringScroll = completed.length;
  await delay(700);
  const report = { latencyMs: 250, scrollStepMs: 40, completedDuringScroll: duringScroll, exactPoseAtRest: !!cache.get('frame-30'), peakConcurrentRequests: peakActive, ...cache.diagnostics() };
  cache.request(['frame-60', 'frame-61']);
  await delay(20);
  report.pendingBeforeRelease = active;
  cache.release();
  await delay(20);
  report.releasedAllBitmaps = bitmaps.every(bitmap => bitmap.closed);
  report.pendingAfterRelease = active;
  console.log(JSON.stringify(report, null, 2));
  assert.ok(duringScroll >= 4, 'Frames must arrive while scrolling continuously; cancelling every older request freezes the film');
  assert.ok(report.exactPoseAtRest, 'The exact pose must arrive after scrolling stops');
  assert.ok(report.peakCacheFrames <= 5, 'Decoded frames remain within the memory limit');
  assert.ok(report.peakConcurrentRequests <= 2, 'Request concurrency remains bounded');
  assert.ok(report.pendingBeforeRelease === 2 && report.releasedAllBitmaps && report.pendingAfterRelease === 0, 'Leaving a section releases memory and cancels pending work');
} finally {
  cache.dispose();
  globalThis.fetch = originalFetch;
  globalThis.createImageBitmap = originalDecode;
}
