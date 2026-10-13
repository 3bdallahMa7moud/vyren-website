export type StreamProfile = { limit: number; concurrency: number; lead: number; warmMargin: number };

/** Budget decoded pixels, rather than treating every device as a desktop. */
export function streamProfile(mobile: boolean, memory?: number, saveData = false): StreamProfile {
  if (saveData || (memory !== undefined && memory < 4)) return { limit: 2, concurrency: 1, lead: 1, warmMargin: 600 };
  if (mobile) return { limit: 6, concurrency: 2, lead: 4, warmMargin: 1000 };
  return { limit: memory !== undefined && memory >= 8 ? 16 : 10, concurrency: 3, lead: memory !== undefined && memory >= 8 ? 10 : 6, warmMargin: 1800 };
}

export function deviceStreamProfile(mobile: boolean) {
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return streamProfile(mobile, device.deviceMemory, !!device.connection?.saveData);
}

export function directedFrames(index: number, count: number, direction: number, lead: number): number[] {
  const step = direction < 0 ? -1 : 1;
  const offsets = [0, step, ...(lead >= 2 ? [2 * step] : []), -step, ...Array.from({ length: Math.max(0, lead - 2) }, (_, i) => (i + 3) * step)];
  return [...new Set(offsets.map(offset => index + offset).filter(frame => frame >= 0 && frame < count))].slice(0, lead + 2);
}
