/** A film frame always contains an unmodified, full-resolution source render. */
export type FilmFrame = { bitmap: ImageBitmap; index: number; fullResolution: true; width: number; height: number };
