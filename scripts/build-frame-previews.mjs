import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Delivery derivatives only: the authored full-resolution frames stay intact.
const publicRoot = path.resolve('public');
const outputRoot = path.join(publicRoot, 'assets/frame-previews-v1');
const assembly = JSON.parse(await fs.readFile(path.join(publicRoot, 'assets/exploded-cycles/manifest.json'), 'utf8'));
const jobs = [
  { name: 'assembly', count: assembly.frameCount, sources: variant => assembly.variants[variant].urls,
    tile: variant => variant === 'desktop' ? [192, 144] : [120, 160] },
  { name: 'finale', count: 72, sources: variant => Array.from({ length: 72 }, (_, i) => `/assets/finale-reveal-v1/${variant}/reveal-${String(i).padStart(3, '0')}.webp`),
    tile: variant => variant === 'desktop' ? [176, 198] : [128, 144] },
];
sharp.concurrency(2);
const summary = [];
for (const job of jobs) {
  const directory = path.join(outputRoot, job.name);
  await fs.mkdir(directory, { recursive: true });
  const manifest = { version: 1, count: job.count, variants: {} };
  for (const variant of ['desktop', 'mobile']) {
    const sources = job.sources(variant), unique = [...new Set(sources)];
    const columns = Math.ceil(Math.sqrt(unique.length)), rows = Math.ceil(unique.length / columns);
    const [cellWidth, cellHeight] = job.tile(variant);
    const tiles = new Array(unique.length), hashes = new Array(unique.length);
    let next = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (next < unique.length) {
        const index = next++, bytes = await fs.readFile(path.join(publicRoot, unique[index].slice(1)));
        hashes[index] = createHash('sha256').update(bytes).digest('hex');
        tiles[index] = { input: await sharp(bytes).resize(cellWidth, cellHeight, { fit: 'contain', background: '#00000000' }).png({ compressionLevel: 0 }).toBuffer(), left: index % columns * cellWidth, top: Math.floor(index / columns) * cellHeight };
      }
    }));
    const bytes = await sharp({ create: { width: columns * cellWidth, height: rows * cellHeight, channels: 4, background: '#00000000' } })
      .composite(tiles).webp({ quality: 74, alphaQuality: 90, effort: 6 }).toBuffer();
    const digest = createHash('sha256').update(bytes).digest('hex');
    const filename = `${variant}-${digest.slice(0, 12)}.webp`;
    await fs.writeFile(path.join(directory, filename), bytes);
    const first = await sharp(path.join(publicRoot, sources[0].slice(1))).metadata();
    manifest.variants[variant] = {
      url: `/assets/frame-previews-v1/${job.name}/${filename}`, columns, rows, cellWidth, cellHeight,
      sourceWidth: first.width, sourceHeight: first.height,
      frameMap: sources.map(source => unique.indexOf(source)), bytes: bytes.length,
      decodedBytes: columns * cellWidth * rows * cellHeight * 4,
      sourceDigest: createHash('sha256').update(hashes.join('\n')).digest('hex'),
    };
    summary.push({ sequence: job.name, variant, frames: job.count, unique: unique.length, bytes: bytes.length, decodedMiB: +(manifest.variants[variant].decodedBytes / 1048576).toFixed(2) });
  }
  await fs.writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}
console.log(JSON.stringify(summary, null, 2));
