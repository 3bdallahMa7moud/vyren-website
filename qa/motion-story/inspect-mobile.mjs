import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.goto('http://127.0.0.1:3002',{waitUntil:'networkidle'});
const result=[];
for(const kind of ['titanium','sapphire','anthracite','rubber'])for(const p of [0,.53]){
  await page.locator(`.material-${kind}`).evaluate((el,{kind,p})=>{
    if(kind==='titanium'){const img=el.querySelector('.light-inspection');const r=img.getBoundingClientRect();scrollTo({top:r.top+scrollY-innerHeight*.8+p*(r.height+innerHeight*.55),behavior:'instant'});}
    else{const top=el.getBoundingClientRect().top+scrollY;scrollTo({top:top-innerHeight*.72+p*(el.offsetHeight+innerHeight*.3),behavior:'instant'});}
  },{kind,p});
  await page.waitForTimeout(1500);
  result.push(await page.locator(`.material-${kind}`).evaluate((el,p)=>{const name=el.querySelector('.material-name'),image=el.querySelector('.material-image'),s=getComputedStyle(name);return{kind:el.className,p,top:el.getBoundingClientRect().top,clip:s.clipPath,display:s.display,opacity:s.opacity,transform:s.transform,inlineStyle:name.getAttribute('style'),imageStyle:image.getAttribute('style'),nameBox:name.getBoundingClientRect().toJSON(),motion:window.__VYREN_MOTION()};},p));
  await page.screenshot({path:`qa/motion-story/probe-${kind}-${p}.png`});
}
console.log(JSON.stringify(result,null,2));await browser.close();
