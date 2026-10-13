import {chromium} from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:3001/');await page.waitForTimeout(4000);
const result=await page.evaluate(async()=>{const image=document.querySelector('.hero-product .product-media img');return {url:location.href,reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,saveData:navigator.connection?.saveData,width:innerWidth,poster:image?{src:image.currentSrc,complete:image.complete,width:image.naturalWidth,decode:await image.decode().then(()=>true).catch(e=>e.message)}:null,orbitCount:document.querySelectorAll('.hero-orbit').length,resources:performance.getEntriesByType('resource').filter(e=>e.name.includes('hero-')).map(e=>({name:e.name,start:e.startTime,end:e.responseEnd}))};});
fs.writeFileSync('qa/section-seven-fixes/hero-harness-debug.json',JSON.stringify({...result,errors},null,2));console.log(JSON.stringify({...result,errors}));await browser.close();
