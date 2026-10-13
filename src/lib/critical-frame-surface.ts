import { CriticalFrameStream } from './critical-frame-stream';
import { deviceStreamProfile } from './frame-stream-policy';
import type { FrameBundleSpec } from './frame-bundle-store';

/** Canvas adapter for the closing film; other studio surfaces keep their controls. */
export class CriticalFrameSurface {
  private stream: CriticalFrameStream;
  private mobile = innerWidth <= 768;
  private target: number;
  private active = false;
  private warm = false;
  private raf = 0;
  private disposed = false;
  private displayed = -1;
  private fullResolution = false;
  private lastBitmap?: ImageBitmap;
  private lastWidth = 0;
  private lastHeight = 0;
  private draws = 0;
  private previewDraws = 0;
  private drawMs = 0;
  private observer: IntersectionObserver;
  private preload: IntersectionObserver;
  private resize: ResizeObserver;
  private context: CanvasRenderingContext2D;
  constructor(private element: HTMLDivElement, private output: HTMLCanvasElement, private options: {
    frame: number; count: number; path: string; prefix: string; bundle: FrameBundleSpec;
    fit?: 'cover' | 'contain'; onPresent: (index: number) => void;
  }) {
    const context = output.getContext('2d');
    if (!context) throw new Error('Canvas presentation is unavailable');
    this.context = context;context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high'; this.target = options.frame; this.stream = this.createStream(); element.dataset.desiredFrame=String(Math.round(options.frame));
    this.preload = new IntersectionObserver(entries => {
      this.warm = entries.some(entry => entry.isIntersecting);
      this.stream.setWarm((this.warm || this.active) && !document.hidden);
    }, { rootMargin: `${deviceStreamProfile(this.mobile).warmMargin}px 0px` });
    this.observer = new IntersectionObserver(entries => {
      this.active = entries.some(entry => entry.isIntersecting);
      this.stream.setWarm((this.active || this.warm) && !document.hidden);
      if (this.active) this.update(); else { cancelAnimationFrame(this.raf); this.raf = 0; }
    }, { rootMargin: '200px 0px' });
    this.resize = new ResizeObserver(() => { this.selectVariant(); this.update(); });
    this.preload.observe(element); this.observer.observe(element); this.resize.observe(element);
    document.addEventListener('visibilitychange', this.visibility);
  }
  private createStream() {
    const urls = Array.from({ length: this.options.count }, (_, index) => `${this.options.path}/${this.mobile ? 'mobile' : 'desktop'}/${this.options.prefix}${String(index).padStart(3, '0')}.webp`);
    const stream = new CriticalFrameStream(urls, this.options.bundle.variants[this.mobile ? 'mobile' : 'desktop'], deviceStreamProfile(this.mobile), this.update);
    stream.setTarget(this.target); return stream;
  }
  private selectVariant() {
    const mobile = innerWidth <= 768;
    if (this.mobile === mobile) return;
    this.stream.dispose(); this.mobile = mobile; this.stream = this.createStream(); this.lastBitmap = undefined;
    this.stream.setWarm((this.active || this.warm) && !document.hidden);
  }
  seek(frame: number) { this.target = frame; this.element.dataset.desiredFrame=String(Math.round(frame));this.selectVariant(); this.stream.setTarget(frame); this.update(); }
  private update = () => { if (!this.raf && this.active && !this.disposed && !document.hidden) this.raf = requestAnimationFrame(this.draw); };
  private visibility = () => {
    this.stream.setWarm((this.active || this.warm) && !document.hidden);
    if (document.hidden) { cancelAnimationFrame(this.raf); this.raf = 0; } else this.update();
  };
  private draw = () => {
    this.raf = 0;
    if (!this.active || document.hidden || this.disposed) return;
    this.selectVariant();
    const frame = this.stream.getFrame(); if (!frame) return;
    const r = this.element.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (!w || !h || (this.displayed === frame.index && this.fullResolution === frame.fullResolution && this.lastBitmap === frame.bitmap && w === this.lastWidth && h === this.lastHeight)) return;
    const started = performance.now();
    if (this.output.width !== w || this.output.height !== h) { this.output.width = w; this.output.height = h; }
    this.context.imageSmoothingEnabled=true;this.context.imageSmoothingQuality='high';
    this.context.clearRect(0, 0, w, h);
    const fit = this.options.fit === 'cover' ? Math.max : Math.min, scale = fit(w / frame.width, h / frame.height);
    const width = frame.width * scale, height = frame.height * scale, x = (w - width) / 2, y = (h - height) / 2;
    this.context.drawImage(frame.bitmap, x, y, width, height);
    this.displayed = frame.index; this.fullResolution = frame.fullResolution; this.lastBitmap = frame.bitmap; this.lastWidth = w; this.lastHeight = h;
    this.element.dataset.ready = 'true'; this.element.dataset.displayedFrame = String(frame.index); this.element.dataset.fullResolution = String(frame.fullResolution);
    this.draws++; this.drawMs += performance.now() - started; this.options.onPresent(frame.index);
  };
  diagnostics() {
    const state = this.stream.diagnostics();
    return { ...state, displayedFrame: this.displayed, fullResolution: this.fullResolution && this.displayed === state.desiredFrame, active: this.active, variant: this.mobile ? 'mobile' : 'desktop', draws: this.draws, previewDraws: this.previewDraws, atlasBytes: 0, averageDrawMs: this.drawMs / Math.max(1, this.draws) };
  }
  dispose() {
    this.disposed = true; cancelAnimationFrame(this.raf); this.stream.dispose();
    this.preload.disconnect(); this.observer.disconnect(); this.resize.disconnect(); document.removeEventListener('visibilitychange', this.visibility);
    delete this.element.dataset.ready;delete this.element.dataset.displayedFrame;delete this.element.dataset.desiredFrame;delete this.element.dataset.fullResolution;
  }
}
