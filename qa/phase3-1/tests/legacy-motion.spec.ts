import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const output=path.resolve('qa/phase3-1/legacy/legacy-motion');fs.mkdirSync(output,{recursive:true});
async function scene(page:Page,id:string,p=0){await page.evaluate(({id,p})=>{const e=document.getElementById(id)!;scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*p,behavior:'instant'});},{id,p});await page.waitForTimeout(1100);}
async function ready(page:Page){if(await page.getByRole('button',{name:'Studio',exact:true}).getAttribute('aria-pressed')==='true')await page.getByRole('button',{name:'Free 3D',exact:true}).click();await page.waitForFunction(()=>window.__VYREN?.diagnostics().ready);}
async function sequenceReady(page:Page){await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.ready&&d.displayedFrame>=0&&d.desiredFrame===d.displayedFrame;});}

test('rapid assembly reversal, reload at intermediate progress and exact local rest matrices',async({page})=>{
  await page.goto('/');await scene(page,'assembly',.72);await sequenceReady(page);
  expect((await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  for(const p of [.19,.84,.35,.73,.25,.58,.92,.4,.01,.55,.2,.83]){await page.evaluate(p=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*p,behavior:'instant'});},p);await page.waitForTimeout(75);}
  await scene(page,'assembly',.29);await sequenceReady(page);const before=await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics());
  await page.reload();await page.waitForTimeout(1200);await sequenceReady(page);const reload=await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics());
  expect(reload.active).toBe(true);expect(reload.displayedFrame).toBe(before.displayedFrame);
  for(const p of [1,.72,0,.72,1,0]){await scene(page,'assembly',p);await sequenceReady(page);if(p!==.72){const d=await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics());expect(d.restMatrixDelta).toBe(0);}}
  await expect(page.locator('canvas[data-vyren-sequence]')).toHaveCount(1);
  fs.writeFileSync(path.join(output,'assembly.json'),JSON.stringify({before,reload,restored:await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())},null,2));
});

test('static and offscreen rendering suspend; preset, zoom and interaction resume cleanly',async({page})=>{
  await page.goto('/#experience');await ready(page);await page.waitForTimeout(2300);
  const before=await page.evaluate(()=>window.__VYREN!.diagnostics().activeFrames);await page.waitForTimeout(1800);
  expect(await page.evaluate(()=>window.__VYREN!.diagnostics().activeFrames)-before).toBeLessThan(3);
  await page.getByRole('button',{name:'rear view',exact:true}).click();await page.waitForTimeout(1300);expect((await page.evaluate(()=>window.__VYREN!.diagnostics())).camera[1]).toBeLessThan(0);
  await page.getByRole('button',{name:'Reset',exact:false}).click();await page.waitForTimeout(1300);
  await page.getByRole('button',{name:'Interact with the watch',exact:true}).click();const b=(await page.locator('.viewer-slot').boundingBox())!;
  await page.mouse.move(b.x+b.width*.5,b.y+b.height*.5);await page.mouse.down();await page.mouse.move(b.x+b.width*.65,b.y+b.height*.58,{steps:20});await page.mouse.up();
  await page.getByRole('button',{name:'Finish exploring'}).click();await page.getByRole('button',{name:'Reset',exact:false}).click();await page.waitForTimeout(1400);
  const a=await page.evaluate(()=>window.__VYREN!.diagnostics().camera);await page.getByRole('button',{name:'rear view',exact:true}).click();await page.waitForTimeout(1200);await page.getByRole('button',{name:'Reset',exact:false}).click();await page.waitForTimeout(1400);
  expect(await page.evaluate(()=>window.__VYREN!.diagnostics().camera)).toEqual(a);
  await scene(page,'watch');const off=await page.evaluate(()=>window.__VYREN!.diagnostics().activeFrames);await page.waitForTimeout(1800);expect(await page.evaluate(()=>window.__VYREN!.diagnostics().activeFrames)).toBe(off);
});

test('all responsive scenes and exact material holds remain readable at 1440 and 768',async({page})=>{
  await page.goto('/');await page.waitForTimeout(2000);
  for(const [p,index] of [[.05,0],[.35,1],[.64,2],[.94,3]] as const){await scene(page,'materials',p);const panel=page.locator('.material-panel').nth(index);const box=(await panel.boundingBox())!;expect(Math.abs(box.x-64.08)).toBeLessThan(4);await expect(panel.locator('.material-name')).toBeVisible();await page.screenshot({path:path.join(output,`material-${index}.png`)});}
  for(const width of [1440,768]){
    await page.setViewportSize({width,height:width===768?844:1000});await page.waitForTimeout(700);
    for(const id of ['watch','manifesto','craftsmanship','movement','assembly','materials','experience','details','moment']){await scene(page,id,.56);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await expect(page.locator(`#${id}`)).toBeVisible();}
    await page.evaluate(()=>{const e=document.getElementById('manifesto')!;scrollTo({top:e.offsetTop+e.offsetHeight-120,behavior:'instant'});});await page.waitForTimeout(1200);
    expect(await page.locator('.navigation').evaluate(e=>getComputedStyle(e).color)).toBe('rgb(241, 238, 232)');
    await page.screenshot({path:path.join(output,`editorial-exit-${width}.png`)});
    await scene(page,'manifesto');expect(await page.locator('.navigation').evaluate(e=>getComputedStyle(e).color)).toBe('rgb(8, 10, 13)');
  }
});

test('runtime motion preference changes preserve content and a single canvas',async({page})=>{
  await page.goto('/#assembly');await scene(page,'assembly',.72);await sequenceReady(page);
  const initial=await page.evaluate(()=>window.__VYREN_MOTION!());
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(700);await scene(page,'assembly');
  await page.getByRole('button',{name:'Separate layers'}).click();await page.waitForTimeout(300);await sequenceReady(page);expect((await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  await page.getByRole('button',{name:'Reassemble',exact:true}).click();await page.waitForTimeout(300);await sequenceReady(page);expect((await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())).restMatrixDelta).toBe(0);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(1000);await scene(page,'assembly',.02);
  await sequenceReady(page);await expect(page.locator('canvas[data-vyren-sequence]')).toHaveCount(1);expect((await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())).displayedFactors!.ASSEMBLY_CRYSTAL).toBe(0);
  for(let i=0;i<3;i++){await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);expect((await page.evaluate(()=>window.__VYREN_MOTION!())).triggers).toBe(0);await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);}
  expect(await page.evaluate(()=>window.__VYREN_MOTION!())).toEqual(initial);
});

