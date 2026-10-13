import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try{
  for(const [width,height] of [[1440,1000],[390,844]]){
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:3000/#experience',{waitUntil:'networkidle'});
    await page.locator('.studio-image-area').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().fullResolution);
    await page.getByRole('button',{name:'Free 3D',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.studio-image-area').dataset.visibleMode==='free'&&document.documentElement.dataset.studio==='ready',null,{timeout:30000});
    await page.getByRole('button',{name:'Interact with the watch',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Finish exploring',exact:true}).getAttribute('aria-pressed'),'true');
    const canvas=page.locator('[data-vyren-canvas]');
    const box=await canvas.boundingBox();assert.ok(box&&box.width>100&&box.height>100);
    const painted=await canvas.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementsFromPoint(r.left+r.width*.5,r.top+r.height*.5).some(n=>n===el||n.contains(el));});
    assert.ok(painted,'The real model remains visible through the settled handoff');
    await page.getByRole('button',{name:'Finish exploring',exact:true}).click();
    await page.getByRole('button',{name:'Studio',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.studio-image-area').dataset.visibleMode==='studio'&&window.__VYREN_STUDIO?.diagnostics().fullResolution);
    assert.deepEqual(errors,[]);
    results.push({width,height,free3dReady:true,controlsWorking:true,canvasPainted:true,errors});
    await page.screenshot({path:`qa/chapter-transitions/studio-return-${width}.png`});await page.close();
  }
}finally{await browser.close();fs.writeFileSync('qa/chapter-transitions/free-studio.json',JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));
