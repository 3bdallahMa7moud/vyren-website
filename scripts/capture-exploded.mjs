import fs from 'node:fs';
import path from 'node:path';
// Configure the retained QA video runtime before loading Playwright's registry.
const retainedRuntime=path.resolve('qa/phase2-cinematic/runtime');
if(!process.env.PLAYWRIGHT_BROWSERS_PATH&&fs.existsSync(path.join(retainedRuntime,'ffmpeg-1013','ffmpeg-win64.exe')))process.env.PLAYWRIGHT_BROWSERS_PATH=retainedRuntime;
const { chromium }=await import('@playwright/test');
const mode=process.argv[2]||'after';const origin=process.argv[3]||'http://127.0.0.1:3001';const out=path.resolve('qa/exploded-cycles',mode);fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,recordVideo:{dir:path.join(out,'recordings'),size:{width:1440,height:1000}}});
const page=await context.newPage();const errors=[],failed=[],captures=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
await page.goto(origin+'/#assembly');
async function seek(p){await page.evaluate(p=>{const el=document.getElementById('assembly');scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p,behavior:'instant'});},p);await page.waitForTimeout(1200);if(mode==='after')await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.ready&&d.displayedFrame>=0&&d.desiredFrame===d.displayedFrame;});else await page.waitForFunction(()=>window.__VYREN?.diagnostics().ready);}
for(const [name,p] of [['assembled',.02],['partial',.32],['revealing',.57],['full',.72],['restored',1]]){await seek(p);await page.screenshot({path:path.join(out,`${name}.png`)});captures.push({name,p,diagnostics:await page.evaluate(()=>window.__VYREN_SEQUENCE?.diagnostics()||window.__VYREN?.diagnostics())});}
await seek(0);const motionStart=Date.now();
async function glide(to,duration){await page.evaluate(async({to,duration})=>{const e=document.getElementById('assembly'),startY=scrollY,endY=e.offsetTop+(e.offsetHeight-innerHeight)*to,start=performance.now();await new Promise(resolve=>{const f=now=>{const p=Math.min(1,(now-start)/duration);scrollTo({top:startY+(endY-startY)*p,behavior:'instant'});if(p<1)requestAnimationFrame(f);else resolve();};requestAnimationFrame(f);});},{to,duration});}
await glide(1,9000);await page.waitForTimeout(700);await glide(0,9000);await page.waitForTimeout(700);
const video=page.video();await page.close();await context.close();await video.saveAs(path.join(out,'assembly-scroll.webm'));
const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const mp=await mobile.newPage();await mp.goto(origin+'/#assembly');await mp.waitForTimeout(1600);await mp.evaluate(()=>{const e=document.getElementById('assembly');scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*.72,behavior:'instant'});});await mp.waitForTimeout(1200);if(mode==='after')await mp.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.ready&&d.displayedFrame>=0&&d.desiredFrame===d.displayedFrame;});else await mp.waitForFunction(()=>window.__VYREN?.diagnostics().ready);await mp.screenshot({path:path.join(out,'mobile-full.png')});await mobile.close();
fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify({mode,origin,browser:browser.version(),videoRuntime:process.env.PLAYWRIGHT_BROWSERS_PATH,viewport:[1440,1000],dpr:1,recording:'Actual browser forward and reverse scroll, not a slideshow.',motionDurationMs:Date.now()-motionStart,captures,errors,failed},null,2));await browser.close();console.log(JSON.stringify({mode,captures:captures.length,errors,failed}));
