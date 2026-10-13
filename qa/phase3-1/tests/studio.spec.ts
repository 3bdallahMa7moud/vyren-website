import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
const output='qa/phase3-1/legacy/after';fs.mkdirSync(output,{recursive:true});
async function scene(page: Page,id: string,progress=0) { await page.evaluate(({id,progress})=>{const e=document.getElementById(id)!;scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*progress-76,behavior:'instant'});},{id,progress});await page.waitForTimeout(1600); }
async function studio(page:Page) { await page.goto('/#experience');await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().displayedFrame!>=0); }
async function settled(page:Page) { await page.waitForFunction(()=>{const d=window.__VYREN_STUDIO?.diagnostics();return d && d.desiredFrame===d.displayedFrame && d.fullResolution;}); }
test('default Cycles orbit, circular drag, presets, loupe, fullscreen and both modes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await studio(page);
 await expect(page.getByRole('button',{name:'Studio',exact:true})).toHaveAttribute('aria-pressed','true');
 expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('.glb')))).toBe(false);
 const angles=[['Front',66],['3/4 View',0],['Side',12],['Back',24]] as const;
 for(const [name,frame] of angles){await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(750);await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).displayedFrame).toBe(frame);await page.locator('.studio-shell').screenshot({path:`${output}/studio-${name.replaceAll('/','').replaceAll(' ','-').toLowerCase()}.png`});}
 await page.getByRole('button',{name:'3/4 View',exact:true}).click();await page.waitForTimeout(750);await settled(page);
 const crown=page.locator('.studio-loupe').getByRole('button',{name:'Crown',exact:true});await crown.click();await expect(page.getByRole('dialog')).toBeVisible();await page.locator('.macro-dialog img').evaluate((e:HTMLImageElement)=>e.decode());await page.screenshot({path:`${output}/studio-macro.png`});await page.keyboard.press('Escape');await expect(crown).toBeFocused();
 expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).desiredFrame).toBe(0);
 const slider=page.getByRole('slider',{name:'Watch rotation'}), box=(await slider.boundingBox())!;
 for(const delta of [box.width*.7,-box.width*.7,box.width*.85,-box.width*.3]){await page.mouse.move(box.x+box.width*.1,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.1+delta,box.y+box.height*.5,{steps:28});await page.mouse.up();await page.waitForTimeout(650);}
 await settled(page);const d=await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics());expect(d.cacheFrames).toBeLessThanOrEqual(d.cacheLimit);expect(d.failedFrames).toBe(0);expect(d.displayedFrame).toBeGreaterThanOrEqual(0);
 await slider.focus();await page.keyboard.press('Home');await page.waitForTimeout(750);await settled(page);await page.keyboard.press('ArrowLeft');await page.waitForTimeout(750);await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).desiredFrame).toBe(71);
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await expect(page.getByRole('button',{name:'Exit fullscreen',exact:true})).toBeVisible();await page.keyboard.press('ArrowRight');await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Fullscreen',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Free 3D',exact:true}).click();await page.waitForFunction(()=>window.__VYREN?.diagnostics().ready);await page.waitForTimeout(700);await page.locator('.studio-shell').screenshot({path:`${output}/free-3d.png`});
 await page.getByRole('button',{name:'Interact with the watch',exact:true}).click();const before=await page.evaluate(()=>window.__VYREN!.diagnostics().camera);await page.keyboard.press('ArrowRight');await page.waitForTimeout(250);expect(await page.evaluate(()=>window.__VYREN!.diagnostics().camera)).not.toEqual(before);await page.keyboard.press('Escape');
 for(const name of ['rear view','Dial detail','Reset']){await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(1200);}
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.getByRole('button',{name:'Zoom out',exact:true}).click();await page.getByRole('button',{name:'Low power',exact:true}).click();await page.waitForTimeout(350);expect((await page.evaluate(()=>window.__VYREN!.diagnostics())).dpr).toBe(.8);
 await page.getByRole('button',{name:'Studio',exact:true}).click();await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).displayedFrame).toBeGreaterThanOrEqual(0);await expect(page.locator('[data-vyren-canvas]')).toHaveCount(1);
 fs.writeFileSync('qa/phase3-1/legacy/studio-diagnostics.json',JSON.stringify({d,errors},null,2));expect(errors).toEqual([]);
 await scene(page,'watch');expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).cacheFrames).toBe(0);await scene(page,'experience');await settled(page);
});
for(const width of [360,390,768,1280,1440,1920])test(`all nine sections and studio at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:width<=768?844:1000});await studio(page);await expect(page.locator('main>section')).toHaveCount(9);await settled(page);await page.screenshot({path:`${output}/studio-${width}.png`});
 await page.setViewportSize({width:width<=768?390:1280,height:844});await settled(page);await page.setViewportSize({width,height:width<=768?844:1000});await settled(page);
 for(const id of ['watch','manifesto','craftsmanship','movement','assembly','materials','details','moment']){await scene(page,id,id==='assembly'?.72:.55);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await page.screenshot({path:`${output}/${id}-${width}.png`});}
 await scene(page,'experience');await settled(page);await page.reload();await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).mode).toBe('studio');
});
test('reduced motion, Save-Data and slow network keep a visible source image',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();const session=await context.newCDPSession(page);
 await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
 await session.send('Network.enable');await session.send('Network.emulateNetworkConditions',{offline:false,latency:120,downloadThroughput:500000,uploadThroughput:250000});await studio(page);await settled(page);
 await page.getByRole('button',{name:'Back',exact:true}).click();await expect(page.locator('.studio-poster img')).toBeVisible();await settled(page);const d=await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics());expect(d.cacheFrames).toBeLessThanOrEqual(2);
 expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('.glb')))).toBe(false);fs.writeFileSync('qa/phase3-1/legacy/slow-save-data.json',JSON.stringify(d,null,2));await context.close();
});
test('emulated horizontal touch rotates and vertical touch scrolls',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await studio(page);const cdp=await context.newCDPSession(page),box=(await page.getByRole('slider',{name:'Watch rotation'}).boundingBox())!;const x=box.x+box.width*.7,y=Math.min(650,box.y+box.height*.5);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=15;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*9,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(750);await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).desiredFrame).not.toBe(0);
 const before=await page.evaluate(()=>scrollY);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:500}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:500-i*12}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(before);await context.close();
});
test('lighting, microscope, material studies, blueprint and component spotlight',async({page})=>{
 await page.goto('/');await scene(page,'craftsmanship',.4);const light=page.getByRole('slider',{name:'Titanium light position',exact:true});await light.focus();await page.keyboard.press('End');await expect(page.locator('.craftsmanship .light-inspection-control')).toContainText('CROWN FLUTES');
 await scene(page,'movement',.5);for(const name of ['Balance','Hairspring','Bridge']){await page.getByRole('button',{name,exact:false}).click();await expect(page.locator('.microscope-study h3')).toHaveText(name);}await page.getByRole('button',{name:'Overall view',exact:false}).click();await expect(page.locator('.microscope-study')).toHaveCount(0);
 await scene(page,'assembly',.72);await page.waitForFunction(()=>window.__VYREN_SEQUENCE?.diagnostics().displayedFactors?.ASSEMBLY_MOVEMENT===1);await expect(page.locator('.component-spotlight')).toContainText('MOVEMENT');await scene(page,'assembly',0);await page.waitForFunction(()=>window.__VYREN_SEQUENCE?.diagnostics().restMatrixDelta===0);
 await scene(page,'materials',.4);await expect(page.locator('.material-interaction')).toHaveCount(3);await scene(page,'details',.5);await expect(page.locator('.blueprint-morph img')).toBeVisible();expect(await page.locator('.blueprint-morph img').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});
