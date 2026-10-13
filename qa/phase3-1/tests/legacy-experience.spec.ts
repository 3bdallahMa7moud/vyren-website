import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const qaRoot = 'qa/phase3-1/legacy/legacy';
const out = path.resolve(qaRoot, 'screenshots'); fs.mkdirSync(out, { recursive: true });
const reports = path.resolve(qaRoot, 'reports'); fs.mkdirSync(reports, { recursive: true });
async function scene(page: Page, id: string, progress = 0) {
  await page.evaluate(({ id, progress }) => { const el = document.getElementById(id)!; window.scrollTo({ top: el.offsetTop + Math.max(0, el.offsetHeight - innerHeight) * progress, behavior: 'instant' }); }, { id, progress });
  await page.waitForTimeout(1250);
}
async function shot(page: Page, name: string) {
  await page.evaluate(async () => { await Promise.all(Array.from(document.querySelectorAll('img')).filter(img => { const r = img.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }).map(img => Promise.race([img.decode().catch(() => {}),new Promise(resolve=>setTimeout(resolve,2000))]))); });
  await page.screenshot({ path: path.join(out, `${name}.png`) });
}
async function ready(page: Page) { if(await page.getByRole('button',{name:'Studio',exact:true}).getAttribute('aria-pressed')==='true'){await page.getByRole('button',{name:'Free 3D',exact:true}).click();} await page.waitForFunction(() => window.__VYREN?.diagnostics().ready, null, { timeout: 90000 }); await page.getByRole('button',{name:'front view',exact:true}).click();await page.waitForTimeout(1200); }
async function sequenceReady(page: Page) { await page.waitForFunction(() => { const d=window.__VYREN_SEQUENCE?.diagnostics(); return d?.ready && d.displayedFrame>=0 && d.desiredFrame===d.displayedFrame; }, null, { timeout:90000 }); }

test('all nine scenes, reversible assembly, genuine viewer and rendering evidence', async ({ page, browser }) => {
  const errors: string[] = []; const failures: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ERR_ABORTED')) failures.push(`${request.url()} ${request.failure()?.errorText}`); });
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  await page.addInitScript(() => {
    const metrics: { lcp: number; cls: number } = { lcp: 0, cls: 0 };
    Object.assign(window, { __perf: metrics });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) metrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) { const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }; if (!shift.hadRecentInput) metrics.cls += shift.value; } }).observe({ type: 'layout-shift', buffered: true });
  });
  const start = Date.now(); await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250); await shot(page, '01-hero-initial'); await page.waitForTimeout(2800); await shot(page, '02-hero-revealed');
  await expect(page.locator('main > section')).toHaveCount(9);
  const initial = await page.evaluate(() => ({ ...((window as unknown as { __perf: { lcp: number; cls: number } }).__perf), glbInitiallyRequested: performance.getEntriesByType('resource').some(e => e.name.includes('.glb')), resources: (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).map(e => ({ name: new URL(e.name).pathname, transferBytes: e.transferSize, decodedBytes: e.decodedBodySize, duration: e.duration })) }));
  await scene(page, 'manifesto', .45); await shot(page, '03-typography');
  await scene(page, 'craftsmanship', .75); await shot(page, '04-case-macro');
  await scene(page, 'movement', .6); await shot(page, '05-movement');
  await scene(page, 'assembly', .02); await sequenceReady(page); await shot(page, '06-assembly-start');
  await scene(page, 'assembly', .29); await sequenceReady(page); await shot(page, '07-assembly-intermediate');
  const intermediate = await page.evaluate(() => window.__VYREN_SEQUENCE!.diagnostics()); expect(intermediate.displayedProgress).toBeCloseTo(.29,1); expect(intermediate.displayedFactors!.ASSEMBLY_CRYSTAL).toBeGreaterThan(.35); expect(intermediate.displayedFactors!.ASSEMBLY_MOVEMENT).toBe(0);
  await scene(page, 'assembly', .72); await sequenceReady(page); await shot(page, '08-assembly-full'); const exploded = await page.evaluate(() => window.__VYREN_SEQUENCE!.diagnostics()); expect(Object.values(exploded.displayedFactors!).every(f=>f===1)).toBe(true);
  await scene(page, 'assembly', 1); await sequenceReady(page); await shot(page, '09-reassembled'); const restored = await page.evaluate(() => window.__VYREN_SEQUENCE!.diagnostics()); expect(restored.restMatrixDelta).toBe(0);
  await scene(page, 'assembly', .72); await sequenceReady(page); expect((await page.evaluate(() => window.__VYREN_SEQUENCE!.diagnostics())).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  await scene(page, 'assembly', 0); await sequenceReady(page); expect((await page.evaluate(() => window.__VYREN_SEQUENCE!.diagnostics())).restMatrixDelta).toBe(0);
  await scene(page, 'materials', .35); await shot(page, '10-materials');
  await scene(page, 'experience', .65); await ready(page); await shot(page, '11-viewer-front');
  const before = await page.evaluate(() => window.__VYREN!.diagnostics().camera);
  await page.getByRole('button', { name: 'rear view', exact: true }).click(); await page.waitForTimeout(1800); await shot(page, '12-viewer-rear');
  const rear = await page.evaluate(() => window.__VYREN!.diagnostics()); expect(rear.camera[1]).toBeLessThan(0);
  await page.getByRole('button', { name: 'Dial detail', exact: true }).click(); await page.waitForTimeout(1700); await shot(page, '13-viewer-detail');
  await page.getByRole('button', { name: 'Reset', exact: false }).click(); await page.waitForTimeout(1700); const reset = await page.evaluate(() => window.__VYREN!.diagnostics()); expect(reset.camera[1]).toBeCloseTo(before[1], 2);
  await page.getByRole('button', { name: 'Interact with the watch', exact: true }).click();
  const box = (await page.locator('.viewer-slot').boundingBox())!;
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5); await page.mouse.down(); await page.mouse.move(box.x + box.width * .65, box.y + box.height * .6, { steps: 15 }); await page.mouse.up(); await page.waitForTimeout(600);
  const rotated = await page.evaluate(() => window.__VYREN!.diagnostics()); expect(rotated.camera).not.toEqual(reset.camera);
  await page.getByRole('button', { name: 'Finish exploring' }).click();
  const distance = (p: number[], t: number[]) => Math.hypot(...p.map((v, i) => v - t[i]));
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click(); await page.waitForTimeout(300); const zoom = await page.evaluate(() => window.__VYREN!.diagnostics()); expect(distance(zoom.camera, zoom.target)).toBeLessThan(distance(rotated.camera, rotated.target));
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click(); await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Low power', exact: true }).click(); await page.waitForTimeout(300); expect((await page.evaluate(() => window.__VYREN!.diagnostics())).dpr).toBe(.8); await page.getByRole('button', { name: 'Low power', exact: true }).click();
  // Same renderer and actual materials, reference-matched camera/sensor/lens.
  const matched: Record<string, unknown> = {};
  await page.addStyleTag({content:'.viewer-coordinate,.viewer-instruction,.interaction-button{visibility:hidden!important}'});
  for (const name of ['hero','front','rear','movement','strap','crown'] as const) {
    await page.evaluate(name=>{ const body=document.querySelector<HTMLElement>('.viewer-body')!; body.style.width='1200px'; body.style.height=['front','rear','movement'].includes(name)?'1200px':'900px'; },name);
    await page.waitForTimeout(250);
    matched[name] = await page.evaluate(name => window.__VYREN!.capturePose(name), name); await page.waitForTimeout(500); await page.locator('[data-vyren-canvas]').screenshot({ path: path.join(out, `fidelity-${name}.png`) });
  }
  await page.evaluate(()=>{ const body=document.querySelector<HTMLElement>('.viewer-body')!; body.style.width='';body.style.height='';window.dispatchEvent(new Event('resize')); }); await page.waitForTimeout(700);
  await page.evaluate(() => window.__VYREN!.releaseCapture());
  const fpsStart = await page.evaluate(() => ({ count: window.__VYREN!.diagnostics().activeFrames, time: performance.now() })); await page.waitForTimeout(3000); const performanceEnd = await page.evaluate(() => ({ diagnostics: window.__VYREN!.diagnostics(), time: performance.now() }));
  const frameRate = (performanceEnd.diagnostics.activeFrames - fpsStart.count) * 1000 / (performanceEnd.time - fpsStart.time);
  const gpu = await page.evaluate(() => { const canvas = document.querySelector('[data-vyren-canvas]') as HTMLCanvasElement; const gl = canvas.getContext('webgl2')!; const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unavailable'; });
  await scene(page, 'details', .6);
  await page.waitForTimeout(500);
  expect(await page.locator('.specifications dl > div').first().evaluate(el=>getComputedStyle(el).clipPath)).not.toContain('100%');
  await shot(page, '14-details'); await scene(page, 'moment', .5); await shot(page, '15-finale');
  await page.getByRole('link', { name: 'Back to top' }).click(); await page.waitForTimeout(2500); expect(await page.evaluate(() => scrollY)).toBeLessThan(30);
  await page.locator('.desktop-nav').getByRole('link', { name: 'Experience' }).click(); await page.waitForTimeout(2500); expect(await page.evaluate(() => location.hash)).toBe('#experience');
  await page.reload(); await ready(page); expect(await page.evaluate(() => window.__VYREN!.diagnostics().activeStage)).toBe('viewer');
  expect(errors).toEqual([]); expect(failures).toEqual([]);
  const report = { testedAt: new Date().toISOString(), browser: browser.version(), viewport: { width:1440,height:1000 }, seconds: (Date.now() - start)/1000, initial, intermediate, exploded, restored, viewer: performanceEnd.diagnostics, observedFramesPerSecond: frameRate, gpu, matched, errors, failures, checks: ['9 sections', 'all scene screenshots', 'forward / reverse / restored assembly', 'mouse drag', 'front / rear / detail / reset', 'zoom', 'low power', 'direct navigation', 'deep-scroll refresh'], scope: 'Actual headless desktop Edge. Frame rate and paint timing are local observations, not a field or real-device benchmark.' };
  fs.writeFileSync(path.join(reports, 'desktop.json'), JSON.stringify(report,null,2));
});

for (const width of [360,390,768,1280,1920]) {
  test(`responsive layout ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 769 ? 844 : 1000 }); await page.goto('/'); await page.waitForTimeout(2800);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await shot(page, `responsive-${width}-hero`);
    if (width <= 768) { await page.getByRole('button', { name: 'Open menu' }).click(); await shot(page, `responsive-${width}-menu`); await expect(page.locator('#mobile-menu')).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused(); await page.getByRole('button', { name: 'Open menu' }).click(); await page.locator('#mobile-menu').getByRole('link', { name: 'Experience' }).click(); }
    else await scene(page,'experience',.5);
    await page.waitForTimeout(1300); await ready(page); await scene(page,'experience',.5); await shot(page, `responsive-${width}-viewer`);
    for (const id of ['manifesto','craftsmanship','movement','assembly','materials','details','moment']) { await scene(page,id,.55); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width); }
    fs.writeFileSync(path.join(reports, `responsive-${width}.json`), JSON.stringify({ width, viewportHeight:width < 769 ? 844:1000, horizontalOverflow:false, device:'Desktop viewport emulation; no physical phone tested' },null,2));
  });
}

test('reduced motion preserves content and manual assembly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' }); await page.goto('/'); await scene(page,'assembly'); await sequenceReady(page);
  expect((await page.evaluate(() => window.__VYREN_SEQUENCE!.diagnostics())).restMatrixDelta).toBe(0);
  await page.getByRole('button', { name:'Separate layers' }).click(); await page.waitForTimeout(500); await sequenceReady(page); expect((await page.evaluate(() => window.__VYREN_SEQUENCE!.diagnostics())).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  await page.getByRole('button', { name:'Reassemble',exact:true }).click(); await page.waitForTimeout(500); await sequenceReady(page); expect((await page.evaluate(() => window.__VYREN_SEQUENCE!.diagnostics())).restMatrixDelta).toBe(0);
  await shot(page,'reduced-motion-assembly'); await scene(page,'materials'); await expect(page.getByRole('heading',{name:'Rubber',exact:false})).toBeVisible();
});

test('WebGL unavailable leaves actual imagery and all editorial content', async ({ browser }) => {
  const context = await browser.newContext(); const page = await context.newPage();
  await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) { if (type === 'webgl' || type === 'webgl2') return null; return Reflect.apply(original,this,[type,...args]); } as typeof original; });
  await page.goto('/'); await scene(page,'experience',.5); await page.getByRole('button',{name:'Free 3D',exact:true}).click(); await page.waitForFunction(() => document.documentElement.dataset.studio === 'error');
  await expect(page.locator('.viewer-slot img')).toBeVisible(); await expect(page.locator('main > section')).toHaveCount(9); await shot(page,'webgl-fallback'); await context.close();
});

test('emulated touch rotates the model and releases page scrolling', async ({ browser }) => {
  const context = await browser.newContext({ viewport:{width:390,height:844},hasTouch:true,isMobile:true });
  const page = await context.newPage(); await page.goto('/#experience'); await ready(page); await scene(page,'experience',.45);
  await page.getByRole('button',{name:'Interact with the watch',exact:true}).tap(); await page.waitForTimeout(200);
  const before = await page.evaluate(()=>window.__VYREN!.diagnostics().camera);
  const box = (await page.locator('.viewer-slot').boundingBox())!;
  const session = await context.newCDPSession(page); const x=box.x+box.width*.5,y=box.y+box.height*.5;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=12;i++) await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*5,y:y+i*2}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await page.waitForTimeout(400);
  const after = await page.evaluate(()=>window.__VYREN!.diagnostics().camera); expect(after).not.toEqual(before);
  await shot(page,'mobile-touch-viewer'); await page.getByRole('button',{name:'Finish exploring'}).tap(); await scene(page,'details',.3); expect(await page.evaluate(()=>window.__VYREN!.diagnostics().controlsEnabled)).toBe(false);
  fs.writeFileSync(path.join(reports,'touch.json'),JSON.stringify({passed:true,scope:'Headless desktop Edge with mobile viewport and CDP touch events; not a physical mobile GPU',before,after},null,2));
  await context.close();
});
