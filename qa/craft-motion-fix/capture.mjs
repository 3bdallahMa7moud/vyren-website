import { chromium } from 'playwright';
import fs from 'node:fs';
const phase = process.argv[2] ?? 'after';
const out = 'qa/craft-motion-fix';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
try {
  for (const [width, height, reduced] of [[1440, 1000, false], [1366, 768, false], [390, 844, false], [360, 740, false], [1440, 1000, true], [390, 844, true]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const film = page.locator('.case-film');
    const bounds = await film.evaluate(el => {
      const top = el.getBoundingClientRect().top + scrollY;
      return { start: top - innerHeight * .8, length: el.offsetHeight + innerHeight * .55 };
    });
    const read = () => film.evaluate(el => {
      const base = el.querySelector('.case-image'), crown = el.querySelector('.case-crown'), light = el.querySelector('.light-inspection'), surface = light.querySelector('.cycles-surface');
      const r = el.getBoundingClientRect();
      const x = innerWidth * .5, y = Math.min(innerHeight - 100, Math.max(120, r.top + r.height * .5));
      const stack = document.elementsFromPoint(x, y).filter(n => el.contains(n));
      const canvas = surface.querySelector('canvas');
      let paint = 0;
      if (canvas.width && canvas.height) {
        const bytes = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < bytes.length; i += 796) paint = (Math.imul(paint, 31) + bytes[i]) >>> 0;
      }
      return { scroll: scrollY, top: r.top, height: r.height, transform: getComputedStyle(base).transform, crownTransform: getComputedStyle(crown).transform, crownClip: getComputedStyle(crown).clipPath, frame: surface.dataset.displayedFrame, paint, lightInMovingImage: base.contains(light), lightZ: getComputedStyle(light).zIndex, crownZ: getComputedStyle(crown).zIndex, stack: stack.map(n => n.className?.baseVal ?? n.className ?? n.tagName), labelOne: getComputedStyle(el.querySelector('.macro-label-one')).opacity, labelTwo: getComputedStyle(el.querySelector('.macro-label-two')).opacity, scaleDisplay: getComputedStyle(el.querySelector('.macro-scale')).display, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    const samples = [];
    for (const p of [.08, .35, .58, .85, .98, .35]) {
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), bounds.start + bounds.length * p);
      await page.waitForTimeout(1000);
      const sample = { p, ...await read() };
      samples.push(sample);
      if ([.08, .58, .85].includes(p)) await page.screenshot({ path: `${out}/${phase}-${width}-${height}${reduced ? '-reduced' : ''}-${p}.png` });
    }
    await page.waitForTimeout(600);
    const idle = await read();
    results.push({ width, height, reduced, errors, samples, idle });
    await page.close();
  }
} finally {
  fs.writeFileSync(`${out}/${phase}.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(results.map(r => ({ width: r.width, height: r.height, reduced: r.reduced, errors: r.errors, samples: r.samples.map(s => ({ p: s.p, transform: s.transform, crownClip: s.crownClip, frame: s.frame, lightInMovingImage: s.lightInMovingImage, stack: s.stack.slice(0, 4), scaleDisplay: s.scaleDisplay })) })), null, 2));
