import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
const selectors=['#manifesto','.case-film','#movement','#assembly','#materials','#experience','.dimension-image','#moment'];
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:'qa/chapter-transitions/video',size:{width:1440,height:1000}}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400);
  for(const selector of selectors){
    const bounds=await page.locator(selector).evaluate(el=>({top:el.getBoundingClientRect().top+scrollY}));
    const start=bounds.top-1000*(selector==='.case-film'?.85:selector==='.dimension-image'?.82:.72);
    const span=selector==='.case-film'?300:280;
    await page.evaluate(top=>scrollTo({top,behavior:'instant'}),start);await page.waitForTimeout(700);
    for(let i=1;i<=100;i++){await page.evaluate(top=>scrollTo({top,behavior:'instant'}),start+span*i/100);await page.waitForTimeout(24);}
    await page.waitForTimeout(500);
    for(let i=60;i>=0;i--){await page.evaluate(top=>scrollTo({top,behavior:'instant'}),start+span*i/60);await page.waitForTimeout(18);}
    await page.waitForTimeout(400);
  }
  const video=page.video();await context.close();
  fs.copyFileSync(await video.path(),'qa/chapter-transitions/chapter-transitions.webm');
}finally{await browser.close();}
console.log('Transition preview recorded');
