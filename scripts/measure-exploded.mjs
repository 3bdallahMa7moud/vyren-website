import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const origin=process.argv[2]||'http://127.0.0.1:3001';
const output=path.resolve('qa/exploded-cycles/performance');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const reports=[];
for(const scenario of [
  {name:'desktop-local',width:1440,height:1000,duration:12000,network:null},
  {name:'mobile-local',width:390,height:844,duration:12000,network:null},
  {name:'mobile-emulated-4mbps',width:390,height:844,duration:16000,network:{offline:false,latency:120,downloadThroughput:500000,uploadThroughput:125000}},
]){
  const context=await browser.newContext({viewport:{width:scenario.width,height:scenario.height},deviceScaleFactor:1,isMobile:scenario.width<769,hasTouch:scenario.width<769});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>performance.setResourceTimingBufferSize(5000));
  const cdp=await context.newCDPSession(page),requests=new Map();
  await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent',e=>{if(e.request.url.includes('/exploded-cycles/'))requests.set(e.requestId,{url:e.request.url,encodedBodyBytes:0,encodedTransferBytes:0,cached:false,finished:false,aborted:false});});
  cdp.on('Network.dataReceived',e=>{const r=requests.get(e.requestId);if(r)r.encodedBodyBytes+=e.encodedDataLength;});
  cdp.on('Network.requestServedFromCache',e=>{const r=requests.get(e.requestId);if(r)r.cached=true;});
  cdp.on('Network.loadingFinished',e=>{const r=requests.get(e.requestId);if(r){r.finished=true;r.encodedTransferBytes=r.cached?0:e.encodedDataLength;}});
  cdp.on('Network.loadingFailed',e=>{const r=requests.get(e.requestId);if(r)r.aborted=true;});
  if(scenario.network)await cdp.send('Network.emulateNetworkConditions',scenario.network);
  await page.goto(origin);await page.waitForTimeout(2300);
  const initial=await page.evaluate(()=>(performance.getEntriesByType('resource')).filter(e=>e.name.includes('/exploded-cycles/')).map(e=>e.name));
  await page.evaluate(()=>{const e=document.getElementById('assembly');scrollTo({top:e.offsetTop,behavior:'instant'});});
  await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.displayedFrame===0;},null,{timeout:90000});
  async function glide(to,duration){
    return page.evaluate(async({to,duration})=>{
      const e=document.getElementById('assembly'),startY=scrollY,endY=e.offsetTop+(e.offsetHeight-innerHeight)*to,start=performance.now(),samples=[];
      await new Promise(resolve=>{
        let previous=start;
        const step=now=>{const p=Math.min(1,(now-start)/duration);scrollTo({top:startY+(endY-startY)*p,behavior:'instant'});const d=window.__VYREN_SEQUENCE.diagnostics();samples.push({time:now-start,rafMs:now-previous,desired:d.desiredFrame,displayed:d.displayedFrame,cache:d.cacheFrames,pending:d.pending,progress:d.displayedProgress});previous=now;if(p<1)requestAnimationFrame(step);else resolve();};requestAnimationFrame(step);
      });
      return samples;
    },{to,duration});
  }
  const passes=[];
  for(const [name,to,duration] of [['cold-forward',1,scenario.duration],['reverse',0,scenario.duration],['warm-forward',1,scenario.duration],['rapid-reverse',0,3500]]){
    const samples=await glide(to,duration);await page.waitForTimeout(1200);
    await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE.diagnostics();return d.displayedFrame===d.desiredFrame;},null,{timeout:60000});
    const lags=samples.map(s=>Math.abs(s.desired-s.displayed)).sort((a,b)=>a-b),raf=samples.map(s=>s.rafMs).sort((a,b)=>a-b);
    const shown=[...new Set(samples.map(s=>s.displayed))];
    passes.push({name,durationMs:duration,samples:samples.length,distinctDisplayedTimelineFrames:shown.length,negativeFrames:samples.filter(s=>s.displayed<0).length,frameLag:{median:lags[Math.floor(lags.length*.5)],p95:lags[Math.floor(lags.length*.95)],max:lags.at(-1)},rafIntervalMs:{median:raf[Math.floor(raf.length*.5)],p95:raf[Math.floor(raf.length*.95)],max:raf.at(-1)},final:await page.evaluate(()=>window.__VYREN_SEQUENCE.diagnostics()),samplesFile:`${scenario.name}-${name}.json`});
    fs.writeFileSync(path.join(output,`${scenario.name}-${name}.json`),JSON.stringify(samples));
  }
  const transfer=await page.evaluate(()=>{
    const entries=(performance.getEntriesByType('resource')).filter(e=>e.name.includes('/exploded-cycles/'));
    return {requests:entries.length,wireBytes:entries.reduce((n,e)=>n+e.transferSize,0),encodedBytes:entries.reduce((n,e)=>n+e.encodedBodySize,0),decodedBytes:entries.reduce((n,e)=>n+e.decodedBodySize,0),uniqueResources:new Set(entries.map(e=>e.name)).size,entries:entries.map(e=>({url:new URL(e.name).pathname,transferBytes:e.transferSize,encodedBodyBytes:e.encodedBodySize,durationMs:e.duration}))};
  });
  const final=await page.evaluate(()=>window.__VYREN_SEQUENCE.diagnostics());
  await page.screenshot({path:path.join(output,`${scenario.name}-restored.png`)});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(1400);
  const disposed=await page.evaluate(()=>window.__VYREN_SEQUENCE.diagnostics());
  const network={completedTransferBytes:[...requests.values()].reduce((n,r)=>n+r.encodedTransferBytes,0),abortedEncodedBodyBytes:[...requests.values()].filter(r=>r.aborted&&!r.cached).reduce((n,r)=>n+r.encodedBodyBytes,0),requests:[...requests.values()]};
  reports.push({scenario,initialSequenceResources:initial,passes,transfer,network,final,disposed,errors});
  console.log(JSON.stringify({scenario:scenario.name,wireBytes:transfer.wireBytes,cachePeak:final.peakCacheFrames,lag95:passes.map(p=>[p.name,p.frameLag.p95]),errors}));
  await context.close();
}
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({browser:browser.version(),origin,scope:'Actual headless desktop Edge at DPR 1; local and CDP network emulation. RAF intervals are page scheduling measurements, not proof of displayed cinematic frame rate. Decoder bytes exclude canvas, in-flight decoding and browser/GPU overhead. transferSize includes response overhead and cache-hit entries have zero network bytes. Aborted requests may not be represented completely in Resource Timing.',reports},null,2));
await browser.close();
