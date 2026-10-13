import { chromium } from 'playwright';
import fs from 'node:fs';
const out='qa/motion-story-layout';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const report=[];
try {
  for(const [width,height] of [[1440,1000],[1366,768],[390,844],[360,740]]) {
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:3002',{waitUntil:'networkidle'});
    await page.evaluate(()=>{const el=document.querySelector('.movement');scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.offsetHeight-innerHeight)*.5,behavior:'instant'});});
    await page.waitForFunction(()=>window.__VYREN_STORY?.movement?.().displayedFrame===24);
    await page.waitForTimeout(800);
    await page.screenshot({path:`${out}/movement-${width}.png`});
    report.push({width,height,errors,diagnostics:await page.evaluate(()=>window.__VYREN_STORY.movement()),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
    await page.close();
  }
}finally{await browser.close();}
fs.writeFileSync(`${out}/inspection.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
