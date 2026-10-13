import { chromium } from 'playwright';
import sharp from 'sharp';
const source = 'D:/VYREN/04_RENDER_OUTPUT/Finale_Reveal_v1/production/reveal-071.png';
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let left = info.width, top = info.height, right = 0, bottom = 0;
for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 4) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
left -= 36; top -= 36; right += 36; bottom += 36;
const image = await sharp(source).extract({ left, top, width: right - left, height: bottom - top }).webp({ quality: 88 }).toBuffer();
const url = `data:image/webp;base64,${image.toString('base64')}`;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const [width, height] of [[1440, 1000], [1366, 768], [390, 844], [360, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.finale').evaluate((el, url) => {
      el.classList.add('finale-reveal');
      el.innerHTML = `<div class="finale-sticky"><div class="final-atmosphere"></div><div class="final-topline"><div class="eyebrow"><span class="scene-number">09</span><span>THE FINAL CHAPTER</span></div><span class="small-label">NOCTIS 01 / VYREN</span></div><div class="final-composition"><div class="final-product"><picture class="product-media"><img src="${url}" alt="Watch" /></picture></div><div class="final-copy"><h2 id="final-title"><span>Own the</span> <em>moment.</em></h2><p>VYREN NOCTIS 01 — An exploration of precision.</p><a class="button button-ivory" href="#experience">Enter the Studio ↗</a></div></div><div class="final-footer"><span class="wordmark">VYREN</span><span>TIME, REDEFINED.</span><a href="#watch">Back to top ↗</a></div></div>`;
      scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' });
    }, url);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `qa/finale-reveal/layout-${width}-${height}.png` });
    console.log(JSON.stringify(await page.locator('.finale').evaluate(el => {
      const copy = el.querySelector('.final-copy').getBoundingClientRect(), product = el.querySelector('.final-product').getBoundingClientRect(), footer = el.querySelector('.final-footer').getBoundingClientRect();
      return { width: innerWidth, productHeight: product.height, productBottom: product.bottom, copyTop: copy.top, copyBottom: copy.bottom, footerTop: footer.top, overflow: document.documentElement.scrollWidth > innerWidth };
    })));
    await page.close();
  }
} finally { await browser.close(); }
