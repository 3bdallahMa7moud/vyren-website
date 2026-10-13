import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Concatenate original WebP bytes. No resize, recompression or new render.
const root = path.resolve('public');
const assembly = JSON.parse(await fs.readFile(path.join(root, 'assets/exploded-cycles/manifest.json'), 'utf8'));
const jobs = [
  { name: 'assembly', count: assembly.frameCount, sources: variant => assembly.variants[variant].urls },
  { name: 'finale', count: 72, sources: variant => Array.from({ length: 72 }, (_, i) => `/assets/finale-reveal-v1/${variant}/reveal-${String(i).padStart(3, '0')}.webp`) },
];
const summary = [];
for (const job of jobs) {
  const directory = path.join(root, 'assets/frame-bundles-v1', job.name);
  await fs.mkdir(directory, { recursive: true });
  const manifest = { version: 1, count: job.count, variants: {} };
  for (const variant of ['desktop', 'mobile']) {
    const urls = job.sources(variant), unique = [...new Set(urls)], sources = [], packs = [];
    for (let start = 0; start < unique.length; start += 12) {
      const buffers = await Promise.all(unique.slice(start, start + 12).map(url => fs.readFile(path.join(root, url.slice(1)))));
      const bytes = Buffer.concat(buffers), digest = createHash('sha256').update(bytes).digest('hex');
      const filename = `${variant}-${String(packs.length).padStart(2, '0')}-${digest.slice(0, 12)}.vfp`;
      await fs.writeFile(path.join(directory, filename), bytes);
      const pack = packs.length; let offset = 0;
      buffers.forEach((buffer, i) => {
        sources.push({ url: unique[start + i], pack, offset, bytes: buffer.length, digest: createHash('sha256').update(buffer).digest('hex') });
        offset += buffer.length;
      });
      packs.push({ url: `/assets/frame-bundles-v1/${job.name}/${filename}`, bytes: bytes.length, digest });
    }
    const dimensions = await sharp(path.join(root, urls[0].slice(1))).metadata();
    manifest.variants[variant] = { width: dimensions.width, height: dimensions.height, sources, packs, frameMap: urls.map(url => unique.indexOf(url)), bytes: packs.reduce((sum, pack) => sum + pack.bytes, 0) };
    summary.push({ sequence: job.name, variant, frames: job.count, packs: packs.length, bytes: manifest.variants[variant].bytes });
  }
  await fs.writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
}
console.log(JSON.stringify(summary, null, 2));
