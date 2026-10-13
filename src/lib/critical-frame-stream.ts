import { CyclesFrameCache } from './cycles-frame-cache';
import { FrameBundleStore, type FrameBundleVariant } from './frame-bundle-store';
import type { FilmFrame } from './film-frame';
import { directedFrames, type StreamProfile } from './frame-stream-policy';

/** Motion and rest both present original pixels; bundles reduce request overhead. */
export class CriticalFrameStream {
  private cache: CyclesFrameCache;
  private bundles: FrameBundleStore;
  private warm = false;
  private disposed = false;
  private index = 0;
  private initialized = false;
  private direction = 1;
  private originalRequests = 0;
  constructor(private urls: string[], variant: FrameBundleVariant, readonly profile: StreamProfile, private changed: () => void) {
    this.bundles = new FrameBundleStore(variant, profile.limit === 2 ? 2 : variant.packs.length, profile.concurrency === 1 ? 1 : 2, () => { if (this.warm) { this.request(); this.changed(); } });
    this.cache = new CyclesFrameCache(profile.limit, profile.concurrency, changed, async (url, signal) => {
      const packed = this.bundles.getBlob(url);
      if (packed) return { blob: packed, networkBytes: 0 };
      this.originalRequests++;
      const response = await fetch(url, { signal, cache: 'force-cache' });
      if (!response.ok) throw new Error('Original frame unavailable');
      const blob = await response.blob(); return { blob, networkBytes: blob.size };
    });
  }
  setTarget(index: number) {
    if (this.disposed) return;
    const next = Math.max(0, Math.min(this.urls.length - 1, Math.round(index)));
    if (this.initialized && next === this.index) return;
    this.direction = next < this.index ? -1 : 1;
    this.initialized = true; this.index = next;
    if (this.warm) { this.bundles.request(this.index, this.direction); this.request(); }
  }
  setWarm(warm: boolean) {
    if (this.disposed || warm === this.warm) return;
    this.warm = warm;
    if (warm) { this.bundles.request(this.index, this.direction); this.request(); }
    else { this.cache.release(); this.bundles.release(); }
  }
  private request() {
    // Ready bundles supply neighbouring original WebPs without a network request.
    // Direct entry and failed bundles fetch just the current original image.
    const frames = this.bundles.has(this.urls[this.index]) ? directedFrames(this.index, this.urls.length, this.direction, this.profile.lead) : [this.index];
    this.cache.request([...new Set(frames.map(index => this.urls[index]))].slice(0, this.profile.limit));
  }
  getFrame(): FilmFrame | undefined {
    const exact = this.cache.get(this.urls[this.index]);
    if (exact) return { bitmap: exact, index: this.index, fullResolution: true, width: exact.width, height: exact.height };
    for (let distance = 1; distance < this.urls.length; distance++) {
      for (const index of [this.index - distance * this.direction, this.index + distance * this.direction]) {
        if (index < 0 || index >= this.urls.length) continue;
        const bitmap = this.cache.get(this.urls[index]);
        if (bitmap) return { bitmap, index, fullResolution: true, width: bitmap.width, height: bitmap.height };
      }
    }
  }
  diagnostics() {
    const cache=this.cache.diagnostics(),bundles=this.bundles.diagnostics();
    return {...cache,...bundles,decodedFrameRequests:cache.fetches,fetches:this.originalRequests+bundles.bundleRequests,originalHttpRequests:this.originalRequests,desiredFrame:this.index,direction:this.direction,previewDraws:0,previewDecodedBytes:0,downloadedBytes:cache.downloadedBytes+bundles.bundleDownloadedBytes};
  }
  dispose() { this.disposed = true; this.cache.dispose(); this.bundles.dispose(); }
}
