import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const out='qa/chapter-transitions';
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
const result=process.env.VYREN_QA_RESUME==='1'?JSON.parse(fs.readFileSync(`${out}/verification.json`,'utf8')):{cases:[],errors:[],failedResponses:[],warnings:[]};
const hash=value=>createHash('sha256').update(value).digest('hex');
const planes={
  '01-02':'.manifesto-product','02-03':'.craft-camera','03-04':'.movement-camera',
  '04-05':'.assembly-camera','05-06':'.material-titanium .material-camera',
  '06-07':'.studio-image-area','07-08':'.dimension-image > .product-media','08-09':'.final-product',
};
async function seek(page,top){await page.evaluate(top=>scrollTo({top,behavior:'instant'}),top);await page.waitForTimeout(650);}
async function frame(page,kind,expected){try{await page.waitForFunction(({kind,expected})=>{const d=window.__VYREN_STORY?.[kind]?.();return d && (d.active ? d.displayedFrame===expected&&d.fullResolution : d.desiredFrame===expected);},{kind,expected},{timeout:20000});}catch(e){console.log('FRAME_FAILURE',JSON.stringify(await page.evaluate(({kind,expected})=>({kind,expected,diagnostics:window.__VYREN_STORY?.[kind]?.(),scroll:scrollY,assembly:document.querySelector('#assembly').getBoundingClientRect().top,viewer:document.querySelector('#experience').getBoundingClientRect().top}),{kind,expected})));throw e;}}
async function plane(page,selector){return page.locator(selector).evaluate(el=>{const s=getComputedStyle(el),m=new DOMMatrix(s.transform);return {scaleX:m.a,scaleY:m.d,x:m.e,y:m.f,opacity:Number(s.opacity),clip:s.clipPath};});}
try{
  for(const [width,height,reduced] of [[1440,1000,false],[1366,768,false],[390,844,false],[360,740,false],[1907,282,false],[390,844,true],[1440,1000,true]]){
    if(process.env.VYREN_QA_WIDTH && width!==Number(process.env.VYREN_QA_WIDTH))continue;
    if(result.cases.some(c=>c.width===width&&c.height===height&&c.reduced===reduced))continue;
    const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
    page.on('pageerror',e=>result.errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:3000/')&&r.status()>=400)result.failedResponses.push([r.status(),r.url()]);});
    page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('Element not found'))result.warnings.push(m.text());});
    await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
    assert.equal(await page.locator('main > section').count(),9);
    assert.equal(await page.locator('.hero-sculpting,.microscope-controls,.material-panel button,.material-panel input').count(),0);
    const handoffs=[];
    if(!reduced){
      assert.equal(await page.locator('[data-handoff]').count(),8);
      for(const [id,selector] of Object.entries(planes)){
        const section=page.locator(`[data-handoff="${id}"]`);
        const trigger=id==='02-03'?'.case-film':id==='07-08'?'.dimension-image':`#${await section.getAttribute('id')}`;
        const bounds=await page.locator(trigger).evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight}));
        const start=bounds.top-height*(id==='02-03'?.85:id==='07-08'?.82:.72);
        const span=height*(id==='02-03'?.30:.28),samples=[];
        for(const p of [0,.5,1,.5,0]){
          await seek(page,start+span*p);
          const progress=Number(await section.getAttribute('data-handoff-progress'));
          assert.ok(Math.abs(progress-p)<.015,`${id} follows the scroll in both directions`);
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
          const state=await plane(page,selector);samples.push({p,progress,...state});
          if(id==='04-05')await frame(page,'movement',Math.round(47*(1-progress)));
          if(id==='06-07'&&width>768)await frame(page,'rubber',Math.round(17*(1-progress)));
          if(id==='07-08'){
            await page.waitForFunction(()=>getComputedStyle(document.querySelector('.blueprint-morph')).visibility==='visible');
            const opacity=Number(await page.locator('.blueprint-morph').evaluate(el=>getComputedStyle(el).opacity));
            assert.ok(Math.abs(opacity-p)<.015,'The photograph remains under a reversible line drawing blend');
          }
          if(p===.5&&samples.length===2){
            const canvas=id==='04-05'?'.story-movement canvas':id==='06-07'&&width>768?'.story-rubber canvas':null;
            if(canvas){const a=hash(await page.locator(canvas).evaluate(el=>el.toDataURL()));await page.waitForTimeout(350);const b=hash(await page.locator(canvas).evaluate(el=>el.toDataURL()));assert.equal(a,b,'No movement while scroll is paused');}
          }
        }
        assert.ok(Math.abs(samples[0].scaleX-samples[4].scaleX)<.005&&Math.abs(samples[1].scaleX-samples[3].scaleX)<.005,`${id} restores its camera crop`);
        assert.ok(Math.abs(samples[0].scaleX-samples[2].scaleX)>.025||Math.abs(samples[0].opacity-samples[2].opacity)>.2,`${id} changes the photograph visibly`);
        handoffs.push({id,scrollDistance:span,samples});
      }
    }else{
      assert.equal(await page.locator('[data-handoff]').count(),0);
      await page.locator('.dimension-image').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
      assert.equal(Number(await page.locator('.blueprint-morph').evaluate(el=>getComputedStyle(el).opacity)),1);
    }
    // Camera handoffs must settle before direct Studio control, and must keep
    // the visitor's chosen angle when going away and coming back.
    await page.locator('.studio-image-area').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().fullResolution);
    assert.ok(Math.abs((await plane(page,'.studio-image-area')).scaleX-1)<.005);
    await page.locator('.studio-presets').getByRole('button',{name:'Side',exact:true}).click();
    await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().displayedFrame===12&&window.__VYREN_STUDIO.diagnostics().fullResolution);
    const viewerTop=await page.locator('#experience').evaluate(el=>el.getBoundingClientRect().top+scrollY);
    await seek(page,viewerTop-height*.72);await seek(page,viewerTop+250);
    await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().displayedFrame===12&&window.__VYREN_STUDIO.diagnostics().fullResolution);
    if(!reduced){
      // Preserve the real assembly's layers, annotation text and exact rest.
      const bounds=await page.locator('#assembly').evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,span:el.offsetHeight-innerHeight}));
      await seek(page,bounds.top+bounds.span*.72);
      await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.displayedFrame===115;},{},{timeout:20000});
      assert.equal(await page.locator('.component-spotlight span').textContent(),'MOVEMENT / VN-01');
      if(width>768)assert.ok(Number(await page.locator('.label-movement').evaluate(el=>getComputedStyle(el).opacity))>.95);
      await seek(page,bounds.top+bounds.span);
      await page.waitForFunction(()=>window.__VYREN_SEQUENCE?.diagnostics().displayedFrame===160,{},{timeout:20000});
      assert.equal(await page.locator('.component-spotlight span').textContent(),'ASSEMBLED / NOCTIS 01');
      assert.equal(await page.evaluate(()=>window.__VYREN_SEQUENCE.diagnostics().restMatrixDelta),0);
      if(width<=768){
        const r=await page.locator('.material-rubber').evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight}));
        await seek(page,r.top-height*.72+(r.height+height*.30));await frame(page,'rubber',17);
      }
    }
    const finaleTop=await page.locator('#moment').evaluate(el=>el.getBoundingClientRect().top+scrollY);
    await seek(page,finaleTop-height*.57);
    assert.ok(await page.locator('#moment').evaluate(el=>{const top=el.getBoundingClientRect().top;return [.15,.3,.45,.6].every(x=>!document.elementsFromPoint(x*innerWidth,top-10).some(n=>el.contains(n)));}),'The new rim entrance stays inside the ninth section');
    const diagnostics=await page.evaluate(()=>({movement:window.__VYREN_STORY?.movement?.(),rubber:window.__VYREN_STORY?.rubber?.(),sequence:window.__VYREN_SEQUENCE?.diagnostics(),finale:window.__VYREN_FINALE?.()}));
    for(const d of Object.values(diagnostics).filter(Boolean)){assert.equal(d.failedFrames,0);assert.ok(d.peakCacheFrames<=d.cacheLimit);}
    result.cases.push({width,height,reduced,handoffs,studioAnglePreserved:true,assemblyPreserved:true,diagnostics});
    fs.writeFileSync(`${out}/verification.json`,JSON.stringify(result,null,2));
    console.log('TRANSITIONS_VERIFIED',width,height,reduced?'reduced':'motion');await page.close();
  }
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.failedResponses,[]);assert.deepEqual(result.warnings,[]);
}finally{fs.writeFileSync(`${out}/verification.json`,JSON.stringify(result,null,2));await browser.close();}
console.log('All transitions passed');
