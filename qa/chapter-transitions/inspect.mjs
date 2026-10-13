import { chromium } from 'playwright';
import fs from 'node:fs';
const browser = await chromium.launch({channel:'msedge', headless:true, args:['--disable-gpu']});
const data=[];
try {
  for (const [width,height] of [[1440,1000],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}});
    page.on('pageerror', e=>console.log('ERROR',e.message));
    await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(1500);
    const sections=await page.locator('main > section').evaluateAll(els=>els.map(el=>({id:el.id,top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight})));
    for(const el of await page.locator('[data-handoff]').all()) {
      const id=await el.getAttribute('data-handoff');
      const selector=id==='02-03'?'.case-film':id==='07-08'?'.dimension-image':`#${await el.getAttribute('id')}`;
      const top=await page.locator(selector).evaluate(el=>el.getBoundingClientRect().top+scrollY);
      const start=top-height*(id==='02-03'?.85:id==='07-08'?.82:.72);
      const distance=height*(id==='02-03'?.30:.28);
      for(const p of [0,.5,1]) {
        await page.evaluate(top=>scrollTo({top,behavior:'instant'}),start+distance*p);
        await page.waitForTimeout(850);
        await page.screenshot({path:`qa/chapter-transitions/${width}-${id}-${p}.png`});
        data.push({width,id,p,scroll:await page.evaluate(()=>scrollY),progress:await el.getAttribute('data-handoff-progress')});
      }
    }
    console.log('INSPECTED',width,JSON.stringify(sections));
    await page.close();
  }
}finally{fs.writeFileSync('qa/chapter-transitions/inspection.json',JSON.stringify(data,null,2));await browser.close();}
