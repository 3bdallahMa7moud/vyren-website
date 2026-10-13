# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regression-tests\phase2.spec.ts >> authentic Hero orbit follows the poster once and skips mobile, reduced motion and deep links
- Location: qa\section-seven-fixes\regression-tests\phase2.spec.ts:61:1

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - link "Skip to content" [ref=f2e3] [cursor=pointer]:
      - /url: "#manifesto"
    - banner [ref=f2e4]:
      - link "VYREN home" [ref=f2e5] [cursor=pointer]:
        - /url: "#watch"
        - text: VYREN
      - navigation "Main navigation" [ref=f2e6]:
        - link "Watch" [ref=f2e7] [cursor=pointer]:
          - /url: "#watch"
        - link "Craftsmanship" [ref=f2e8] [cursor=pointer]:
          - /url: "#craftsmanship"
        - link "Experience" [ref=f2e9] [cursor=pointer]:
          - /url: "#experience"
        - link "Details" [ref=f2e10] [cursor=pointer]:
          - /url: "#details"
      - link "NOCTIS 01" [ref=f2e11] [cursor=pointer]:
        - /url: "#experience"
    - main [ref=f2e14]:
      - region [ref=f2e15]:
        - generic [ref=f2e16]:
          - generic [ref=f2e17]: THE NOCTIS COLLECTION
          - generic [ref=f2e18]: A STUDY IN PRECISION — 01
        - 'img "The actual VYREN NOCTIS 01: satin titanium-inspired case, anthracite open-heart dial and integrated black rubber strap" [ref=f2e22]'
        - generic [ref=f2e23]:
          - generic [ref=f2e24]: VYREN / NOCTIS 01
          - heading "Time, redefined." [level=1] [ref=f2e26]:
            - generic [ref=f2e27]: Time,
            - emphasis [ref=f2e31]: redefined.
          - paragraph [ref=f2e32]: Precision is not measured.It is experienced.
          - generic [ref=f2e33]:
            - link "Discover the watch" [ref=f2e34] [cursor=pointer]:
              - /url: "#manifesto"
            - link "Explore in 3D" [ref=f2e37] [cursor=pointer]:
              - /url: "#experience"
        - generic [ref=f2e39]:
          - link [ref=f2e40] [cursor=pointer]:
            - /url: "#manifesto"
          - generic [ref=f2e43]:
            - generic [ref=f2e44]: NOCTIS 01
            - generic [ref=f2e45]: Darkness reveals character.
          - generic [ref=f2e46]: DESIGN EXPLORATION / 2026
      - region [ref=f2e47]:
        - generic [ref=f2e48]:
          - generic [ref=f2e49]: "02"
          - generic [ref=f2e50]: An obsession with precision
        - heading "Every second has a story." [level=2] [ref=f2e51]:
          - generic [ref=f2e52]: EVERY SECOND
          - generic [ref=f2e53]: HAS A STORY.
        - generic:
          - generic:
            - img "The sculptural silhouette of the NOCTIS 01"
        - generic [ref=f2e54]:
          - generic [ref=f2e55]: The extraordinaryis in the ordinary.
          - paragraph [ref=f2e56]: Designed around the smallest details.Built to change the way we see time.
          - generic [ref=f2e57]: V / N° 01
      - region [ref=f2e58]:
        - generic [ref=f2e59]:
          - generic [ref=f2e60]:
            - generic [ref=f2e61]: "03"
            - generic [ref=f2e62]: Sculpted in titanium
          - generic [ref=f2e63]: THE ARCHITECTURE OF A WATCH
        - generic [ref=f2e64]:
          - heading [level=2] [ref=f2e65]:
            - text: Sculpted from
            - emphasis [ref=f2e66]: precision.
          - paragraph [ref=f2e67]: Not a line without a purpose.Not an edge without intention.
        - generic [ref=f2e68]:
          - img "Macro view of the actual brushed case, polished chamfer, lug and fluted crown" [ref=f2e71]
          - 'img "A second genuine Cycles camera view: crown flutes and engraved V" [ref=f2e74]'
          - generic [ref=f2e75]: 01 / SATIN SURFACE
          - generic [ref=f2e76]: 02 / CROWN & CHAMFER
          - generic [ref=f2e77]: ACTUAL NOCTIS GEOMETRYCYCLES MATERIAL STUDY / 03
        - generic [ref=f2e78]:
          - generic [ref=f2e79]: 01 — SURFACE & FORM
          - paragraph [ref=f2e80]: Titanium-inspired surfaces. Precisely framed reflections.An interplay of brushed planes and polished edges.
          - link "The material language" [ref=f2e81] [cursor=pointer]:
            - /url: "#materials"
      - region [ref=f2e84]:
        - generic [ref=f2e85]:
          - img "The actual open-heart dial before the closer movement study" [ref=f2e88]
          - img "Actual exposed balance, hairspring, jewelled bearings and bridges in the VYREN VN-01 illustrative assembly" [ref=f2e91]
          - generic [ref=f2e93]:
            - generic [ref=f2e94]:
              - generic [ref=f2e95]: "04"
              - generic [ref=f2e96]: The heart of time
            - heading [level=2] [ref=f2e97]:
              - text: The artof
              - emphasis [ref=f2e98]: motion.
            - paragraph [ref=f2e99]: Behind the quiet surface,a world of considered detail.
            - paragraph [ref=f2e100]: An open-heart aperture offers a glimpse into the VN-01 — an illustrative mechanical landscape of bridges, balance and spring.
          - generic [ref=f2e101]: BALANCE & HAIRSPRINGVisual mechanism study
          - generic [ref=f2e106]:
            - text: SUPPORTING BRIDGE
            - generic [ref=f2e107]: Considered down to the smallest form.
          - generic [ref=f2e108]:
            - generic [ref=f2e109]: MECHANICAL EXPRESSION / VN-01
            - generic [ref=f2e110]: Concept geometry. Unhurried detail.
      - region "Every detail. In its place." [ref=f2e111]:
        - generic [ref=f2e112]:
          - generic:
            - generic:
              - generic: "05"
              - generic: Beyond the surface
            - heading "Every detail. In its place." [level=2]:
              - text: Every detail.
              - emphasis: In its place.
            - paragraph: A singular vision.Revealed, layer by layer.
          - img "The component layers of the NOCTIS 01" [ref=f2e113]:
            - img "NOCTIS 01, assembled" [ref=f2e115]
          - generic [aria-hidden]:
            - generic: 01 Sapphire-style crystal
            - generic: 02 Anthracite dial
            - generic: 03 VN-01 visual assembly
            - generic: 04 Sculpted case
          - generic [ref=f2e116]:
            - generic [ref=f2e117]: Assembled / 01
            - generic [ref=f2e119]: Scroll to reveal. Scroll back to restore.
      - region [ref=f2e120]:
        - generic [ref=f2e121]:
          - generic [ref=f2e122]:
            - generic [ref=f2e123]:
              - generic [ref=f2e124]: "06"
              - generic [ref=f2e125]: Materials of time
            - heading [level=2] [ref=f2e126]:
              - text: Built to be
              - emphasis [ref=f2e127]: felt.
            - generic [ref=f2e128]: 01 — 04
          - generic [ref=f2e130]:
            - article [ref=f2e131]:
              - generic [ref=f2e132]:
                - img "Actual VYREN titanium design detail, rendered in Blender Cycles" [ref=f2e134]
                - generic [ref=f2e135]: 01 / MATERIAL STUDY
              - generic [ref=f2e136]:
                - text: A study in light.
                - heading "Titanium —" [level=3] [ref=f2e137]:
                  - generic [ref=f2e138]: Titanium
                  - generic [ref=f2e139]: —
                - paragraph [ref=f2e140]: Satin surfaces meet polished edges. An architectural expression of strength and restraint.
            - article [ref=f2e141]:
              - generic [ref=f2e142]:
                - img "Actual VYREN sapphire design detail, rendered in Blender Cycles" [ref=f2e144]
                - generic [ref=f2e145]: 02 / MATERIAL STUDY
              - generic [ref=f2e146]:
                - text: Clarity with depth.
                - heading "Sapphire —" [level=3] [ref=f2e147]:
                  - generic [ref=f2e148]: Sapphire
                  - generic [ref=f2e149]: —
                - paragraph [ref=f2e150]: A sapphire-style lens catches the light while revealing the intricate landscape beneath.
            - article [ref=f2e151]:
              - generic [ref=f2e152]:
                - img "Actual VYREN anthracite design detail, rendered in Blender Cycles" [ref=f2e154]
                - generic [ref=f2e155]: 03 / MATERIAL STUDY
              - generic [ref=f2e156]:
                - text: Darkness, defined.
                - heading "Anthracite —" [level=3] [ref=f2e157]:
                  - generic [ref=f2e158]: Anthracite
                  - generic [ref=f2e159]: —
                - paragraph [ref=f2e160]: A considered dial. Applied markers, sculptural hands and an open window into motion.
            - article [ref=f2e161]:
              - generic [ref=f2e162]:
                - img "Actual VYREN rubber design detail, rendered in Blender Cycles" [ref=f2e164]
                - generic [ref=f2e165]: 04 / MATERIAL STUDY
              - generic [ref=f2e166]:
                - text: The softer side of precision.
                - heading "Rubber —" [level=3] [ref=f2e167]:
                  - generic [ref=f2e168]: Rubber
                  - generic [ref=f2e169]: —
                - paragraph [ref=f2e170]: An integrated black strap follows the case. Quiet texture. A continuous silhouette.
          - generic [ref=f2e171]:
            - generic [ref=f2e172]: Four textures. One expression.
            - generic [ref=f2e174]: Continue scrolling
      - region [ref=f2e177]:
        - generic [ref=f2e178]:
          - generic [ref=f2e179]:
            - generic [ref=f2e180]: "07"
            - generic [ref=f2e181]: Explore every angle
          - heading [level=2] [ref=f2e182]:
            - text: Make time
            - emphasis [ref=f2e183]: yours.
          - paragraph [ref=f2e184]: A closer look changes everything.
        - generic [ref=f2e185]:
          - generic: NOCTIS 0141 MM / CONCEPT STUDY
          - generic "Interactive 3D view of VYREN NOCTIS 01" [ref=f2e186]:
            - img "NOCTIS 01 in the same studio pose as the interactive view" [ref=f2e188]
          - generic [ref=f2e189]:
            - generic [ref=f2e190]: A watch with nothing to hide.
            - button "Interact with the watch" [disabled] [ref=f2e191]:
              - text: Interact with the watch
              - generic [aria-hidden] [ref=f2e192]: ↔
        - group "3D viewer controls" [ref=f2e194]:
          - generic [ref=f2e195]:
            - button "front view" [disabled] [pressed] [ref=f2e196]
            - button "rear view" [disabled] [ref=f2e197]
            - button "Dial detail" [disabled] [ref=f2e198]
            - button "Reset" [disabled] [ref=f2e199]
          - generic [ref=f2e202]:
            - button "Zoom out" [disabled] [ref=f2e203]: −
            - button "Zoom in" [disabled] [ref=f2e204]: +
            - button "Low power" [disabled] [ref=f2e205]
        - paragraph [ref=f2e206]: A genuine 3D model. Materials and mechanism are a visual concept, not manufactured specifications.
      - region [ref=f2e207]:
        - generic [ref=f2e208]:
          - generic [ref=f2e209]:
            - generic [ref=f2e210]: "08"
            - generic [ref=f2e211]: The details define everything
          - generic [ref=f2e212]: NOCTIS 01 / DESIGN DOSSIER
        - heading [level=2] [ref=f2e213]:
          - text: Precision in
          - emphasis [ref=f2e214]: every form.
        - generic [ref=f2e215]:
          - generic [ref=f2e216]:
            - img "Front elevation of the NOCTIS 01 concept, with its verified 41 millimetre circular case" [ref=f2e218]
            - generic: 41 MM
            - generic [ref=f2e219]: CIRCULAR CASE DIAMETER
          - generic [ref=f2e220]:
            - generic [ref=f2e221]:
              - generic [ref=f2e222]:
                - term [ref=f2e223]: Model
                - definition [ref=f2e224]: NOCTIS 01
              - generic [ref=f2e225]:
                - term [ref=f2e226]: Case diameter
                - definition [ref=f2e227]: 41 mm
              - generic [ref=f2e228]:
                - term [ref=f2e229]: Case expression
                - definition [ref=f2e230]: Titanium-inspired
              - generic [ref=f2e231]:
                - term [ref=f2e232]: Crystal
                - definition [ref=f2e233]: Sapphire-style
              - generic [ref=f2e234]:
                - term [ref=f2e235]: Dial
                - definition [ref=f2e236]: Anthracite / semi-skeleton
              - generic [ref=f2e237]:
                - term [ref=f2e238]: Strap
                - definition [ref=f2e239]: Integrated black rubber
              - generic [ref=f2e240]:
                - term [ref=f2e241]: Mechanism
                - definition [ref=f2e242]: VN-01 visual concept
            - paragraph [ref=f2e243]: NOCTIS 01 is a fictional design exploration. Material names describe visual intent. No manufactured performance, certification or purchase availability is claimed.
      - region [ref=f2e244]:
        - img "The VYREN NOCTIS 01 in its final cinematic composition" [ref=f2e248]
        - generic [ref=f2e249]:
          - generic [ref=f2e250]:
            - generic [ref=f2e251]: "09"
            - generic [ref=f2e252]: Own the moment
          - heading "Time belongs to you." [level=2] [ref=f2e253]:
            - generic [ref=f2e254]: Time belongs
            - generic [ref=f2e257]:
              - text: to
              - emphasis [ref=f2e258]: you.
          - paragraph [ref=f2e259]: VYREN NOCTIS 01 — An exploration of precision.
          - link "Explore in 3D" [ref=f2e260] [cursor=pointer]:
            - /url: "#experience"
        - generic [ref=f2e263]:
          - generic [ref=f2e264]: VYREN
          - generic [ref=f2e265]: TIME, REDEFINED.
          - link "Back to top" [ref=f2e266] [cursor=pointer]:
            - /url: "#watch"
    - contentinfo [ref=f2e269]:
      - generic [ref=f2e270]: © 2026 VYREN. A fictional watch concept.
      - generic [ref=f2e271]: DESIGNED AROUND THE DETAILS.
  - alert [ref=f2e272]
```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | import fs from 'node:fs';
  3  | import path from 'node:path';
  4  | 
  5  | const output=path.resolve(process.env.VYREN_QA_ROOT?`${process.env.VYREN_QA_ROOT}/stress`:'qa/phase2-cinematic/stress');fs.mkdirSync(output,{recursive:true});
  6  | async function scene(page:Page,id:string,p=0){await page.evaluate(({id,p})=>{const e=document.getElementById(id)!;scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*p,behavior:'instant'});},{id,p});await page.waitForTimeout(1100);}
> 7  | async function ready(page:Page){await page.waitForFunction(()=>window.__VYREN?.diagnostics().ready);}
     |                                            ^ Error: page.waitForFunction: Test timeout of 180000ms exceeded.
  8  | async function sequenceReady(page:Page){await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.ready&&d.displayedFrame>=0&&d.desiredFrame===d.displayedFrame;});}
  9  | 
  10 | test('rapid assembly reversal, reload at intermediate progress and exact local rest matrices',async({page})=>{
  11 |   await page.goto('/');await scene(page,'assembly',.72);await sequenceReady(page);
  12 |   expect((await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  13 |   for(const p of [.19,.84,.35,.73,.25,.58,.92,.4,.01,.55,.2,.83]){await page.evaluate(p=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*p,behavior:'instant'});},p);await page.waitForTimeout(75);}
  14 |   await scene(page,'assembly',.29);await sequenceReady(page);const before=await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics());
  15 |   await page.reload();await page.waitForTimeout(1200);await sequenceReady(page);const reload=await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics());
  16 |   expect(reload.active).toBe(true);expect(reload.displayedFrame).toBe(before.displayedFrame);
  17 |   for(const p of [1,.72,0,.72,1,0]){await scene(page,'assembly',p);await sequenceReady(page);if(p!==.72){const d=await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics());expect(d.restMatrixDelta).toBe(0);}}
  18 |   await expect(page.locator('canvas[data-vyren-sequence]')).toHaveCount(1);
  19 |   fs.writeFileSync(path.join(output,'assembly.json'),JSON.stringify({before,reload,restored:await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())},null,2));
  20 | });
  21 | 
  22 | test('static and offscreen rendering suspend; preset, zoom and interaction resume cleanly',async({page})=>{
  23 |   await page.goto('/#experience');await ready(page);await page.waitForTimeout(2300);
  24 |   const before=await page.evaluate(()=>window.__VYREN!.diagnostics().activeFrames);await page.waitForTimeout(1800);
  25 |   expect(await page.evaluate(()=>window.__VYREN!.diagnostics().activeFrames)-before).toBeLessThan(3);
  26 |   await page.getByRole('button',{name:'rear view',exact:true}).click();await page.waitForTimeout(1300);expect((await page.evaluate(()=>window.__VYREN!.diagnostics())).camera[1]).toBeLessThan(0);
  27 |   await page.getByRole('button',{name:'Reset',exact:false}).click();await page.waitForTimeout(1300);
  28 |   await page.getByRole('button',{name:'Interact with the watch',exact:true}).click();const b=(await page.locator('.viewer-slot').boundingBox())!;
  29 |   await page.mouse.move(b.x+b.width*.5,b.y+b.height*.5);await page.mouse.down();await page.mouse.move(b.x+b.width*.65,b.y+b.height*.58,{steps:20});await page.mouse.up();
  30 |   await page.getByRole('button',{name:'Finish exploring'}).click();await page.getByRole('button',{name:'Reset',exact:false}).click();await page.waitForTimeout(1400);
  31 |   const a=await page.evaluate(()=>window.__VYREN!.diagnostics().camera);await page.getByRole('button',{name:'rear view',exact:true}).click();await page.waitForTimeout(1200);await page.getByRole('button',{name:'Reset',exact:false}).click();await page.waitForTimeout(1400);
  32 |   expect(await page.evaluate(()=>window.__VYREN!.diagnostics().camera)).toEqual(a);
  33 |   await scene(page,'watch');const off=await page.evaluate(()=>window.__VYREN!.diagnostics().activeFrames);await page.waitForTimeout(1800);expect(await page.evaluate(()=>window.__VYREN!.diagnostics().activeFrames)).toBe(off);
  34 | });
  35 | 
  36 | test('all responsive scenes and exact material holds remain readable at 1440 and 768',async({page})=>{
  37 |   await page.goto('/');await page.waitForTimeout(2000);
  38 |   for(const [p,index] of [[.05,0],[.35,1],[.64,2],[.94,3]] as const){await scene(page,'materials',p);const panel=page.locator('.material-panel').nth(index);const box=(await panel.boundingBox())!;expect(Math.abs(box.x-64.08)).toBeLessThan(4);await expect(panel.locator('.material-name')).toBeVisible();await page.screenshot({path:path.join(output,`material-${index}.png`)});}
  39 |   for(const width of [1440,768]){
  40 |     await page.setViewportSize({width,height:width===768?844:1000});await page.waitForTimeout(700);
  41 |     for(const id of ['watch','manifesto','craftsmanship','movement','assembly','materials','experience','details','moment']){await scene(page,id,.56);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await expect(page.locator(`#${id}`)).toBeVisible();}
  42 |     await page.evaluate(()=>{const e=document.getElementById('manifesto')!;scrollTo({top:e.offsetTop+e.offsetHeight-120,behavior:'instant'});});await page.waitForTimeout(1200);
  43 |     expect(await page.locator('.navigation').evaluate(e=>getComputedStyle(e).color)).toBe('rgb(241, 238, 232)');
  44 |     await page.screenshot({path:path.join(output,`editorial-exit-${width}.png`)});
  45 |     await scene(page,'manifesto');expect(await page.locator('.navigation').evaluate(e=>getComputedStyle(e).color)).toBe('rgb(8, 10, 13)');
  46 |   }
  47 | });
  48 | 
  49 | test('runtime motion preference changes preserve content and a single canvas',async({page})=>{
  50 |   await page.goto('/#assembly');await scene(page,'assembly',.72);await sequenceReady(page);
  51 |   const initial=await page.evaluate(()=>window.__VYREN_MOTION!());
  52 |   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(700);await scene(page,'assembly');
  53 |   await page.getByRole('button',{name:'Separate layers'}).click();await page.waitForTimeout(300);await sequenceReady(page);expect((await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  54 |   await page.getByRole('button',{name:'Reassemble',exact:true}).click();await page.waitForTimeout(300);await sequenceReady(page);expect((await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())).restMatrixDelta).toBe(0);
  55 |   await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(1000);await scene(page,'assembly',.02);
  56 |   await sequenceReady(page);await expect(page.locator('canvas[data-vyren-sequence]')).toHaveCount(1);expect((await page.evaluate(()=>window.__VYREN_SEQUENCE!.diagnostics())).displayedFactors!.ASSEMBLY_CRYSTAL).toBe(0);
  57 |   for(let i=0;i<3;i++){await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);expect((await page.evaluate(()=>window.__VYREN_MOTION!())).triggers).toBe(0);await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);}
  58 |   expect(await page.evaluate(()=>window.__VYREN_MOTION!())).toEqual(initial);
  59 | });
  60 | 
  61 | test('authentic Hero orbit follows the poster once and skips mobile, reduced motion and deep links',async({page})=>{
  62 |   await page.goto('/');await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('hero-orbit.webp')));
  63 |   await page.waitForTimeout(1900);await expect(page.locator('.hero-orbit')).toHaveCount(0);
  64 |   const resources=await page.evaluate(()=>(performance.getEntriesByType('resource') as PerformanceResourceTiming[]).filter(e=>e.name.includes('hero-')).map(e=>({name:e.name,start:e.startTime,end:e.responseEnd})));
  65 |   const orbit=resources.find(e=>e.name.includes('hero-orbit'))!;const poster=resources.find(e=>/hero-(800|1600)/.test(e.name))!;expect(orbit.start).toBeGreaterThan(poster.end);
  66 |   await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForTimeout(1900);expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('hero-orbit')))).toBe(false);
  67 |   await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForTimeout(1900);expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('hero-orbit')))).toBe(false);
  68 |   await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/#experience');await ready(page);expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('hero-orbit')))).toBe(false);
  69 | });
  70 | 
```