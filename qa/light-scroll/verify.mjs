import { chromium } from 'playwright';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

fs.mkdirSync('qa/light-scroll', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = [], errors = [];
const cases = [
  { name: 'craft', selector: '.case-film .light-inspection', compact: false },
  { name: 'titanium', selector: '.material-titanium .light-inspection', compact: true },
];
async function seek(page, study, progress) {
  return page.locator(study.selector).evaluate((element, { progress, compact }) => {
    let start, distance;
    if (compact && innerWidth > 768) {
      const section = element.closest('.materials');
      start = section.getBoundingClientRect().top + scrollY;
      distance = (section.offsetHeight - innerHeight) * .12;
    } else {
      const rect = element.getBoundingClientRect();
      start = rect.top + scrollY - innerHeight * .8;
      distance = rect.height + innerHeight * .55;
    }
    scrollTo({ top: start + progress * distance, behavior: 'instant' });
    return { start, distance };
  }, { progress, compact: study.compact });
}
async function presented(page, selector, expected) {
  await page.waitForFunction(({ selector, expected }) => {
    const surface = document.querySelector(`${selector} .cycles-surface`);
    return surface?.dataset.ready === 'true' && Number(surface.dataset.displayedFrame) === expected;
  }, { selector, expected });
  await page.waitForTimeout(450);
  assert.equal(await page.locator(`${selector} .cycles-surface`).getAttribute('data-displayed-frame'), String(expected));
}
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:3001', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.light-inspection input, .light-inspection-control').count(), 0);
    assert.equal(await page.getByText('TRACE THE LIGHT', { exact: true }).count(), 0);
    assert.equal(await page.locator('.hero-sculpting,.hero-light-veil,.microscope-controls').count(), 0);
    for (const study of cases) {
      const frames = [];
      for (const progress of [0, .25, .5, .75, 1, .5, 0]) {
        await seek(page, study, progress);
        const expected = Math.round(progress * 8);
        await presented(page, study.selector, expected);
        frames.push(expected);
        if (progress === .5 && frames.length === 3) {
          await page.screenshot({ path: `qa/light-scroll/${study.name}-${width}.png` });
          await page.waitForTimeout(750);
          const canvas = page.locator(`${study.selector} canvas`);
          const first = await canvas.evaluate(el => el.toDataURL());
          await page.waitForTimeout(700);
          const second = await canvas.evaluate(el => el.toDataURL());
          assert.equal(createHash('sha256').update(first).digest('hex'), createHash('sha256').update(second).digest('hex'), 'Light must stay still while scroll position stays still');
        }
      }
      report.push({ width, name: study.name, frames, reversible: true, stillWhenIdle: true });
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const study of cases) {
      for (const progress of [0, .5, 1]) {
        await seek(page, study, progress);
        await presented(page, study.selector, 4);
      }
      report.push({ width, name: `${study.name}-reduced-motion`, frames: [4, 4, 4] });
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const study of cases) {
      await seek(page, study, .5);
      await presented(page, study.selector, 4);
      await seek(page, study, 1);
      await presented(page, study.selector, 8);
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: report.length, report, errors }));
} finally {
  fs.writeFileSync('qa/light-scroll/verification.json', JSON.stringify({ report, errors }, null, 2));
  await browser.close();
}
