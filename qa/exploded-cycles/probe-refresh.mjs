import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:3000/#assembly');await page.waitForTimeout(1800);
await page.evaluate(()=>{const e=document.getElementById('assembly');scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*.33,behavior:'instant'});});await page.waitForTimeout(1500);
const measure=()=>{const e=document.getElementById('assembly');return {y:scrollY,progress:(scrollY-e.offsetTop)/(e.offsetHeight-innerHeight),hash:location.hash};};
const before=await page.evaluate(measure);await page.reload();await page.waitForTimeout(2200);const after=await page.evaluate(measure);
fs.writeFileSync(`qa/exploded-cycles/refresh-probe-${process.argv[2]||'before-fix'}.json`,JSON.stringify({before,after},null,2));console.log(JSON.stringify({before,after}));await browser.close();
