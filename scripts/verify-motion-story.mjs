import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const dir = 'qa/motion-story'; fs.mkdirSync(dir, { recursive: true });
const base = process.env.VYREN_QA_URL ?? 'http://127.0.0.1:3001';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const result = { cases: [], errors: [], warnings: [], failedResponses: [] };
const hash = value => createHash('sha256').update(value).digest('hex');
async function scroll(page, selector, progress, study = false) {
  await page.locator(selector).evaluate((el, { progress, study }) => {
    const top = el.getBoundingClientRect().top + scrollY;
    const start = study ? top - innerHeight * .72 : top;
    const span = study ? el.offsetHeight + innerHeight * .3 : el.offsetHeight - innerHeight;
    scrollTo({ top: start + progress * span, behavior: 'instant' });
  }, { progress, study });
}
async function frame(page, kind, expected) {
  await page.waitForFunction(({ kind, expected }) => {
    const d = window.__VYREN_STORY?.[kind]?.();
    return d?.displayedFrame === expected && d.fullResolution;
  }, { kind, expected }, { timeout: 20000 });
  return page.evaluate(kind => window.__VYREN_STORY[kind](), kind);
}
async function still(page, selector) {
  await page.waitForTimeout(600);
  const a = await page.locator(selector).evaluate(el => el.toDataURL());
  await page.waitForTimeout(700);
  const b = await page.locator(selector).evaluate(el => el.toDataURL());
  assert.equal(hash(a), hash(b), 'A photographic study must stay still when the scroll stops');
  return hash(a);
}
try {
  for (const [width, height] of [[1440, 1000], [1366, 768], [390, 844], [360, 740]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', e => result.errors.push(e.message));
    page.on('console', m => { if (m.type() === 'warning' && m.text().includes('Element not found')) result.warnings.push(m.text()); });
    page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) result.failedResponses.push([r.status(), r.url()]); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('main > section').count(), 9);
    assert.equal(await page.locator('.hero-sculpting,.hero-light-veil,.microscope-controls,.material-panel button,.material-panel input').count(), 0);
    assert.equal(await page.getByText('TRACE THE LIGHT', { exact: true }).count(), 0);
    assert.equal(await page.locator('.material-sapphire .material-camera > picture img').getAttribute('src'), '/assets/motion-story-v1/sapphire-poster-1600.webp');
    const movement = [], hashes = [];
    for (const p of [0, .25, .51, .75, 1, .51, 0]) {
      await scroll(page, '.movement', p);
      const d = await frame(page, 'movement', Math.round(p * 47)); movement.push(d);
      if (p === .51 && hashes.length === 0) {
        hashes.push(await still(page, '.story-movement canvas'));
        await page.screenshot({ path: `${dir}/movement-${width}.png` });
      }
    }
    assert.ok(movement.every(d => d.peakCacheFrames <= d.cacheLimit && d.failedFrames === 0));
    const materials = [];
    for (const [i, kind] of ['titanium', 'sapphire', 'anthracite', 'rubber'].entries()) {
      const seen = [];
      for (const p of [0, .53, 1, .53]) {
        if (width > 768) await scroll(page, '.materials', i * .28 + p * .16);
        else await scroll(page, `.material-${kind}`, p, true);
        if (kind === 'titanium') {
          // Titanium uses the existing nine-light Cycles study.
          if (width <= 768) await page.locator('.material-titanium .light-inspection').evaluate((el, p) => {
            const r = el.getBoundingClientRect(); scrollTo({ top: r.top + scrollY - innerHeight * .8 + p * (r.height + innerHeight * .55), behavior: 'instant' });
          }, p);
          await page.waitForFunction(expected => Number(document.querySelector('.material-titanium .cycles-surface').dataset.displayedFrame) === expected, Math.round(p * 8));
          seen.push(Math.round(p * 8));
        } else { seen.push((await frame(page, kind, Math.round(p * 17))).displayedFrame); }
        if (p === .53 && seen.length === 2) {
          await page.waitForFunction(selector => {
            const clip = getComputedStyle(document.querySelector(`${selector} .material-name`)).clipPath;
            return clip === 'none' || [...clip.matchAll(/[\d.]+/g)].every(v => Number(v[0]) === 0);
          }, `.material-${kind}`);
          const image = page.locator(`.material-${kind} .material-image`);
          await page.screenshot({ path: `${dir}/${kind}-${width}.png` });
          hashes.push(await still(page, `.material-${kind} canvas`));
          assert.ok(await image.evaluate(el => el.getBoundingClientRect().right > 0 && el.getBoundingClientRect().left < innerWidth));
        }
      }
      materials.push({ kind, seen });
    }
    assert.equal(new Set(hashes).size, 5, 'Each study has a distinct authentic photograph');
    await page.locator('.viewer-body').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => window.__VYREN_STUDIO?.diagnostics().fullResolution);
    for (const [name, expected] of [['Front', 66], ['Side', 12], ['Back', 24], ['Reset', 0]]) {
      await page.locator('.studio-presets').getByRole('button', { name, exact: true }).click();
      await page.waitForFunction(expected => window.__VYREN_STUDIO?.diagnostics().displayedFrame === expected && window.__VYREN_STUDIO.diagnostics().fullResolution, expected);
    }
    await page.getByRole('button', { name: 'Free 3D', exact: true }).click();
    await page.waitForFunction(() => {
      const el = document.querySelector('.studio-image-area');
      return el.dataset.visibleMode === 'free' && el.dataset.transitioning === 'false';
    });
    await page.getByRole('button', { name: 'Studio', exact: true }).click();
    await page.waitForFunction(() => {
      const el = document.querySelector('.studio-image-area');
      const d = window.__VYREN_STUDIO?.diagnostics();
      return el.dataset.visibleMode === 'studio' && el.dataset.transitioning === 'false' && d?.fullResolution && d.displayedFrame === 0;
    });
    await page.screenshot({ path: `${dir}/studio-${width}.png` });
    await scroll(page, '.assembly', .72);
    await page.waitForFunction(() => {
      const d = window.__VYREN_SEQUENCE?.diagnostics();
      return d?.ready && d.displayedFrame === d.desiredFrame && Math.abs(d.displayedFrame - 115) <= 1;
    });
    const exploded = await page.evaluate(() => window.__VYREN_SEQUENCE?.diagnostics());
    assert.ok(exploded.failedFrames === 0 && Object.values(exploded.displayedFactors).every(f => f === 1));
    await scroll(page, '.assembly', 1);
    await page.waitForFunction(() => window.__VYREN_SEQUENCE?.diagnostics().displayedFrame === 160);
    assert.equal((await page.evaluate(() => window.__VYREN_SEQUENCE.diagnostics())).restMatrixDelta, 0);
    await scroll(page, '.assembly', .72);
    await page.waitForFunction(() => {
      const d = window.__VYREN_SEQUENCE?.diagnostics();
      return d?.displayedFrame === d?.desiredFrame && Math.abs(d.displayedFrame - 115) <= 1;
    });
    assert.ok(Object.values((await page.evaluate(() => window.__VYREN_SEQUENCE.diagnostics())).displayedFactors).every(f => f === 1));
    const finalFrames = [];
    // The closing watch stays centered while its lighting and camera turn finish.
    for (const p of [0, .55, 1]) {
      await page.locator('.finale').evaluate((el, p) => {
        const top = el.getBoundingClientRect().top + scrollY;
        scrollTo({ top: top + p * (el.offsetHeight - innerHeight), behavior: 'instant' });
      }, p);
      const expected = Math.round(Math.min(1, p / .76) * 71);
      await page.waitForFunction(expected => window.__VYREN_FINALE?.().displayedFrame === expected && window.__VYREN_FINALE().fullResolution, expected);
      finalFrames.push(expected);
    }
    await page.screenshot({ path: `${dir}/finale-${width}.png` });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.movement').scrollIntoViewIfNeeded();
    await frame(page, 'movement', 30);
    for (const kind of ['sapphire', 'anthracite', 'rubber']) {
      await page.locator(`.material-${kind}`).scrollIntoViewIfNeeded(); await frame(page, kind, 9);
    }
    assert.ok((await page.evaluate(() => window.__VYREN_MOTION())).reducedMotion);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await scroll(page, '.movement', 1); await frame(page, 'movement', 47);
    assert.equal((await page.evaluate(() => window.__VYREN_MOTION())).assemblyTriggers, 1);
    await page.locator('.finale').scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
    const released = await page.evaluate(() => Object.entries(window.__VYREN_STORY).map(([kind, read]) => ({ kind, ...read() })));
    assert.ok(released.every(d => !d.active && d.cacheFrames === 0));
    result.cases.push({ width, height, movement: movement.map(d => d.displayedFrame), materials, finalFrames, stillWhenIdle: true, reducedMotion: true, cachesReleased: true });
    await page.close();
  }
  assert.deepEqual(result.errors, []); assert.deepEqual(result.warnings, []); assert.deepEqual(result.failedResponses, []);
  result.passed = true;
} finally { fs.writeFileSync(`${dir}/verification.json`, JSON.stringify(result, null, 2)); await browser.close(); }
console.log(JSON.stringify(result, null, 2));
