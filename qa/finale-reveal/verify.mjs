import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const out = 'qa/finale-reveal';
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--disable-gpu'] });
const result = { cases: [], errors: [], failedResponses: [] };
const hash = data => createHash('sha256').update(data).digest('hex');
try {
  for (const [width, height, reduced] of [[1440, 1000, false], [1366, 768, false], [390, 844, false], [360, 740, false], [1907, 282, false], [1440, 1000, true], [390, 844, true]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    page.on('pageerror', e => result.errors.push(e.message));
    page.on('response', r => { if (r.url().startsWith('http://127.0.0.1:3000/') && r.status() >= 400) result.failedResponses.push([r.status(), r.url()]); });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('main > section').count(), 9);
    assert.equal(await page.locator('.hero-sculpting,.microscope-controls,.material-panel button,.material-panel input').count(), 0);
    const section = page.locator('.finale');
    assert.equal(await section.getAttribute('id'), 'moment');
    const bounds = await section.evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, span: el.offsetHeight - innerHeight, height: el.offsetHeight }));
    const seek = async p => {
      const short = height <= 650;
      const start = short ? bounds.top - height * .75 : bounds.top;
      const span = short ? bounds.height - height * .25 : bounds.span;
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), start + span * p);
      const expected = reduced ? 71 : Math.round(Math.min(1, p / .76) * 71);
      await page.waitForFunction(expected => {
        const d = window.__VYREN_FINALE?.();
        return d?.displayedFrame === expected && d.fullResolution;
      }, expected, { timeout: 30000 });
      await page.waitForTimeout(500);
      return expected;
    };
    const samples = [];
    for (const p of reduced ? [.1, .9] : [0, .28, .56, .74, .92, 1, .56, 0]) {
      const frame = await seek(p);
      const values = await section.evaluate(el => {
        const product = el.querySelector('.final-product').getBoundingClientRect(), title = el.querySelector('h2').getBoundingClientRect(), action = el.querySelector('.button').getBoundingClientRect(), footer = el.querySelector('.final-footer').getBoundingClientRect();
        return { product: { top: product.top, bottom: product.bottom, width: product.width, height: product.height }, title: { top: title.top, bottom: title.bottom, right: title.right, width: title.width }, action: { top: action.top, bottom: action.bottom, visibility: getComputedStyle(el.querySelector('.button')).visibility }, footer: { top: footer.top }, headingOpacity: Number(getComputedStyle(el.querySelector('h2')).opacity), horizontalOverflow: document.documentElement.scrollWidth > innerWidth, diagnostics: window.__VYREN_FINALE() };
      });
      assert.equal(values.horizontalOverflow, false);
      assert.ok(values.diagnostics.peakCacheFrames <= values.diagnostics.cacheLimit);
      assert.equal(values.diagnostics.failedFrames, 0);
      samples.push({ p, frame, ...values });
      if ([0, .56, 1, .9].includes(p)) await page.screenshot({ path: `${out}/finale-${width}-${height}${reduced ? '-reduced' : ''}-${p}.png` });
      if (!reduced && p === 1 && height > 650) {
        assert.ok(values.product.bottom <= values.title.top + 1);
        assert.ok(values.action.bottom + 8 < values.footer.top);
        assert.equal(values.action.visibility, 'visible');
        assert.ok(values.headingOpacity > .99);
      }
      if (!reduced && p === .56 && samples.length === 3) {
        const canvas = page.locator('.final-product canvas');
        const a = hash(await canvas.evaluate(el => el.toDataURL()));
        await page.waitForTimeout(600);
        const b = hash(await canvas.evaluate(el => el.toDataURL()));
        assert.equal(a, b, 'The camera remains still when scrolling stops');
      }
    }
    if (!reduced && height > 650) {
      assert.equal(samples[0].action.visibility, 'hidden');
      assert.equal(samples[2].action.visibility, 'hidden');
      assert.equal(samples[2].frame, samples[6].frame);
      await seek(1);
      await page.locator('.final-copy .button').click();
      await page.waitForFunction(() => Math.abs(document.querySelector('#experience').getBoundingClientRect().top) < 200, null, { timeout: 10000 });
      assert.equal(await page.locator('.studio-shell').count(), 1);
      assert.ok(await page.locator('#experience').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 200));
    }
    // Keep the original fix at the boundary with the eighth section.
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), bounds.top - height * .57);
    await page.waitForTimeout(500);
    const clipped = await section.evaluate(el => {
      const r = el.getBoundingClientRect();
      return [.15, .3, .45, .6].every(x => !document.elementsFromPoint(x * innerWidth, r.top - 10).some(node => el.contains(node)));
    });
    assert.ok(clipped, 'Finale paint must stay inside its section');
    result.cases.push({ width, height, reduced, samples, boundaryContained: clipped });
    fs.writeFileSync(`${out}/verification.json`, JSON.stringify(result, null, 2));
    console.log('FINALE_VERIFIED', width, height, reduced ? 'reduced' : 'motion');
    await page.close();
  }
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.failedResponses, []);
} finally {
  fs.writeFileSync(`${out}/verification.json`, JSON.stringify(result, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ cases: result.cases.length, errors: result.errors, failedResponses: result.failedResponses }, null, 2));
