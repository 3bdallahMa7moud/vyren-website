// Real frames from the shipped renderer, not generated product photography.
import {chromium} from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const poses=[];
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2});
  const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3001/#experience');
  await page.waitForFunction(()=>window.__VYREN?.diagnostics().activeFrames>0,{},{timeout:60000});
  await page.waitForTimeout(1200);
  await page.addStyleTag({content:'.viewer-coordinate { visibility:hidden !important; }'});
  await page.evaluate(()=>scrollTo({top:document.querySelector('.viewer-slot').getBoundingClientRect().top+scrollY-85,behavior:'instant'}));
  const box=await page.locator('[data-vyren-canvas]').boundingBox();
  const png=await page.screenshot({clip:box});
  await sharp(png).resize({width:name==='desktop'?1600:780}).webp({quality:94,effort:6}).toFile(`public/assets/viewer-poster-${name}.webp`);
  poses.push({name,viewport:[width,height],box,diagnostics:await page.evaluate(()=>window.__VYREN.diagnostics()),errors});
  await context.close();
}
fs.writeFileSync('qa/section-seven-fixes/posters.json',JSON.stringify({method:'Actual Edge WebGL canvas viewport crop at the front preset and DPR 2; responsive desktop/mobile derivatives. Studio background is identical to the live scene.',poses},null,2));
await browser.close();console.log(JSON.stringify(poses.map(p=>({name:p.name,box:p.box,ready:p.diagnostics.ready,errors:p.errors}))));
