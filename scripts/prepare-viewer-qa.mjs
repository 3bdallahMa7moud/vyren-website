import fs from 'node:fs';
fs.mkdirSync('qa/section-seven-fixes/regression-tests',{recursive:true});
for(const [source,name] of [['qa/tests/experience.spec.ts','experience'],['qa/phase2-cinematic/tests/phase2.spec.ts','phase2'],['qa/exploded-cycles/tests/sequence.spec.ts','sequence']]){
  let text=fs.readFileSync(source,'utf8').replace("path.resolve('qa/exploded-cycles/sequence-tests')","path.resolve('qa/section-seven-fixes/sequence-regression')");
  // Media changes rebuild GSAP layout; wait for that before seeking or loading
  // a viewer whose assets intentionally stay lazy while it is offscreen.
  if(name==='phase2') text=text.replace("await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/#experience');await ready(page);","await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>window.__VYREN_MOTION?.().reducedMotion===false&&window.__VYREN_MOTION().triggers>0);await page.goto('/#experience');await page.locator('.viewer-slot').scrollIntoViewIfNeeded();await ready(page);");
  if(name==='sequence') text=text.replace('async function seek(page:Page,p:number){',`async function seek(page:Page,p:number){
  await page.waitForFunction(()=>{const d=window.__VYREN_MOTION?.();return !!d&&d.reducedMotion===matchMedia('(prefers-reduced-motion: reduce)').matches&&(d.reducedMotion?d.triggers===0:d.triggers>0);});
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));`);
  fs.writeFileSync(`qa/section-seven-fixes/regression-tests/${name}.spec.ts`,text);
}
let loading=fs.readFileSync('scripts/measure-section-seven-loading.mjs','utf8').replaceAll('qa/section-seven/','qa/section-seven-fixes/').replaceAll('vyren-noctis-01.glb','vyren-noctis-01-meshopt.glb');
fs.writeFileSync('scripts/measure-viewer-loading.mjs',loading);
