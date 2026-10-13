import {chromium} from 'playwright';
import fs from 'node:fs';
const phase=process.argv[2]??'after';
const out='qa/finale-boundary-fix';
const browser=await chromium.launch({channel:'msedge',headless:true});
const result=[];
try{
  for(const [width,height,reduced] of [[1907,282,false],[1440,1000,false],[390,844,false],[1440,1000,true]]){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    const entry=async()=>page.locator('.finale').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.57,behavior:'instant'}));
    await entry();await page.waitForTimeout(1300);
    await page.screenshot({path:`${out}/${phase}-${width}-${height}${reduced?'-reduced':''}.png`});
    const read=()=>page.locator('.finale').evaluate(el=>{
      const r=el.getBoundingClientRect(),product=el.querySelector('.final-product'),paint=[];
      for(const x of [.15,.3,.45])for(const y of [r.top-10,r.top-60]){
        if(y>=0&&y<innerHeight)paint.push({x:x*innerWidth,y,finaleAboveBoundary:document.elementsFromPoint(x*innerWidth,y).some(node=>el.contains(node))});
      }
      return{sectionTop:r.top,productTop:product.getBoundingClientRect().top,paint,frame:el.querySelector('.cycles-surface').dataset.displayedFrame,horizontalOverflow:document.documentElement.scrollWidth>innerWidth};
    });
    const entering=await read();
    await page.locator('.finale').evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY+el.offsetHeight-innerHeight,behavior:'instant'}));
    await page.waitForTimeout(1000);
    const completed=await read();
    await page.screenshot({path:`${out}/${phase}-complete-${width}-${height}${reduced?'-reduced':''}.png`});
    await entry();await page.waitForTimeout(1000);
    result.push({width,height,reduced,errors,entering,completed,returning:await read()});
    await page.close();
  }
}finally{fs.writeFileSync(`${out}/${phase}.json`,JSON.stringify(result,null,2));await browser.close();}
console.log(JSON.stringify(result,null,2));
