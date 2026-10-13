import {test,expect,type Page} from '@playwright/test';
import fs from 'node:fs';
import * as THREE from 'three';
import sharp from 'sharp';

const out='qa/phase3/legacy-viewer';fs.mkdirSync(out,{recursive:true});
const model='**/vyren-noctis-01-meshopt.glb';
const diagnostics=(page:Page)=>page.evaluate(()=>window.__VYREN!.diagnostics());
const delta=(a:number[],b:number[])=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
async function ready(page:Page){await page.waitForFunction(()=>window.__VYREN?.diagnostics().ready&&window.__VYREN.diagnostics().activeFrames>0);await page.waitForTimeout(1200);}
async function open(page:Page){await page.goto('/#experience');await page.getByRole('button',{name:'Free 3D',exact:true}).click();await align(page);await ready(page);await page.getByRole('button',{name:'front view',exact:true}).click();await page.waitForTimeout(1200);}
async function align(page:Page){await page.evaluate(()=>scrollTo({top:document.querySelector('.viewer-body')!.getBoundingClientRect().top+scrollY-85,behavior:'instant'}));await page.waitForTimeout(200);}
const b=fs.readFileSync('public/assets/vyren-noctis-01.glb'), len=b.readUInt32LE(12), gltf=JSON.parse(b.subarray(20,20+len).toString());
const points:THREE.Vector3[]=[];
function walk(index:number,parent:THREE.Matrix4){const n=gltf.nodes[index],m=new THREE.Matrix4();if(n.matrix)m.fromArray(n.matrix);else m.compose(new THREE.Vector3(...(n.translation??[0,0,0])),new THREE.Quaternion(...(n.rotation??[0,0,0,1])),new THREE.Vector3(...(n.scale??[1,1,1])));m.premultiply(parent);
  if(n.mesh!==undefined)for(const p of gltf.meshes[n.mesh].primitives){const a=gltf.accessors[p.attributes.POSITION],v=gltf.bufferViews[a.bufferView],base=28+len+(v.byteOffset??0)+(a.byteOffset??0),stride=v.byteStride??12;for(let i=0;i<a.count;i++){const o=base+i*stride;points.push(new THREE.Vector3(b.readFloatLE(o),b.readFloatLE(o+4),b.readFloatLE(o+8)).applyMatrix4(m));}}
  for(const child of n.children??[])walk(child,m);
}
for(const root of gltf.scenes[gltf.scene??0].nodes)walk(root,new THREE.Matrix4());
function framing(d:any){const camera=new THREE.PerspectiveCamera(d.fov,d.canvas[0]/d.canvas[1],.0001,5);camera.position.fromArray(d.camera);camera.up.fromArray(d.up);camera.lookAt(new THREE.Vector3(...d.target));camera.updateMatrixWorld(true);const min=new THREE.Vector3(Infinity,Infinity,Infinity),max=new THREE.Vector3(-Infinity,-Infinity,-Infinity),p=new THREE.Vector3();for(const original of points){p.copy(original).project(camera);min.min(p);max.max(p);}return {min:min.toArray(),max:max.toArray(),vertices:points.length};}

test('two actual WebGL context recoveries rebuild lighting and retain the pose',async({page})=>{
  await open(page);await page.getByRole('button',{name:'rear view',exact:true}).click();await page.waitForTimeout(1200);
  const before=await diagnostics(page),recoveries=[];
  for(let i=0;i<2;i++){
    await page.evaluate(()=>{const canvas=document.querySelector<HTMLCanvasElement>('[data-vyren-canvas]')!;Object.assign(window,{__s7Loss:canvas.getContext('webgl2')!.getExtension('WEBGL_lose_context')});(window as any).__s7Loss.loseContext();});
    await page.waitForFunction(()=>window.__VYREN!.diagnostics().contextLost);await expect(page.getByRole('button',{name:'Try again'})).toBeVisible();
    await page.evaluate(()=>(window as any).__s7Loss.restoreContext());await ready(page);
    const restored=await diagnostics(page);expect(restored.contextLost).toBe(false);expect(restored.textures).toBeGreaterThan(0);expect(delta(before.camera,restored.camera)).toBeLessThan(1e-5);expect(restored.restMatrixDelta).toBe(0);
    await expect(page.locator('[data-vyren-canvas]')).toHaveCount(1);await expect(page.locator('.viewer-slot')).toHaveAttribute('data-ready','true');recoveries.push(restored);
  }
  await align(page);await page.screenshot({path:`${out}/context-restored.png`});fs.writeFileSync(`${out}/context-recovery.json`,JSON.stringify({before,recoveries},null,2));
});

test('a transient network failure retries automatically',async({page})=>{
  let requests=0;await page.route(model,r=>++requests===1?r.abort('failed'):r.continue());await open(page);expect(requests).toBe(2);await expect(page.locator('[data-vyren-canvas]')).toHaveCount(1);
});

test('exhausted network retries expose a working manual retry',async({page})=>{
  let blocked=true,requests=0;await page.route(model,r=>{requests++;return blocked?r.abort('failed'):r.continue();});await page.goto('/#experience');await page.getByRole('button',{name:'Free 3D',exact:true}).click();
  await expect(page.getByRole('button',{name:'Try again'})).toBeVisible();expect(requests).toBe(3);await expect(page.getByRole('button',{name:'Interact with the watch'})).toBeDisabled();
  blocked=false;await page.getByRole('button',{name:'Try again'}).click();await ready(page);expect(requests).toBe(4);await expect(page.getByRole('button',{name:'Interact with the watch'})).toBeEnabled();await expect(page.locator('[data-vyren-canvas]')).toHaveCount(1);
});

test('focused keyboard exploration rotates, zooms and finishes without a trap',async({page})=>{
  await open(page);const before=await diagnostics(page);await page.getByRole('button',{name:'Interact with the watch'}).focus();await page.keyboard.press('Enter');
  await expect(page.locator('[data-vyren-canvas]')).toBeFocused();await page.waitForTimeout(100);await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowUp');await page.waitForTimeout(200);
  const rotated=await diagnostics(page);expect(delta(before.camera,rotated.camera)).toBeGreaterThan(.001);
  await page.keyboard.press('+');await page.waitForTimeout(500);const zoomed=await diagnostics(page);expect(new THREE.Vector3(...zoomed.camera).distanceTo(new THREE.Vector3(...zoomed.target))).toBeLessThan(new THREE.Vector3(...rotated.camera).distanceTo(new THREE.Vector3(...rotated.target)));
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Interact with the watch'})).toBeFocused();await expect(page.getByRole('button',{name:'Interact with the watch'})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button',{name:'Reset',exact:false}).click();await page.waitForTimeout(1200);expect(delta(before.camera,(await diagnostics(page)).camera)).toBeLessThan(1e-5);
});

for(const [width,height] of [[1440,1000],[1920,1080],[1280,720],[768,1024],[390,844],[360,640],[844,390]])test(`complete-product framing and readable controls ${width}×${height}`,async({browser})=>{
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:width<=768?2:1,isMobile:width<=768,hasTouch:width<=768}),page=await context.newPage();await open(page);const evidence=[];
  for(const [pose,label] of [['front',null],['rear','rear view'],['detail','Dial detail']] as const){if(label){await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(1200);}await align(page);
    const d=await diagnostics(page),bounds=framing(d);if(pose!=='detail'){expect(bounds.min[0]).toBeGreaterThan(-.94);expect(bounds.min[1]).toBeGreaterThan(-.94);expect(bounds.max[0]).toBeLessThan(.94);expect(bounds.max[1]).toBeLessThan(.94);}
    if(width<=768)expect(d.dpr).toBe(2);
    const layout=await page.evaluate(()=>{const canvas=document.querySelector('[data-vyren-canvas]')!.getBoundingClientRect(),footer=document.querySelector('.viewer-footer')!.getBoundingClientRect();return {scrollWidth:document.documentElement.scrollWidth,canvasBottom:canvas.bottom,footerTop:footer.top,fonts:[...document.querySelectorAll('.viewer-controls button')].map(e=>parseFloat(getComputedStyle(e).fontSize))};});
    expect(layout.scrollWidth).toBeLessThanOrEqual(width);expect(layout.footerTop).toBeGreaterThanOrEqual(layout.canvasBottom-.1);expect(Math.min(...layout.fonts)).toBeGreaterThanOrEqual(11);
    await page.screenshot({path:`${out}/${width}x${height}-${pose}.png`});evidence.push({pose,diagnostics:d,bounds,layout});
  }
  fs.writeFileSync(`${out}/framing-${width}.json`,JSON.stringify(evidence,null,2));await context.close();
});

test('low power has a stable pressed label; idle and offscreen do not render',async({page})=>{
  await open(page);const button=page.getByRole('button',{name:'Low power',exact:true});await button.click();await expect(button).toHaveAttribute('aria-pressed','true');await page.waitForTimeout(200);expect((await diagnostics(page)).dpr).toBe(.8);await button.click();await expect(button).toHaveAttribute('aria-pressed','false');await page.waitForTimeout(200);
  const before=await diagnostics(page);await page.waitForTimeout(1000);expect((await diagnostics(page)).activeFrames).toBe(before.activeFrames);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);const inactive=await diagnostics(page);await page.waitForTimeout(500);expect((await diagnostics(page)).activeFrames).toBe(inactive.activeFrames);
});

test('unavailable WebGL leaves the matched photograph and retry accessible',async({page})=>{
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,...args:Parameters<typeof get>){if(args[0].startsWith('webgl'))return null;return get.apply(this,args);} as typeof get;});await page.goto('/#experience');await page.getByRole('button',{name:'Free 3D',exact:true}).click();await expect(page.getByRole('button',{name:'Try again'})).toBeVisible();await expect(page.locator('.viewer-slot img')).toBeVisible();await page.waitForFunction(()=>{const e=document.querySelector<HTMLImageElement>('.viewer-slot img')!;return e.complete&&e.naturalWidth>0;});
});

