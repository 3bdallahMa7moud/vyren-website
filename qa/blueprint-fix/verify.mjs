import { chromium } from 'playwright';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const output = 'qa/blueprint-fix';
const base = process.env.VYREN_QA_URL ?? 'http://127.0.0.1:3001';
fs.mkdirSync(output, { recursive: true });
const original = fs.readFileSync('public/assets/phase3-signatures/blueprint.svg');
const digest = data => createHash('sha256').update(data).digest('hex');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = { sourceHash: digest(original), cases: [], errors: [] };
const inspect = page => page.locator('.blueprint-morph').evaluate(el => ({
  clip: getComputedStyle(el).clipPath,
  visibility: getComputedStyle(el).visibility,
  src: el.querySelector('img').currentSrc,
  top: el.getBoundingClientRect().top,
  scroll: scrollY,
}));
const complete = page => page.waitForFunction(() => {
  const el = document.querySelector('.blueprint-morph');
  const style = getComputedStyle(el);
  return style.visibility === 'visible' && (style.clipPath === 'none' ||
    [...style.clipPath.matchAll(/[\d.]+/g)].every(value => Number(value[0]) === 0));
});
const enter = page => page.evaluate(() => {
  const image = document.querySelector('.dimension-image');
  scrollTo({ top: image.getBoundingClientRect().top + scrollY - innerHeight * .8, behavior: 'instant' });
});
const capture = async (page, name) => {
  await page.locator('.dimension-image').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const line = getComputedStyle(document.querySelector('.dimension-line'));
    return getComputedStyle(document.querySelector('.dimension-number')).opacity === '1' &&
      (line.transform === 'none' || Math.abs(new DOMMatrix(line.transform).a - 1) < .001);
  });
  assert.equal(await page.locator('.dimension-number').textContent(), '41');
  await page.locator('.dimension-image').screenshot({ path: `${output}/${name}.png` });
};
try {
  for (const width of [360, 390, 768, 1440, 1857]) {
    const page = await browser.newPage({ viewport: { width, height: width <= 768 ? 844 : 1000 } });
    page.on('pageerror', error => report.errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await enter(page);
    await page.waitForTimeout(100);
    const initial = await inspect(page);
    await complete(page);
    const finished = await inspect(page);
    assert.equal(finished.scroll, initial.scroll, 'Reveal must finish without additional scrolling');
    const response = await page.request.get(finished.src);
    assert.equal(response.status(), 200);
    assert.equal(digest(await response.body()), report.sourceHash, 'Serve the complete, original detailed SVG');
    assert.match(new URL(finished.src).pathname, /^\/_next\/static\/media\/blueprint\.[^/]+\.svg$/);
    await capture(page, `details-${width}`);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(150);
    await enter(page);
    await page.waitForTimeout(150);
    await complete(page);
    const revisited = await inspect(page);
    assert.equal(revisited.clip, finished.clip, 'Returning must retain the complete blueprint');
    await page.reload({ waitUntil: 'networkidle' });
    await enter(page);
    await complete(page);
    assert.equal((await inspect(page)).src, finished.src);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    report.cases.push({ width, initial, finished, revisited, cacheControl: response.headers()['cache-control'] });
    await page.close();
  }
  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  reduced.on('pageerror', error => report.errors.push(error.message));
  await reduced.goto(`${base}/#details`, { waitUntil: 'networkidle' });
  await complete(reduced);
  assert.equal((await inspect(reduced)).clip, 'none', 'Reduced motion must show the full drawing without a wipe');
  await capture(reduced, 'details-reduced-motion');
  report.cases.push({ name: 'reduced-motion-and-details-anchor', ...await inspect(reduced) });
  await reduced.close();

  const slow = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  slow.on('pageerror', error => report.errors.push(error.message));
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await slow.route('**/_next/static/media/blueprint*.svg', async route => {
    await held;
    await route.continue();
  });
  await slow.goto(base, { waitUntil: 'domcontentloaded' });
  await enter(slow);
  await slow.waitForTimeout(900);
  const waiting = await inspect(slow);
  assert.equal(waiting.visibility, 'hidden', 'Retain the original photo while the SVG is loading');
  assert.ok(await slow.locator('.dimension-image .product-media img').evaluate(img => img.complete && img.naturalWidth > 0));
  release();
  await complete(slow);
  const loaded = await inspect(slow);
  assert.equal(loaded.scroll, waiting.scroll);
  await capture(slow, 'details-delayed-image');
  report.cases.push({ name: 'delayed-image', waiting, loaded });
  await slow.close();
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify({ passed: report.cases.length, sourceHash: report.sourceHash, errors: report.errors }));
} finally {
  fs.writeFileSync(`${output}/verification.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
