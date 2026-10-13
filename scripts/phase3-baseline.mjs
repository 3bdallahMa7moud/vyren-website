import { chromium } from '@playwright/test';
import fs from 'node:fs';
const out='qa/phase3/before';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:3001/');await page.waitForTimeout(3000);
const initial=await page.evaluate(()=>({glb:performance.getEntriesByType('resource').filter(e=>e.name.includes('.glb')).map(e=>e.name),bytes:performance.getEntriesByType('resource').reduce((s,e)=>s+e.transferSize,0)}));
for(const id of ['watch','manifesto','craftsmanship','movement','assembly','materials','experience','details','moment']){
  await page.evaluate(id=>{const e=document.getElementById(id);scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*.56-76,behavior:'instant'});},id);
  await page.waitForTimeout(id==='experience'?10000:2000);await page.screenshot({path:`${out}/${id}.png`});
}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:3001/#experience');await page.waitForTimeout(10000);await page.screenshot({path:`${out}/mobile-studio.png`});
fs.writeFileSync(`${out}/baseline.json`,JSON.stringify({initial,errors,browser:browser.version()},null,2));
await browser.close();console.log({initial,errors});
