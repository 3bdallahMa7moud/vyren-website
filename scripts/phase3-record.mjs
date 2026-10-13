import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='qa/phase3/recordings';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:out,size:{width:1440,height:1000}}});
const page=await context.newPage(),video=page.video(),marks=[],start=Date.now();
async function glide(target,duration){await page.evaluate(async({target,duration})=>{const from=scrollY,started=performance.now();await new Promise(resolve=>{function frame(now){const p=Math.min(1,(now-started)/duration);scrollTo({top:from+(target-from)*p,behavior:'instant'});if(p<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});},{target,duration});}
try{
 await page.goto('http://127.0.0.1:3001/');await page.waitForTimeout(3600);
 for(const id of ['manifesto','craftsmanship','movement','assembly','materials','experience','details','moment']){
  const target=await page.evaluate(id=>{const e=document.getElementById(id);return e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*.65;},id);marks.push({id,elapsed:Date.now()-start});await glide(target,2000);await page.waitForTimeout(1600);
  if(id==='movement'){await page.getByRole('button',{name:'Hairspring',exact:false}).click();await page.locator('.microscope-study img').evaluate(e=>e.decode());await page.waitForTimeout(1000);await page.getByRole('button',{name:'Overall view',exact:false}).click();}
  if(id==='experience'){
   await glide(await page.locator('.studio-toolbar').evaluate(e=>e.getBoundingClientRect().top+scrollY-88),700);
   for(const name of ['Side','Back','3/4 View']){await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(950);await page.waitForFunction(()=>window.__VYREN_STUDIO.diagnostics().fullResolution);}
   await page.getByRole('button',{name:'Inspect Dial',exact:true}).click();await page.locator('.macro-dialog img').evaluate(e=>e.decode());await page.waitForTimeout(1200);await page.keyboard.press('Escape');
  }
 }
 await page.waitForTimeout(1200);
}finally{await page.close();await context.close();await video.saveAs(`${out}/phase3-journey.webm`);fs.writeFileSync(`${out}/timing.json`,JSON.stringify(marks,null,2));await browser.close();}
console.log('Recorded actual production browser journey.');
