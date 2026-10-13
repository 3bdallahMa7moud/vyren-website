export type FramePreviewVariant = {
  url: string; columns: number; rows: number; cellWidth: number; cellHeight: number;
  sourceWidth: number; sourceHeight: number; frameMap: number[]; bytes: number; decodedBytes: number;
};
export type FramePreviewSpec = { count: number; variants: Record<'desktop' | 'mobile', FramePreviewVariant> };
export type FilmFrame = {
  bitmap: ImageBitmap; index: number; fullResolution: boolean;
  crop?: { x: number; y: number; width: number; height: number };
  width: number; height: number;
};

/** One request carries every authentic pose; the full renders stay separate. */
export class FramePreview {
  private bitmap?: ImageBitmap;
  private controller?: AbortController;
  private generation = 0;
  private disposed = false;
  private retryAfter = 0;
  private attempts = 0;
  downloadedBytes = 0;
  failures = 0;
  constructor(readonly variant: FramePreviewVariant, private changed: () => void) {}
  get ready() { return !!this.bitmap; }
  load() {
    if (this.disposed || this.bitmap || this.controller || this.attempts >= 3 || performance.now() < this.retryAfter) return;
    const controller = new AbortController(), generation = this.generation;
    this.controller = controller;
    void (async () => {
      try {
        const response = await fetch(this.variant.url, { signal: controller.signal, cache: 'force-cache' });
        if (!response.ok) throw new Error('Frame overview unavailable');
        const blob = await response.blob(); this.downloadedBytes += blob.size;
        const bitmap = await createImageBitmap(blob);
        if (this.disposed || controller.signal.aborted || generation !== this.generation) { bitmap.close(); return; }
        if (bitmap.width !== this.variant.columns * this.variant.cellWidth || bitmap.height !== this.variant.rows * this.variant.cellHeight) {
          bitmap.close(); throw new Error('Frame overview dimensions do not match');
        }
        this.bitmap = bitmap;
      } catch {
        if (!controller.signal.aborted && !this.disposed) { this.failures++; this.attempts++; this.retryAfter = performance.now() + 1500; }
      } finally {
        if (this.controller === controller) this.controller = undefined;
        if (generation === this.generation && !this.disposed) this.changed();
      }
    })();
  }
  get(index: number): FilmFrame | undefined {
    const tile = this.variant.frameMap[index];
    if (!this.bitmap || tile === undefined) return;
    return { bitmap: this.bitmap, index, fullResolution: false, width: this.variant.sourceWidth, height: this.variant.sourceHeight,
      crop: { x: (tile % this.variant.columns) * this.variant.cellWidth, y: Math.floor(tile / this.variant.columns) * this.variant.cellHeight, width: this.variant.cellWidth, height: this.variant.cellHeight } };
  }
  diagnostics() { return { previewReady: this.ready, previewPending: !!this.controller, previewBytes: this.downloadedBytes, previewDecodedBytes: this.bitmap ? this.variant.decodedBytes : 0, previewFailures: this.failures }; }
  release() {
    this.generation++; this.controller?.abort(); this.controller = undefined;
    this.bitmap?.close(); this.bitmap = undefined; this.attempts = 0; this.retryAfter = 0;
  }
  dispose() { this.disposed = true; this.release(); }
}
