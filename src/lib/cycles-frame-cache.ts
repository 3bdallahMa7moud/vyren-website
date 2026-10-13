type Entry = { bitmap: ImageBitmap; used: number; bytes: number };
/** Shared by the new orbit, light studies and camera film. Exploded cache stays intact. */
export class CyclesFrameCache {
  private entries = new Map<string, Entry>();
  private pending = new Map<string, AbortController>();
  private queue: string[] = [];
  private wanted: string[] = [];
  private retries = new Map<string, number>();
  private attempts = new Map<string, number>();
  private disposed = false;
  private generation = 0;
  private retryTimer?: ReturnType<typeof setTimeout>;
  downloadedBytes = 0; fetches = 0; failures = 0; aborted = 0; peakBytes = 0; peakFrames = 0;
  constructor(readonly limit: number, private concurrency: number, private changed: () => void) {}
  request(urls: string[]) {
    if (this.disposed) return;
    this.wanted = [...new Set(urls)];
    for (const [url, controller] of this.pending) if (!this.wanted.includes(url)) controller.abort();
    this.queue = this.wanted.filter(url => !this.entries.has(url) && !this.pending.has(url) && (this.attempts.get(url) ?? 0) < 3 && (this.retries.get(url) ?? 0) < performance.now());
    this.pump();
  }
  get(url: string) { const entry = this.entries.get(url); if (entry) entry.used = performance.now(); return entry?.bitmap; }
  private pump() {
    while (!this.disposed && this.pending.size < this.concurrency && this.queue.length) {
      const url = this.queue.shift()!, controller = new AbortController(), generation = this.generation;
      this.pending.set(url, controller); this.fetches++;
      void (async () => {
        try {
          const response = await fetch(url, { signal: controller.signal, cache: 'force-cache' });
          if (!response.ok) throw new Error(`Cycles image ${response.status}`);
          const blob = await response.blob(); this.downloadedBytes += blob.size;
          const bitmap = await createImageBitmap(blob);
          if (this.disposed || controller.signal.aborted || generation !== this.generation) { bitmap.close(); return; }
          this.entries.set(url, { bitmap, used: performance.now(), bytes: bitmap.width * bitmap.height * 4 });
          while (this.entries.size > this.limit) {
            const candidate = [...this.entries].filter(([key]) => key !== this.wanted[0]).sort((a, b) => a[1].used - b[1].used)[0];
            if (!candidate) break;
            candidate[1].bitmap.close(); this.entries.delete(candidate[0]);
          }
          this.peakFrames = Math.max(this.peakFrames, this.entries.size); this.peakBytes = Math.max(this.peakBytes, this.bytes());
          this.retries.delete(url); this.changed();
        } catch {
          if (controller.signal.aborted) this.aborted++;
          else if (!this.disposed) {
            this.failures++; this.attempts.set(url, (this.attempts.get(url) ?? 0) + 1); this.retries.set(url, performance.now() + 1500);
            clearTimeout(this.retryTimer);
            this.retryTimer = setTimeout(() => { this.request(this.wanted); this.changed(); }, 1600);
          }
        } finally {
          if (this.pending.get(url) === controller) this.pending.delete(url);
          // A new target may have arrived while an obsolete request was aborting.
          this.queue = this.wanted.filter(key => !this.entries.has(key) && !this.pending.has(key) && (this.attempts.get(key) ?? 0) < 3 && (this.retries.get(key) ?? 0) < performance.now());
          this.pump();
        }
      })();
    }
  }
  private bytes() { return [...this.entries.values()].reduce((n, e) => n + e.bytes, 0); }
  diagnostics() { return { cacheFrames: this.entries.size, cacheLimit: this.limit, decodedBytes: this.bytes(), peakDecodedBytes: this.peakBytes, peakCacheFrames: this.peakFrames, pending: this.pending.size, downloadedBytes: this.downloadedBytes, fetches: this.fetches, failedFrames: this.failures, abortedRequests: this.aborted }; }
  release() { this.generation++; this.queue = []; this.wanted = []; clearTimeout(this.retryTimer); for (const controller of this.pending.values()) controller.abort(); for (const entry of this.entries.values()) entry.bitmap.close(); this.entries.clear(); }
  dispose() { this.disposed = true; this.release(); }
}
