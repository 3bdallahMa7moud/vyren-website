import { chromium } from 'playwright';
import fs from 'node:fs';
const base=process.env.VYREN_QA_URL??'http://127.0.0.1:3002';
const dir='qa/motion-story/journey';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir,size:{width:1440,height:1000}}});
const page=await context.newPage();
const report={chapters:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
let lastY;
async function glide(a,b,ms){
  await page.evaluate(async({a,b,ms})=>{
    await new Promise(resolve=>{const start=performance.now();function step(now){const p=Math.min(1,(now-start)/ms);scrollTo({top:a+(b-a)*p,behavior:'instant'});if(p<1)requestAnimationFrame(step);else resolve();}requestAnimationFrame(step);});
  },{a,b,ms});
}
async function chapter(selector,from,to,seconds){
  const range=await page.locator(selector).evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,span:el.offsetHeight-innerHeight}));
  const begin=range.top+range.span*from,end=range.top+range.span*to;
  if(lastY!==undefined&&Math.abs(begin-lastY)>1)await glide(lastY,begin,1800);
  else await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),begin);
  await page.waitForTimeout(1000);
  const start=Date.now();
  await glide(begin,end,seconds*1000);lastY=end;
  await page.waitForTimeout(700);report.chapters.push({selector,from,to,elapsedMs:Date.now()-start});
}
try{
  await page.goto(base,{waitUntil:'networkidle'});
  await chapter('.movement',0,1,7);
  await chapter('.assembly',0,1,6);
  await chapter('.materials',0,1,10);
  await chapter('.materials',1,0,6);
  await page.locator('.viewer-body').scrollIntoViewIfNeeded();await page.waitForTimeout(1200);
  await page.screenshot({path:`${dir}/studio.png`});
}finally{
  const video=page.video();await context.close();await video.saveAs(`${dir}/motion-story-journey.webm`);await browser.close();
  fs.writeFileSync(`${dir}/timing.json`,JSON.stringify(report,null,2));
}
console.log(JSON.stringify(report));
