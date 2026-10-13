import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const output=path.resolve('qa/phase3-1/legacy/legacy-exploded');
fs.mkdirSync(output,{recursive:true});
const sequence=()=>window.__VYREN_SEQUENCE!.diagnostics();
async function ready(page:Page){
  await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.ready&&d.displayedFrame>=0&&d.displayedFrame===d.desiredFrame;},null,{timeout:90000});
}
async function seek(page:Page,p:number){
  await page.evaluate(p=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*p,behavior:'instant'});},p);
  await page.waitForTimeout(1200);await ready(page);
}
async function canvasEvidence(page:Page){
  return page.locator('[data-vyren-sequence]').evaluate((c:HTMLCanvasElement)=>{
    const data=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
    let alphaPixels=0,hash=2166136261;
    for(let i=0;i<data.length;i+=4){if(data[i+3]>0)alphaPixels++;hash=Math.imul(hash^data[i]^data[i+1]^data[i+2]^data[i+3],16777619);}
    return {alphaPixels,hash:hash>>>0,width:c.width,height:c.height};
  });
}
function save(name:string,data:unknown){fs.writeFileSync(path.join(output,`${name}.json`),JSON.stringify(data,null,2));}

test('progressive loading and first-frame poster continuity',async({page})=>{
  await page.goto('/');await page.waitForTimeout(2300);
  const initial=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.includes('/exploded-cycles/')).map(e=>e.name));
  expect(initial.filter(name=>name.endsWith('manifest.json')||/\/(desktop|mobile)\//.test(name))).toEqual([]);
  let unblock!:()=>void;const gate=new Promise<void>(r=>{unblock=r;});
  await page.route('**/exploded-cycles/desktop/*.webp',async route=>{await gate;await route.continue().catch(()=>{});});
  await page.goto('/#assembly');await page.waitForTimeout(1600);
  await expect(page.locator('.sequence-poster')).toHaveCSS('opacity','1');
  const poster=await page.locator('.sequence-slot').screenshot();
  unblock();await ready(page);await page.waitForTimeout(100);
  const frame=await page.locator('.sequence-slot').screenshot();
  const a=await sharp(poster).ensureAlpha().raw().toBuffer();const b=await sharp(frame).ensureAlpha().raw().toBuffer();
  expect(a.length).toBe(b.length);let difference=0;for(let i=0;i<a.length;i++)difference+=Math.abs(a[i]-b[i]);
  const mean=difference/a.length;expect(mean).toBeLessThan(.5);
  fs.writeFileSync(path.join(output,'poster.png'),poster);fs.writeFileSync(path.join(output,'first-canvas.png'),frame);
  expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);
  expect(await page.locator('video').count()).toBe(0);
  save('poster-continuity',{initialSequenceResources:initial,meanScreenshotChannelDifference:mean,diagnostics:await page.evaluate(sequence)});
});

test('deterministic forward, reverse, arbitrary seek and synchronized labels',async({page})=>{
  await page.goto('/#assembly');const states=[];
  for(const p of [0,.32,.57,.72,.9,1,.57,.32,0]){
    await seek(page,p);const d=await page.evaluate(sequence);
    expect(Math.abs(d.displayedFrame-Math.round(p*160))).toBeLessThanOrEqual(1);
    expect(d.peakCacheFrames).toBeLessThanOrEqual(d.cacheLimit);
    const footer=await page.locator('.assembly-progress span').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
    expect(footer).toBeCloseTo(d.displayedProgress!,3);
    if(p===0||p===1)expect(d.restMatrixDelta).toBe(0);
    if(p===.72){
      expect(Object.values(d.displayedFactors!).every(f=>f===1)).toBe(true);
      for(const label of await page.locator('.assembly-labels>span').all())await expect(label).toHaveCSS('opacity','1');
    }
    if(p===0)for(const label of await page.locator('.assembly-labels>span').all())await expect(label).toHaveCSS('opacity','0');
    expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);states.push({p,...d});
  }
  expect((await page.evaluate(()=>window.__VYREN_MOTION!())).assemblyTriggers).toBe(1);
  save('seeking',states);
});

test('slow frames retain the last image and synchronized footer while scrolling stays available',async({page})=>{
  await page.goto('/#assembly');await seek(page,.4);
  const before=await page.evaluate(sequence),pixels=await canvasEvidence(page);
  let unblock!:()=>void;const gate=new Promise<void>(r=>{unblock=r;});
  await page.route('**/exploded-cycles/desktop/*.webp',async route=>{await gate;await route.continue().catch(()=>{});});
  await page.evaluate(()=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*.9,behavior:'instant'});});
  await page.waitForTimeout(900);const waiting=await page.evaluate(sequence);
  expect(waiting.desiredFrame).toBeGreaterThan(135);
  expect(waiting.displayedFrame).toBeGreaterThanOrEqual(before.displayedFrame);
  expect(waiting.displayedFrame).toBeLessThan(before.displayedFrame+12);
  const heldPixels=await canvasEvidence(page);expect(heldPixels.alphaPixels).toBeGreaterThan(10000);
  const heldImage=await page.locator('[data-vyren-sequence]').screenshot();
  await page.waitForTimeout(250);
  const stillWaiting=await page.evaluate(sequence);expect(stillWaiting.displayedFrame).toBe(waiting.displayedFrame);
  const retainedImage=await page.locator('[data-vyren-sequence]').screenshot();
  const a=await sharp(heldImage).ensureAlpha().raw().toBuffer(),b=await sharp(retainedImage).ensureAlpha().raw().toBuffer();
  expect(a.length).toBe(b.length);let difference=0;for(let i=0;i<a.length;i++)difference+=Math.abs(a[i]-b[i]);
  // Canvas GPU/CPU readback may round antialiased pixels differently; compare the visible image.
  expect(difference/a.length).toBeLessThan(.5);
  const progress=await page.locator('.assembly-progress span').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
  expect(progress).toBeCloseTo(waiting.displayedProgress!,3);
  unblock();await ready(page);const after=await page.evaluate(sequence);
  expect(after.displayedFrame).toBeGreaterThan(135);expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);
  save('slow-loading',{before,waiting,stillWaiting,after,pixels,heldPixels,meanHeldImageDifference:difference/a.length});
});

test('rapid scrubbing releases obsolete requests, seeks after refresh and releases offscreen bitmaps',async({page})=>{
  await page.goto('/#assembly');await seek(page,.57);
  for(const p of [.15,.92,.31,.74,.22,.98,.42,.85,.33]){
    await page.evaluate(p=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*p,behavior:'instant'});},p);
    await page.waitForTimeout(55);
  }
  await seek(page,.33);const before=await page.evaluate(sequence);
  await page.reload();await page.waitForTimeout(1500);await ready(page);const reloaded=await page.evaluate(sequence);
  expect(reloaded.displayedFrame).toBe(before.displayedFrame);expect(reloaded.peakCacheFrames).toBeLessThanOrEqual(12);
  await page.locator('.desktop-nav').getByRole('link',{name:'Watch',exact:true}).click();await page.waitForTimeout(1900);
  const offscreen=await page.evaluate(sequence);expect(offscreen.active).toBe(false);expect(offscreen.cacheFrames).toBe(0);expect(offscreen.pending).toBe(0);
  const draws=offscreen.draws;await page.waitForTimeout(700);expect((await page.evaluate(sequence)).draws).toBe(draws);
  await seek(page,.72);expect((await page.evaluate(sequence)).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  save('rapid-reload-disposal',{before,reloaded,offscreen,returned:await page.evaluate(sequence)});
});

for(const width of [1440,1280,768,390,360]){
  test(`Cycles responsive variant, resize and unclipped canvas ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:width<=768?844:1000});await page.goto('/#assembly');
    const states=[];
    for(const p of [0,.32,.72,1]){
      await seek(page,p);const d=await page.evaluate(sequence);
      expect(d.variant).toBe(width<=768?'mobile':'desktop');
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const evidence=await canvasEvidence(page);expect(evidence.alphaPixels).toBeGreaterThan(5000);states.push({p,...d,evidence});
      await page.screenshot({path:path.join(output,`viewport-${width}-${Math.round(p*100)}.png`)});
    }
    const other=width<=768?1280:390;
    await page.setViewportSize({width:other,height:other<=768?844:1000});await seek(page,.57);
    expect((await page.evaluate(sequence)).variant).toBe(other<=768?'mobile':'desktop');
    expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(5000);
    save(`responsive-${width}`,{scope:'Desktop Edge viewport emulation; not a physical tablet or phone',states,resized:await page.evaluate(sequence)});
  });
}

test('Save-Data uses a smaller frame set and reduced motion has explicit static controls',async({page})=>{
  const requested:string[]=[];page.on('request',r=>{const p=new URL(r.url()).pathname;if(p.includes('/exploded-cycles/desktop/'))requested.push(p);});
  const manifest=JSON.parse(fs.readFileSync(path.resolve('public/assets/exploded-cycles/manifest.json'),'utf8'));
  const allowed=new Set(manifest.variants.desktop.urls.filter((_:string,i:number)=>i%2===0));
  await page.addInitScript(()=>{Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true});});
  await page.goto('/#assembly');await seek(page,.332);
  expect((await page.evaluate(sequence)).displayedFrame%2).toBe(0);
  await page.emulateMedia({reducedMotion:'reduce'});await seek(page,0);
  expect((await page.evaluate(sequence)).displayedFrame).toBe(0);
  await page.getByRole('button',{name:'Separate layers'}).click();await page.waitForTimeout(500);await ready(page);
  const exploded=await page.evaluate(sequence);expect(exploded.displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  const draws=exploded.draws;await page.waitForTimeout(800);expect((await page.evaluate(sequence)).draws).toBe(draws);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(400);
  await page.emulateMedia({reducedMotion:'reduce'});await seek(page,0);
  await expect(page.getByRole('button',{name:'Separate layers'})).toBeVisible();
  expect((await page.evaluate(sequence)).displayedFrame).toBe(0);
  await page.getByRole('button',{name:'Separate layers'}).click();await page.waitForTimeout(500);await ready(page);
  await page.getByRole('button',{name:'Reassemble',exact:true}).click();await page.waitForTimeout(500);await ready(page);
  expect((await page.evaluate(sequence)).restMatrixDelta).toBe(0);
  expect(requested.every(p=>allowed.has(p))).toBe(true);
  save('save-data-reduced',{exploded,restored:await page.evaluate(sequence),requested});
});

test('the 2D sequence survives unavailable WebGL and the independent viewer uses its fallback',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type==='webgl'||type==='webgl2')return null;return Reflect.apply(original,this,[type,...args]);} as typeof original;});
  await page.goto('/#assembly');await seek(page,.72);
  expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);
  await page.locator('.desktop-nav').getByRole('link',{name:'Experience',exact:true}).click();
  await page.getByRole('button',{name:'Free 3D',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.studio==='error');
  await expect(page.locator('.viewer-slot img')).toBeVisible();
  await expect(page.locator('main>section')).toHaveCount(9);
});
