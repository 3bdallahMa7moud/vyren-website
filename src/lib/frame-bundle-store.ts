export type FrameBundleVariant = {
  width: number; height: number; bytes: number; frameMap: number[];
  sources: { url: string; pack: number; offset: number; bytes: number; digest: string }[];
  packs: { url: string; bytes: number; digest: string }[];
};
export type FrameBundleSpec = { count: number; variants: Record<'desktop' | 'mobile', FrameBundleVariant> };

/** Keep compressed original pixels; decode only the bounded neighbouring frames. */
export class FrameBundleStore {
  private entries = new Map<number, { bytes: Uint8Array; used: number }>();
  private pending = new Map<number, AbortController>();
  private wanted: number[] = [];
  private retries = new Map<number, number>();
  private attempts = new Map<number, number>();
  private generation = 0;
  private disposed = false;
  private lookup: Map<string, FrameBundleVariant['sources'][number]>;
  private retryTimer?: ReturnType<typeof setTimeout>;
  downloadedBytes = 0; fetches = 0; failures = 0; peakBytes = 0;
  constructor(readonly variant: FrameBundleVariant, private limit: number, private concurrency: number, private changed: () => void) {
    this.lookup = new Map(variant.sources.map(source => [source.url, source]));
  }
  request(index: number, direction: number) {
    if (this.disposed) return;
    const step = direction < 0 ? -1 : 1, order = [index];
    for (let next = index + step; next >= 0 && next < this.variant.frameMap.length; next += step) order.push(next);
    for (let next = index - step; next >= 0 && next < this.variant.frameMap.length; next -= step) order.push(next);
    this.wanted = [...new Set(order.map(frame => this.variant.sources[this.variant.frameMap[frame]].pack))].slice(0, this.limit);
    this.pump();
  }
  getBlob(url: string): Blob | undefined {
    const source = this.lookup.get(url); if (!source) return;
    const entry = this.entries.get(source.pack); if (!entry) return;
    entry.used = performance.now();
    return new Blob([entry.bytes.slice(source.offset, source.offset + source.bytes)], { type: 'image/webp' });
  }
  has(url: string) { const source = this.lookup.get(url); return !!source && this.entries.has(source.pack); }
  private pump() {
    while (!this.disposed && this.pending.size < this.concurrency) {
      const index = this.wanted.find(index => !this.entries.has(index) && !this.pending.has(index) && (this.attempts.get(index) ?? 0) < 3 && (this.retries.get(index) ?? 0) <= performance.now());
      if (index === undefined) break;
      const controller = new AbortController(), generation = this.generation;
      this.pending.set(index, controller); this.fetches++;
      void (async () => {
        try {
          const response = await fetch(this.variant.packs[index].url, { signal: controller.signal, cache: 'force-cache' });
          if (!response.ok) throw new Error('Original frame bundle unavailable');
          const bytes = new Uint8Array(await response.arrayBuffer()); this.downloadedBytes += bytes.byteLength;
          if (this.disposed || controller.signal.aborted || generation !== this.generation) return;
          if (bytes.byteLength !== this.variant.packs[index].bytes) throw new Error('Incomplete original frame bundle');
          this.entries.set(index, { bytes, used: performance.now() });
          while (this.entries.size > this.limit) {
            const oldest = [...this.entries].filter(([key]) => key !== this.wanted[0]).sort((a, b) => a[1].used - b[1].used)[0];
            if (!oldest) break; this.entries.delete(oldest[0]);
          }
          this.peakBytes = Math.max(this.peakBytes, this.bytes()); this.changed();
        } catch {
          if (!controller.signal.aborted && !this.disposed && generation === this.generation) {
            this.failures++; this.attempts.set(index, (this.attempts.get(index) ?? 0) + 1); this.retries.set(index, performance.now() + 1500);
            clearTimeout(this.retryTimer); this.retryTimer = setTimeout(() => this.pump(), 1600);
            this.changed();
          }
        } finally { if (this.pending.get(index) === controller) this.pending.delete(index); this.pump(); }
      })();
    }
  }
  private bytes() { return [...this.entries.values()].reduce((sum, entry) => sum + entry.bytes.byteLength, 0); }
  diagnostics() { return { bundleFramesAvailable: this.variant.sources.filter(source => this.entries.has(source.pack)).length, bundleCount: this.entries.size, bundleLimit: this.limit, bundlePending: this.pending.size, bundleRequests: this.fetches, bundleFailures: this.failures, bundleDownloadedBytes: this.downloadedBytes, bundleEncodedBytes: this.bytes(), peakBundleEncodedBytes: this.peakBytes }; }
  release() {
    this.generation++; this.wanted = []; clearTimeout(this.retryTimer); this.retries.clear(); this.attempts.clear();
    for (const controller of this.pending.values()) controller.abort(); this.entries.clear();
  }
  dispose() { this.disposed = true; this.release(); }
}
