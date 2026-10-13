import {test,expect} from '@playwright/test';
test('geometry hotspots, genuine macros, fullscreen focus and fallback',async({page})=>{
 await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('Simulated unsupported fullscreen'));});
 await page.goto('/#experience');await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().fullResolution);await page.locator('.studio-shell').scrollIntoViewIfNeeded();
 for(const name of ['Crown','Dial','Open-heart movement','Case / strap']){
  const pin=page.getByRole('button',{name:`Inspect ${name}`,exact:true});await expect(pin).toBeVisible();await pin.click();await expect(page.locator('.macro-dialog h3')).toHaveText(name);await page.locator('.macro-dialog img').evaluate((e:HTMLImageElement)=>e.decode());expect(await page.locator('.macro-dialog img').evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThanOrEqual(800);await page.keyboard.press('Escape');await expect(pin).toBeFocused();expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).desiredFrame).toBe(0);
 }
 await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await expect(page.locator('.studio-immersive')).toBeVisible();await expect(page.getByRole('button',{name:'Exit fullscreen'})).toBeFocused();
 await page.getByRole('button',{name:'Inspect Crown',exact:true}).click();await page.keyboard.press('Escape');await expect(page.locator('.studio-immersive')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Fullscreen',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Back',exact:true}).click();await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().displayedFrame===24);await expect(page.getByRole('button',{name:'Inspect Crown',exact:true})).toBeHidden();
});
test('unsupported bitmap decoding retains the photograph and optional mode',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'createImageBitmap',{value:undefined,configurable:true}));await page.goto('/#experience');await expect(page.locator('.studio-ready')).toHaveText('Studio photograph · choose Free 3D to rotate');await expect(page.getByRole('button',{name:'Front',exact:true})).toBeDisabled();expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('.glb')))).toBe(false);await page.getByRole('button',{name:'Free 3D',exact:true}).click();await page.waitForFunction(()=>window.__VYREN?.diagnostics().ready);
});
test('Cycles retries a transient frame failure without blanking the watch',async({page})=>{
 let attempts=0;await page.route('**/studio-cycles/desktop/000.webp',r=>++attempts===1?r.abort('failed'):r.continue());await page.goto('/#experience');await expect(page.locator('.studio-poster img')).toBeVisible();await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().fullResolution);expect(attempts).toBeGreaterThanOrEqual(2);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).failedFrames).toBe(1);await expect(page.getByRole('button',{name:'Studio',exact:true})).toHaveAttribute('aria-pressed','true');
});
