import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const output=path.resolve('qa/exploded-cycles/after/recording-review');fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await page.goto(pathToFileURL(path.resolve('qa/exploded-cycles/after/assembly-scroll.webm')).href);
await page.waitForFunction(()=>{const v=document.querySelector('video');return v?.readyState>=2&&Number.isFinite(v.duration);});
const duration=await page.evaluate(()=>{const v=document.querySelector('video');v.pause();return v.duration;});
await page.addStyleTag({content:'html,body{margin:0;background:#14191e}video{width:1440px;height:1000px;object-fit:contain}'});
await page.evaluate(()=>document.querySelector('video').controls=false);
const frames=[];
for(let i=0;i<18;i++){
  const time=duration*i/18;
  await page.evaluate(async time=>{const v=document.querySelector('video');await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=Math.max(.01,time);});},time);
  await page.waitForTimeout(80);const png=await page.locator('video').screenshot();
  fs.writeFileSync(path.join(output,`${i.toString().padStart(2,'0')}.png`),png);
  const tile=await sharp(png).resize(480,333).toBuffer();frames.push({input:tile,left:i%3*480,top:Math.floor(i/3)*333});
}
await sharp({create:{width:1440,height:1998,channels:3,background:'#14191e'}}).composite(frames).jpeg({quality:94}).toFile(path.join(output,'motion-filmstrip.jpg'));
fs.writeFileSync(path.join(output,'review.json'),JSON.stringify({durationSeconds:duration,frames:18,source:'Decoded actual browser recording, sampled with paused HTML video seeking in Edge. Visual review is separate from these metrics.'},null,2));
await browser.close();console.log(JSON.stringify({durationSeconds:duration,samples:18}));
