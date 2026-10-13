import {chromium} from '@playwright/test';
import fs from 'node:fs';
const out='qa/phase3/after';const browser=await chromium.launch({channel:'msedge',headless:true});const evidence=[];
async function scene(page,id,p=0){await page.evaluate(({id,p})=>{const e=document.getElementById(id);scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*p-76,behavior:'instant'});},{id,p});await page.waitForTimeout(2000);}
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:3001/');
 await scene(page,'movement',.55);for(const name of ['Balance','Hairspring','Bridge']){await page.getByRole('button',{name,exact:false}).click();await page.locator('.microscope-study img').evaluate(e=>e.decode());await page.screenshot({path:`${out}/micro-${name.toLowerCase()}-${viewport.width}.png`});}
 await page.getByRole('button',{name:'Overall view',exact:false}).click();
 await scene(page,'craftsmanship',.8);for(const key of ['Home','End']){await page.getByRole('slider',{name:'Titanium light position',exact:true}).focus();await page.keyboard.press(key);await page.waitForTimeout(600);await page.locator('.case-film').screenshot({path:`${out}/lighting-${key.toLowerCase()}-${viewport.width}.png`});}
 for(const [material,p] of [['sapphire',.36],['anthracite',.7],['rubber',1]]){
  if(viewport.width<700){await page.locator(`.material-${material}`).scrollIntoViewIfNeeded();await page.waitForTimeout(1000);}else await scene(page,'materials',p);
  const panel=page.locator(`.material-${material}`);if(material==='sapphire'){await panel.getByRole('slider').focus();await page.keyboard.press('End');}else await panel.getByRole('button').click();
  await panel.locator('.material-detail img,.sapphire-optics img').evaluate(e=>e.decode());await panel.screenshot({path:`${out}/material-${material}-${viewport.width}.png`});
 }
 await scene(page,'experience');await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().fullResolution);await page.waitForTimeout(2200);await page.locator('.studio-shell').screenshot({path:`${out}/studio-shell-${viewport.width}.png`});
 for(const pin of await page.locator('.studio-hotspots button').all()){const r=await pin.boundingBox();if(!r||r.width<44||r.height<44)throw new Error('Hotspot touch target below 44px');}
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.screenshot({path:`${out}/fullscreen-${viewport.width}.png`});await page.keyboard.press('Escape');
 evidence.push({viewport,errors});await page.close();
}
await browser.close();fs.writeFileSync('qa/phase3/detail-qa.json',JSON.stringify(evidence,null,2));console.log(evidence);
