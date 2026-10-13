import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve('qa/section-seven/viewport');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const evidence=[];
for(const [width,height] of [[1440,1000],[768,1024],[390,844],[360,640],[844,390]]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:width<=768?2:1,isMobile:width<=768,hasTouch:width<=768}),page=await context.newPage();
 await page.goto('http://127.0.0.1:3001/#experience');await page.waitForFunction(()=>window.__VYREN?.diagnostics().ready,{},{timeout:60000});await page.waitForTimeout(1100);
 await page.screenshot({path:path.join(out,`${width}x${height}-entry.png`)});
 for(const [name,label] of [['front',null],['rear','rear view'],['detail','Dial detail']]){
  if(label){await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(1150);}
  await page.evaluate(()=>scrollTo({top:document.querySelector('.viewer-body').getBoundingClientRect().top+scrollY-85,behavior:'instant'}));
  await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`${width}x${height}-${name}.png`)});
  evidence.push({size:[width,height],name,diagnostics:await page.evaluate(()=>window.__VYREN.diagnostics()),dom:await page.evaluate(()=>{const c=document.querySelector('[data-vyren-canvas]'),s=document.querySelector('.skip-link'),r=c.getBoundingClientRect();return {canvasVisibility:getComputedStyle(c).visibility,canvasRect:{x:r.x,y:r.y,width:r.width,height:r.height},skipFocus:document.activeElement===s,skipTransform:getComputedStyle(s).transform,activeElement:document.activeElement.outerHTML.slice(0,150)};})});
 }
 if(width===390){await page.getByRole('button',{name:'Reset',exact:false}).click();await page.waitForTimeout(1150);await page.screenshot({path:path.join(out,'390x844-controls.png')});}
 await context.close();
}
fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify({captureMethod:'Viewport screenshots, no element screenshot scrolling or expanded capture. These supersede the full-section composites for visual assessment.',evidence},null,2));await browser.close();console.log(JSON.stringify({screenshots:evidence.length}));
