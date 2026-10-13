import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
const out = 'qa/craft-motion-fix';
const captures = JSON.parse(fs.readFileSync(`${out}/after.json`, 'utf8'));
const scale = value => Number(value.match(/matrix\(([^,]+)/)?.[1] ?? 1);
for (const c of captures) {
  assert.deepEqual(c.errors, []);
  assert.ok(c.samples.every(s => s.lightInMovingImage && !s.overflow && s.scaleDisplay !== 'none'));
  const [early, surface, , crown, , reverse] = c.samples;
  if (c.reduced) {
    assert.ok(c.samples.every(s => s.frame === '4' && s.transform === 'none'));
  } else {
    assert.ok(scale(early.transform) - scale(crown.transform) > .08, 'The visible lighting photograph must move clearly');
    assert.notEqual(early.paint, surface.paint, 'The studio lighting changes with the scroll');
    assert.ok(crown.stack.includes('case-crown-image'), 'The crown view must paint above the lighting plane');
    assert.equal(crown.crownClip, 'inset(0px 0% 0px 0px)');
    assert.equal(reverse.frame, surface.frame);
    assert.ok(Math.abs(scale(reverse.transform) - scale(surface.transform)) < .0003);
    assert.equal(c.idle.paint, reverse.paint, 'Lighting stops when scrolling stops');
    assert.equal(c.idle.transform, reverse.transform);
  }
}
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const regressions = [];
try {
  for (const [width, height] of [[1440, 1000], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('main > section').count(), 9);
    assert.equal(await page.locator('.hero-sculpting,.hero-light-veil,.microscope-controls,.material-panel button,.material-panel input').count(), 0);
    assert.equal(await page.getByText('TRACE THE LIGHT', { exact: true }).count(), 0);
    await page.locator('.craftsmanship').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1100);
    const craftBounds = await page.locator('.case-film').evaluate(el => ({ start: el.getBoundingClientRect().top + scrollY - innerHeight * .8, span: el.offsetHeight + innerHeight * .55 }));
    const crownMotion = [];
    for (const p of [.8, .98, .8]) {
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), craftBounds.start + craftBounds.span * p);
      await page.waitForTimeout(1000);
      crownMotion.push(await page.locator('.case-crown-image').evaluate(el => getComputedStyle(el).transform));
    }
    assert.ok(scale(crownMotion[1]) - scale(crownMotion[0]) > .025);
    assert.ok(Math.abs(scale(crownMotion[2]) - scale(crownMotion[0])) < .0003);
    const titanium = [];
    for (const p of [0, .5, 1, .5, 0]) {
      await page.locator(width > 768 ? '.materials' : '.material-titanium .light-inspection').evaluate((el, p) => {
        const top = el.getBoundingClientRect().top + scrollY;
        const desktop = innerWidth > 768;
        scrollTo({ top: desktop ? top + (el.offsetHeight - innerHeight) * .16 * p : top - innerHeight * .8 + (el.offsetHeight + innerHeight * .55) * p, behavior: 'instant' });
      }, p);
      const expected = Math.round(p * 8);
      await page.waitForFunction(expected => Number(document.querySelector('.material-titanium .cycles-surface').dataset.displayedFrame) === expected, expected);
      titanium.push(expected);
    }
    await page.locator('.finale').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * .57, behavior: 'instant' }));
    await page.waitForTimeout(900);
    assert.equal(await page.locator('.finale').evaluate(el => getComputedStyle(el).overflow), 'clip');
    assert.ok(await page.locator('.finale').evaluate(el => {
      const r = el.getBoundingClientRect();
      return [.15, .3, .45].every(x => !document.elementsFromPoint(x * innerWidth, r.top - 10).some(node => el.contains(node)));
    }), 'The ninth section must remain inside its own boundary');
    assert.deepEqual(errors, []);
    regressions.push({ width, height, crownMotion, titanium, controlsAbsent: true, finaleContained: true, errors });
    await page.close();
  }
} finally { await browser.close(); }
const result = { captureCases: captures.length, normalMotionCases: captures.filter(c => !c.reduced).length, reducedMotionCases: captures.filter(c => c.reduced).length, visibleMotion: true, lightingReversible: true, idleStable: true, errors: [], regressions };
fs.writeFileSync(`${out}/verification.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
