import { CyclesFrameCache } from './cycles-frame-cache';
import { FramePreview, type FilmFrame, type FramePreviewVariant } from './frame-preview';
import { directedFrames, type StreamProfile } from './frame-stream-policy';

/** Preview follows the playhead; original pixels refine it after a short pause. */
export class CriticalFrameStream {
  private cache: CyclesFrameCache;
  private preview: FramePreview;
  private warm = false;
  private disposed = false;
  private index = 0;
  private initialized = false;
  private direction = 1;
  private moving = false;
  private idleTimer?: ReturnType<typeof setTimeout>;
  constructor(private urls: string[], variant: FramePreviewVariant, readonly profile: StreamProfile, private changed: () => void) {
    this.cache = new CyclesFrameCache(profile.limit, profile.concurrency, changed);
    this.preview = new FramePreview(variant, () => { if (this.warm) { this.request(); this.changed(); } });
  }
  setTarget(index: number) {
    const next = Math.max(0, Math.min(this.urls.length - 1, Math.round(index)));
    if (this.initialized && next === this.index) return;
    this.direction = next < this.index ? -1 : 1;
    this.moving = this.initialized; this.initialized = true; this.index = next;
    clearTimeout(this.idleTimer);
    if (this.moving && this.warm) this.idleTimer = setTimeout(() => {
      this.moving = false; if (this.warm && !this.disposed) { this.request(); this.changed(); }
    }, 120);
    if (this.warm) { this.preview.load(); this.request(); }
  }
  setWarm(warm: boolean) {
    if (this.disposed || warm === this.warm) return;
    this.warm = warm;
    if (warm) { this.moving = false; this.preview.load(); this.request(); }
    else { clearTimeout(this.idleTimer); this.cache.release(); this.preview.release(); }
  }
  private request() {
    // Retarget queued work without cancelling the bounded requests already in flight.
    // Until the overview arrives, original frames still provide a graceful fallback.
    const frames = this.preview.ready && this.moving ? [] : this.preview.diagnostics().previewPending ? [this.index] : directedFrames(this.index, this.urls.length, this.direction, this.profile.lead);
    this.cache.request([...new Set(frames.map(index => this.urls[index]))].slice(0, this.profile.limit));
  }
  getFrame(): FilmFrame | undefined {
    const exact = this.cache.get(this.urls[this.index]);
    if (exact) return { bitmap: exact, index: this.index, fullResolution: true, width: exact.width, height: exact.height };
    const preview = this.preview.get(this.index);
    if (preview) return preview;
    for (let distance = 1; distance < this.urls.length; distance++) {
      for (const index of [this.index + distance * this.direction, this.index - distance * this.direction]) {
        if (index < 0 || index >= this.urls.length) continue;
        const bitmap = this.cache.get(this.urls[index]);
        if (bitmap) return { bitmap, index, fullResolution: true, width: bitmap.width, height: bitmap.height };
      }
    }
  }
  diagnostics() { return { ...this.cache.diagnostics(), ...this.preview.diagnostics(), moving: this.moving, direction: this.direction, desiredFrame: this.index }; }
  dispose() { this.disposed = true; clearTimeout(this.idleTimer); this.cache.dispose(); this.preview.dispose(); }
}
