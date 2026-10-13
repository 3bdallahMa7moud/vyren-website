import fs from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://vyren-website-eight.vercel.app';
const output = path.resolve('qa/vercel-live-audit');
await fs.mkdir(output, { recursive: true });
async function files(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(path.join(directory, entry.name))
    : [path.join(directory, entry.name)]));
  return nested.flat();
}
const publicRoot = path.resolve('public');
const assets = (await files(publicRoot)).map(file => '/' + path.relative(publicRoot, file).split(path.sep).map(encodeURIComponent).join('/'));
const started = Date.now();
const home = await fetch(origin, { signal: AbortSignal.timeout(20000) });
const html = await home.text();
const compiled = [...new Set(Array.from(html.matchAll(/(?:src|href)="(\/_next\/[^"<>]+)"/g), match => match[1].replaceAll('&amp;', '&')))];
const checks = [...new Set([...assets, ...compiled])];
let next = 0;
const results = [];
async function worker() {
  while (next < checks.length) {
    const asset = checks[next++];
    const began = Date.now();
    let result;
    try {
      const response = await fetch(origin + asset, { method: 'HEAD', headers: { 'Accept-Encoding': 'identity' }, signal: AbortSignal.timeout(20000) });
      result = { path: asset, status: response.status, type: response.headers.get('content-type'), bytes: response.headers.get('content-length'), milliseconds: Date.now() - began };
    } catch (error) {
      result = { path: asset, status: 0, error: error.message, milliseconds: Date.now() - began };
    }
    results.push(result);
    if (results.length % 100 === 0) console.log(`ASSETS_CHECKED ${results.length}/${checks.length}`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
const report = {
  origin, testedAt: new Date().toISOString(), homeStatus: home.status,
  publicFiles: assets.length, compiledFiles: compiled.length,
  totalChecked: results.length, elapsedSeconds: (Date.now() - started) / 1000,
  failed: results.filter(result => result.status !== 200),
  localhostSharingImage: /property="og:image"[^>]*localhost/.test(html),
  results,
};
await fs.writeFile(path.join(output, 'assets.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, results: undefined }, null, 2));
if (report.homeStatus !== 200 || report.failed.length || report.localhostSharingImage) process.exitCode = 1;
