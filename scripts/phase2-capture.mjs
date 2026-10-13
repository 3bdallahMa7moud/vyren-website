import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2] || 'baseline';
const root = path.resolve('qa/phase2-cinematic', mode);
fs.mkdirSync(root, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, recordVideo: { dir: path.join(root, 'recordings'), size: { width: 1440, height: 1000 } } });
const page = await context.newPage();
const errors = [], failures = [], captures = [];
const filmingStart = Date.now();
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', r => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });
await page.addInitScript(() => {
  window.__phase2Perf = { lcp: 0, cls: 0 };
  new PerformanceObserver(l => { for (const e of l.getEntries()) window.__phase2Perf.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__phase2Perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
});
const wait = ms => page.waitForTimeout(ms);
async function scene(id, progress = 0) {
  await page.evaluate(({ id, progress }) => { const el = document.getElementById(id); window.scrollTo({ top: el.offsetTop + Math.max(0, el.offsetHeight - innerHeight) * progress, behavior: 'instant' }); }, { id, progress });
  await wait(1500);
}
async function shot(name, id, progress) {
  await page.evaluate(async () => { await Promise.all([...document.images].filter(i => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }).map(i => Promise.race([i.decode().catch(() => {}),new Promise(resolve=>setTimeout(resolve,2000))]))); });
  await page.screenshot({ path: path.join(root, `${name}.png`) });
  captures.push({ name, id, progress, elapsedMs: Date.now()-filmingStart, viewport: page.viewportSize(), dpr: 1, scrollY: await page.evaluate(() => scrollY), diagnostic: await page.evaluate(() => window.__VYREN?.diagnostics()) });
}
async function ready() { await page.waitForFunction(() => window.__VYREN?.diagnostics().ready, null, { timeout: 90000 }); }
await page.goto('http://127.0.0.1:3001/', { waitUntil: 'domcontentloaded' });
await wait(150); await shot('01-hero-initial', 'watch', 0);
await wait(2850); await shot('02-hero-revealed', 'watch', 0);
const initial = await page.evaluate(() => ({ ...window.__phase2Perf, glbInitiallyRequested: performance.getEntriesByType('resource').some(e => e.name.includes('.glb')), resourceBytes: performance.getEntriesByType('resource').reduce((n, e) => n + e.transferSize, 0) }));
for (const [name,id,p] of [['03-typography','manifesto',.45],['04-case','craftsmanship',.75],['05-movement','movement',.6],['06-assembly-early','assembly',.02],['07-assembly-middle','assembly',.29],['08-assembly-full','assembly',.56],['09-reassembled','assembly',.98],['10-materials','materials',.35],['11-viewer-front','experience',.65]]) {
  await scene(id,p); if (id === 'assembly' || id === 'experience') await ready(); await shot(name,id,p);
}
await page.getByRole('button',{name:'rear view',exact:true}).click(); await wait(1700); await shot('12-viewer-rear','experience',.65);
await page.getByRole('button',{name:'Dial detail',exact:true}).click(); await wait(1700); await shot('13-viewer-macro','experience',.65);
await page.getByRole('button',{name:'Reset',exact:false}).click(); await wait(1700);
const start = await page.evaluate(() => ({ frames:window.__VYREN.diagnostics().activeFrames,time:performance.now() }));
await wait(5000);
const end = await page.evaluate(() => ({ diagnostic:window.__VYREN.diagnostics(),time:performance.now() }));
const measuredFps = (end.diagnostic.activeFrames-start.frames)*1000/(end.time-start.time);
for (const [name,id,p] of [['14-details','details',.6],['15-finale','moment',.5]]) { await scene(id,p); await shot(name,id,p); }
// A real browser scroll recording, including all sticky progress and reverse assembly.
await page.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; scrollTo(0,0); });
await wait(600);
const motionSamples=[];
async function glide(target,duration) {
  await page.evaluate(async ({target,duration})=>{const from=scrollY,start=performance.now();await new Promise(resolve=>{const frame=now=>{const p=Math.min(1,(now-start)/duration);scrollTo({top:from+(target-from)*p,behavior:'instant'});if(p<1)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});},{target,duration});
}
let cursor=0;
for (const id of ['watch','manifesto','craftsmanship','movement','assembly','materials','experience','details','moment']) {
  const bounds=await page.evaluate(id=>{const e=document.getElementById(id);return {start:e.offsetTop,end:e.offsetTop+e.offsetHeight-innerHeight};},id);
  const target=Math.max(bounds.start,bounds.end);
  motionSamples.push({id,stage:'begin',elapsedMs:Date.now()-filmingStart,scrollY:cursor});
  await glide(target,Math.max(850,(target-cursor)*2)); cursor=target;
  await wait(500);
  motionSamples.push({id,stage:'end',elapsedMs:Date.now()-filmingStart,scrollY:target});
}
await scene('assembly',.56);
await glide(await page.evaluate(()=>document.getElementById('assembly').offsetTop),2600);await wait(800);
const video=page.video(); await page.close(); await context.close();
await video.saveAs(path.join(root,'scroll-through.webm'));
const mobile = await browser.newContext({ viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,recordVideo:{dir:path.join(root,'mobile-recordings'),size:{width:390,height:844}} });
const mp=await mobile.newPage(); await mp.goto('http://127.0.0.1:3001/');await mp.waitForTimeout(3000);
await mp.screenshot({path:path.join(root,'16-mobile-hero.png')});
for(const [name,id,p] of [['17-mobile-assembly','assembly',.56],['18-mobile-viewer','experience',.65]]){await mp.evaluate(({id,p})=>{const e=document.getElementById(id);scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*p,behavior:'instant'});},{id,p});await mp.waitForFunction(()=>window.__VYREN?.diagnostics().ready);await mp.waitForTimeout(1600);await mp.screenshot({path:path.join(root,`${name}.png`)});}
const mv=mp.video();await mp.close();await mobile.close();await mv.saveAs(path.join(root,'mobile-motion.webm'));
fs.writeFileSync(path.join(root,'capture.json'),JSON.stringify({mode,browser:browser.version(),testedAt:new Date().toISOString(),initial,measuredFps,viewer:end.diagnostic,captures,motionSamples,errors,failures,comparison:'Same production browser, DPR 1, viewport and normalized scene progress. New framing, exposure and scene heights are intentional changes; scene pixel offsets therefore differ.'},null,2));
await browser.close();console.log(JSON.stringify({mode,measuredFps,initial,errors,failures,captures:captures.length,root}));
