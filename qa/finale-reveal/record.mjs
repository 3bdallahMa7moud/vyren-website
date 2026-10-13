import { chromium } from 'playwright';
import fs from 'node:fs';
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--disable-gpu'] });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, recordVideo: { dir: 'qa/finale-reveal/video', size: { width: 1440, height: 1000 } } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/#moment', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const bounds = await page.locator('.finale').evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, span: el.offsetHeight - innerHeight }));
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), bounds.top);
  await page.waitForFunction(() => window.__VYREN_FINALE?.().displayedFrame === 0);
  await page.waitForTimeout(600);
  for (let i = 0; i <= 150; i++) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), bounds.top + bounds.span * i / 150);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(2200);
  for (let i = 100; i >= 0; i--) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), bounds.top + bounds.span * i / 100);
    await page.waitForTimeout(35);
  }
  await page.waitForTimeout(1100);
  const video = page.video();
  await context.close();
  await video.saveAs('qa/finale-reveal/finale-reveal.webm');
  console.log('FINALE_VIDEO_SAVED');
} finally { await browser.close(); }
