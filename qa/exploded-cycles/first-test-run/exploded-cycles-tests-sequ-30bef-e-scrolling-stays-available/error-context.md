# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: exploded-cycles\tests\sequence.spec.ts >> slow frames retain the last image and synchronized footer while scrolling stays available
- Location: qa\exploded-cycles\tests\sequence.spec.ts:66:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 974373807
Received: 45491209
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#manifesto"
    - banner [ref=e4]:
      - link "VYREN home" [ref=e5] [cursor=pointer]:
        - /url: "#watch"
        - text: VYREN
      - navigation "Main navigation" [ref=e6]:
        - link "Watch" [ref=e7] [cursor=pointer]:
          - /url: "#watch"
        - link "Craftsmanship" [ref=e8] [cursor=pointer]:
          - /url: "#craftsmanship"
        - link "Experience" [ref=e9] [cursor=pointer]:
          - /url: "#experience"
        - link "Details" [ref=e10] [cursor=pointer]:
          - /url: "#details"
      - link "NOCTIS 01" [ref=e11] [cursor=pointer]:
        - /url: "#experience"
    - main [ref=e14]:
      - region [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: THE NOCTIS COLLECTION
          - generic [ref=e18]: A STUDY IN PRECISION — 01
        - 'img "The actual VYREN NOCTIS 01: satin titanium-inspired case, anthracite open-heart dial and integrated black rubber strap" [ref=e22]'
        - generic [ref=e23]:
          - generic [ref=e24]: VYREN / NOCTIS 01
          - heading "Time, redefined." [level=1] [ref=e26]:
            - generic [ref=e27]: Time,
            - emphasis [ref=e31]: redefined.
          - paragraph [ref=e32]: Precision is not measured.It is experienced.
          - generic [ref=e33]:
            - link "Discover the watch" [ref=e34] [cursor=pointer]:
              - /url: "#manifesto"
            - link "Explore in 3D" [ref=e37] [cursor=pointer]:
              - /url: "#experience"
        - generic [ref=e39]:
          - link [ref=e40] [cursor=pointer]:
            - /url: "#manifesto"
          - generic [ref=e43]:
            - generic [ref=e44]: NOCTIS 01
            - generic [ref=e45]: Darkness reveals character.
          - generic [ref=e46]: DESIGN EXPLORATION / 2026
      - region [ref=e47]:
        - generic [ref=e48]:
          - generic [ref=e49]: "02"
          - generic [ref=e50]: An obsession with precision
        - heading "Every second has a story." [level=2] [ref=e51]:
          - generic [ref=e52]: EVERY SECOND
          - generic [ref=e53]: HAS A STORY.
        - generic:
          - generic:
            - img "The sculptural silhouette of the NOCTIS 01"
        - generic [ref=e54]:
          - generic [ref=e55]: The extraordinaryis in the ordinary.
          - paragraph [ref=e56]: Designed around the smallest details.Built to change the way we see time.
          - generic [ref=e57]: V / N° 01
      - region [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]: "03"
            - generic [ref=e62]: Sculpted in titanium
          - generic [ref=e63]: THE ARCHITECTURE OF A WATCH
        - generic [ref=e64]:
          - heading [level=2] [ref=e65]:
            - text: Sculpted from
            - emphasis [ref=e66]: precision.
          - paragraph [ref=e67]: Not a line without a purpose.Not an edge without intention.
        - generic [ref=e68]:
          - img "Macro view of the actual brushed case, polished chamfer, lug and fluted crown" [ref=e71]
          - 'img "A second genuine Cycles camera view: crown flutes and engraved V" [ref=e74]'
          - generic [ref=e75]: 01 / SATIN SURFACE
          - generic [ref=e77]: 02 / CROWN & CHAMFER
          - generic [ref=e79]: ACTUAL NOCTIS GEOMETRYCYCLES MATERIAL STUDY / 03
        - generic [ref=e80]:
          - generic [ref=e81]: 01 — SURFACE & FORM
          - paragraph [ref=e82]: Titanium-inspired surfaces. Precisely framed reflections.An interplay of brushed planes and polished edges.
          - link "The material language" [ref=e83] [cursor=pointer]:
            - /url: "#materials"
      - region [ref=e86]:
        - generic [ref=e87]:
          - img "The actual open-heart dial before the closer movement study" [ref=e90]
          - img "Actual exposed balance, hairspring, jewelled bearings and bridges in the VYREN VN-01 illustrative assembly" [ref=e93]
          - generic [ref=e95]:
            - generic [ref=e96]:
              - generic [ref=e97]: "04"
              - generic [ref=e98]: The heart of time
            - heading [level=2] [ref=e99]:
              - text: The artof
              - emphasis [ref=e100]: motion.
            - paragraph [ref=e101]: Behind the quiet surface,a world of considered detail.
            - paragraph [ref=e103]: An open-heart aperture offers a glimpse into the VN-01 — an illustrative mechanical landscape of bridges, balance and spring.
          - generic [ref=e104]: BALANCE & HAIRSPRINGVisual mechanism study
          - generic [ref=e109]:
            - text: SUPPORTING BRIDGE
            - generic [ref=e110]: Considered down to the smallest form.
          - generic [ref=e111]:
            - generic [ref=e112]: MECHANICAL EXPRESSION / VN-01
            - generic [ref=e113]: Concept geometry. Unhurried detail.
      - region "Every detail. In its place." [ref=e114]:
        - generic [ref=e115]:
          - generic:
            - generic:
              - generic: "05"
              - generic: Beyond the surface
            - heading "Every detail. In its place." [level=2]:
              - text: Every detail.
              - emphasis: In its place.
            - paragraph: A singular vision.Revealed, layer by layer.
          - img "Scroll-controlled Cycles animation of the actual NOCTIS 01 assemblies" [ref=e116]:
            - img "The original assembled NOCTIS 01, rendered in Blender Cycles" [ref=e118]
          - generic [aria-hidden]:
            - generic: 01 Sapphire-style crystal
            - generic: 02 Anthracite dial
            - generic: 03 VN-01 visual assembly
            - generic: 04 Sculpted case
          - generic [ref=e119]:
            - generic [ref=e120]: Revealing / 03
            - generic [ref=e123]: Scroll to reveal. Scroll back to restore.
      - region [ref=e124]:
        - generic [ref=e125]:
          - generic [ref=e126]:
            - generic [ref=e127]:
              - generic [ref=e128]: "06"
              - generic [ref=e129]: Materials of time
            - heading [level=2] [ref=e130]:
              - text: Built to be
              - emphasis [ref=e131]: felt.
            - generic [ref=e132]: 01 — 04
          - generic [ref=e134]:
            - article [ref=e135]:
              - generic [ref=e136]:
                - img "Actual VYREN titanium design detail, rendered in Blender Cycles" [ref=e138]
                - generic [ref=e139]: 01 / MATERIAL STUDY
              - generic [ref=e140]:
                - text: A study in light.
                - heading "Titanium —" [level=3] [ref=e141]:
                  - generic [ref=e142]: Titanium
                  - generic [ref=e143]: —
                - paragraph [ref=e144]: Satin surfaces meet polished edges. An architectural expression of strength and restraint.
            - article [ref=e145]:
              - generic [ref=e146]:
                - img "Actual VYREN sapphire design detail, rendered in Blender Cycles" [ref=e148]
                - generic [ref=e149]: 02 / MATERIAL STUDY
              - generic [ref=e150]:
                - text: Clarity with depth.
                - heading "Sapphire —" [level=3] [ref=e151]:
                  - generic [ref=e152]: Sapphire
                  - generic [ref=e153]: —
                - paragraph [ref=e154]: A sapphire-style lens catches the light while revealing the intricate landscape beneath.
            - article [ref=e155]:
              - generic [ref=e156]:
                - img "Actual VYREN anthracite design detail, rendered in Blender Cycles" [ref=e158]
                - generic [ref=e159]: 03 / MATERIAL STUDY
              - generic [ref=e160]:
                - text: Darkness, defined.
                - heading "Anthracite —" [level=3] [ref=e161]:
                  - generic [ref=e162]: Anthracite
                  - generic [ref=e163]: —
                - paragraph [ref=e164]: A considered dial. Applied markers, sculptural hands and an open window into motion.
            - article [ref=e165]:
              - generic [ref=e166]:
                - img "Actual VYREN rubber design detail, rendered in Blender Cycles" [ref=e168]
                - generic [ref=e169]: 04 / MATERIAL STUDY
              - generic [ref=e170]:
                - text: The softer side of precision.
                - heading "Rubber —" [level=3] [ref=e171]:
                  - generic [ref=e172]: Rubber
                  - generic [ref=e173]: —
                - paragraph [ref=e174]: An integrated black strap follows the case. Quiet texture. A continuous silhouette.
          - generic [ref=e175]:
            - generic [ref=e176]: Four textures. One expression.
            - generic [ref=e178]: Continue scrolling
      - region [ref=e181]:
        - generic [ref=e182]:
          - generic [ref=e183]:
            - generic [ref=e184]: "07"
            - generic [ref=e185]: Explore every angle
          - heading [level=2] [ref=e186]:
            - text: Make time
            - emphasis [ref=e187]: yours.
          - paragraph [ref=e188]: A closer look changes everything.
        - generic [ref=e189]:
          - generic: NOCTIS 0141 MM / CONCEPT STUDY
          - generic "Interactive 3D view of VYREN NOCTIS 01" [ref=e190]:
            - img "Front view of the NOCTIS 01 concept; static alternative to the interactive 3D viewer" [ref=e192]
          - generic: A watch with nothing to hide.
          - button "Interact with the watch" [ref=e193] [cursor=pointer]:
            - text: Interact with the watch
            - generic [aria-hidden] [ref=e194]: ↔
        - generic "3D viewer controls" [ref=e195]:
          - generic [ref=e196]:
            - button "front view" [pressed] [ref=e197] [cursor=pointer]
            - button "rear view" [ref=e198] [cursor=pointer]
            - button "Dial detail" [ref=e199] [cursor=pointer]
            - button "Reset" [ref=e200] [cursor=pointer]
          - generic [ref=e203]:
            - button "Zoom out" [ref=e204] [cursor=pointer]: −
            - button "Zoom in" [ref=e205] [cursor=pointer]: +
            - button "Low power" [ref=e206] [cursor=pointer]
        - paragraph [ref=e207]: A genuine 3D model. Materials and mechanism are a visual concept, not manufactured specifications.
      - region [ref=e208]:
        - generic [ref=e209]:
          - generic [ref=e210]:
            - generic [ref=e211]: "08"
            - generic [ref=e212]: The details define everything
          - generic [ref=e213]: NOCTIS 01 / DESIGN DOSSIER
        - heading [level=2] [ref=e214]:
          - text: Precision in
          - emphasis [ref=e215]: every form.
        - generic [ref=e216]:
          - generic [ref=e217]:
            - img "Front elevation of the NOCTIS 01 concept, with its verified 41 millimetre circular case" [ref=e219]
            - generic: 41 MM
            - generic [ref=e220]: CIRCULAR CASE DIAMETER
          - generic [ref=e221]:
            - generic [ref=e222]:
              - generic [ref=e223]:
                - term [ref=e224]: Model
                - definition [ref=e225]: NOCTIS 01
              - generic [ref=e226]:
                - term [ref=e227]: Case diameter
                - definition [ref=e228]: 41 mm
              - generic [ref=e229]:
                - term [ref=e230]: Case expression
                - definition [ref=e231]: Titanium-inspired
              - generic [ref=e232]:
                - term [ref=e233]: Crystal
                - definition [ref=e234]: Sapphire-style
              - generic [ref=e235]:
                - term [ref=e236]: Dial
                - definition [ref=e237]: Anthracite / semi-skeleton
              - generic [ref=e238]:
                - term [ref=e239]: Strap
                - definition [ref=e240]: Integrated black rubber
              - generic [ref=e241]:
                - term [ref=e242]: Mechanism
                - definition [ref=e243]: VN-01 visual concept
            - paragraph [ref=e244]: NOCTIS 01 is a fictional design exploration. Material names describe visual intent. No manufactured performance, certification or purchase availability is claimed.
      - region [ref=e245]:
        - img "The VYREN NOCTIS 01 in its final cinematic composition" [ref=e249]
        - generic [ref=e250]:
          - generic [ref=e251]:
            - generic [ref=e252]: "09"
            - generic [ref=e253]: Own the moment
          - heading "Time belongs to you." [level=2] [ref=e254]:
            - generic [ref=e255]: Time belongs
            - generic [ref=e258]:
              - text: to
              - emphasis [ref=e259]: you.
          - paragraph [ref=e260]: VYREN NOCTIS 01 — An exploration of precision.
          - link "Explore in 3D" [ref=e261] [cursor=pointer]:
            - /url: "#experience"
        - generic [ref=e264]:
          - generic [ref=e265]: VYREN
          - generic [ref=e266]: TIME, REDEFINED.
          - link "Back to top" [ref=e267] [cursor=pointer]:
            - /url: "#watch"
    - contentinfo [ref=e270]:
      - generic [ref=e271]: © 2026 VYREN. A fictional watch concept.
      - generic [ref=e272]: DESIGNED AROUND THE DETAILS.
  - alert [ref=e273]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import fs from 'node:fs';
  3   | import path from 'node:path';
  4   | import sharp from 'sharp';
  5   | 
  6   | const output=path.resolve('qa/exploded-cycles/sequence-tests');
  7   | fs.mkdirSync(output,{recursive:true});
  8   | const sequence=()=>window.__VYREN_SEQUENCE!.diagnostics();
  9   | async function ready(page:Page){
  10  |   await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.ready&&d.displayedFrame>=0&&d.displayedFrame===d.desiredFrame;},null,{timeout:90000});
  11  | }
  12  | async function seek(page:Page,p:number){
  13  |   await page.evaluate(p=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*p,behavior:'instant'});},p);
  14  |   await page.waitForTimeout(1200);await ready(page);
  15  | }
  16  | async function canvasEvidence(page:Page){
  17  |   return page.locator('[data-vyren-sequence]').evaluate((c:HTMLCanvasElement)=>{
  18  |     const data=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
  19  |     let alphaPixels=0,hash=2166136261;
  20  |     for(let i=0;i<data.length;i+=4){if(data[i+3]>0)alphaPixels++;hash=Math.imul(hash^data[i]^data[i+1]^data[i+2]^data[i+3],16777619);}
  21  |     return {alphaPixels,hash:hash>>>0,width:c.width,height:c.height};
  22  |   });
  23  | }
  24  | function save(name:string,data:unknown){fs.writeFileSync(path.join(output,`${name}.json`),JSON.stringify(data,null,2));}
  25  | 
  26  | test('progressive loading and first-frame poster continuity',async({page})=>{
  27  |   await page.goto('/');await page.waitForTimeout(2300);
  28  |   const initial=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.includes('/exploded-cycles/')).map(e=>e.name));
  29  |   expect(initial.filter(name=>name.endsWith('manifest.json')||/\/(desktop|mobile)\//.test(name))).toEqual([]);
  30  |   let unblock!:()=>void;const gate=new Promise<void>(r=>{unblock=r;});
  31  |   await page.route('**/exploded-cycles/desktop/*.webp',async route=>{await gate;await route.continue().catch(()=>{});});
  32  |   await page.goto('/#assembly');await page.waitForTimeout(1600);
  33  |   await expect(page.locator('.sequence-poster')).toHaveCSS('opacity','1');
  34  |   const poster=await page.locator('.sequence-slot').screenshot();
  35  |   unblock();await ready(page);await page.waitForTimeout(100);
  36  |   const frame=await page.locator('.sequence-slot').screenshot();
  37  |   const a=await sharp(poster).ensureAlpha().raw().toBuffer();const b=await sharp(frame).ensureAlpha().raw().toBuffer();
  38  |   expect(a.length).toBe(b.length);let difference=0;for(let i=0;i<a.length;i++)difference+=Math.abs(a[i]-b[i]);
  39  |   const mean=difference/a.length;expect(mean).toBeLessThan(.5);
  40  |   fs.writeFileSync(path.join(output,'poster.png'),poster);fs.writeFileSync(path.join(output,'first-canvas.png'),frame);
  41  |   expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);
  42  |   expect(await page.locator('video').count()).toBe(0);
  43  |   save('poster-continuity',{initialSequenceResources:initial,meanScreenshotChannelDifference:mean,diagnostics:await page.evaluate(sequence)});
  44  | });
  45  | 
  46  | test('deterministic forward, reverse, arbitrary seek and synchronized labels',async({page})=>{
  47  |   await page.goto('/#assembly');const states=[];
  48  |   for(const p of [0,.32,.57,.72,.9,1,.57,.32,0]){
  49  |     await seek(page,p);const d=await page.evaluate(sequence);
  50  |     expect(Math.abs(d.displayedFrame-Math.round(p*160))).toBeLessThanOrEqual(1);
  51  |     expect(d.peakCacheFrames).toBeLessThanOrEqual(d.cacheLimit);
  52  |     const footer=await page.locator('.assembly-progress span').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
  53  |     expect(footer).toBeCloseTo(d.displayedProgress!,3);
  54  |     if(p===0||p===1)expect(d.restMatrixDelta).toBe(0);
  55  |     if(p===.72){
  56  |       expect(Object.values(d.displayedFactors!).every(f=>f===1)).toBe(true);
  57  |       for(const label of await page.locator('.assembly-labels>span').all())await expect(label).toHaveCSS('opacity','1');
  58  |     }
  59  |     if(p===0)for(const label of await page.locator('.assembly-labels>span').all())await expect(label).toHaveCSS('opacity','0');
  60  |     expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);states.push({p,...d});
  61  |   }
  62  |   expect((await page.evaluate(()=>window.__VYREN_MOTION!())).assemblyTriggers).toBe(1);
  63  |   save('seeking',states);
  64  | });
  65  | 
  66  | test('slow frames retain the last image and synchronized footer while scrolling stays available',async({page})=>{
  67  |   await page.goto('/#assembly');await seek(page,.4);
  68  |   const before=await page.evaluate(sequence),pixels=await canvasEvidence(page);
  69  |   let unblock!:()=>void;const gate=new Promise<void>(r=>{unblock=r;});
  70  |   await page.route('**/exploded-cycles/desktop/*.webp',async route=>{await gate;await route.continue().catch(()=>{});});
  71  |   await page.evaluate(()=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*.9,behavior:'instant'});});
  72  |   await page.waitForTimeout(900);const waiting=await page.evaluate(sequence);
  73  |   expect(waiting.desiredFrame).toBeGreaterThan(135);expect(waiting.displayedFrame).toBe(before.displayedFrame);
> 74  |   expect((await canvasEvidence(page)).hash).toBe(pixels.hash);
      |                                             ^ Error: expect(received).toBe(expected) // Object.is equality
  75  |   const progress=await page.locator('.assembly-progress span').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
  76  |   expect(progress).toBeCloseTo(before.displayedProgress!,3);
  77  |   unblock();await ready(page);const after=await page.evaluate(sequence);
  78  |   expect(after.displayedFrame).toBeGreaterThan(135);expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);
  79  |   save('slow-loading',{before,waiting,after});
  80  | });
  81  | 
  82  | test('rapid scrubbing releases obsolete requests, seeks after refresh and releases offscreen bitmaps',async({page})=>{
  83  |   await page.goto('/#assembly');await seek(page,.57);
  84  |   for(const p of [.15,.92,.31,.74,.22,.98,.42,.85,.33]){
  85  |     await page.evaluate(p=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*p,behavior:'instant'});},p);
  86  |     await page.waitForTimeout(55);
  87  |   }
  88  |   await seek(page,.33);const before=await page.evaluate(sequence);
  89  |   await page.reload();await page.waitForTimeout(1500);await ready(page);const reloaded=await page.evaluate(sequence);
  90  |   expect(reloaded.displayedFrame).toBe(before.displayedFrame);expect(reloaded.peakCacheFrames).toBeLessThanOrEqual(12);
  91  |   await page.locator('.desktop-nav').getByRole('link',{name:'Watch',exact:true}).click();await page.waitForTimeout(1900);
  92  |   const offscreen=await page.evaluate(sequence);expect(offscreen.active).toBe(false);expect(offscreen.cacheFrames).toBe(0);expect(offscreen.pending).toBe(0);
  93  |   const draws=offscreen.draws;await page.waitForTimeout(700);expect((await page.evaluate(sequence)).draws).toBe(draws);
  94  |   await seek(page,.72);expect((await page.evaluate(sequence)).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  95  |   save('rapid-reload-disposal',{before,reloaded,offscreen,returned:await page.evaluate(sequence)});
  96  | });
  97  | 
  98  | for(const width of [1440,1280,768,390,360]){
  99  |   test(`Cycles responsive variant, resize and unclipped canvas ${width}px`,async({page})=>{
  100 |     await page.setViewportSize({width,height:width<=768?844:1000});await page.goto('/#assembly');
  101 |     const states=[];
  102 |     for(const p of [0,.32,.72,1]){
  103 |       await seek(page,p);const d=await page.evaluate(sequence);
  104 |       expect(d.variant).toBe(width<=768?'mobile':'desktop');
  105 |       expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  106 |       const evidence=await canvasEvidence(page);expect(evidence.alphaPixels).toBeGreaterThan(5000);states.push({p,...d,evidence});
  107 |       await page.screenshot({path:path.join(output,`viewport-${width}-${Math.round(p*100)}.png`)});
  108 |     }
  109 |     const other=width<=768?1280:390;
  110 |     await page.setViewportSize({width:other,height:other<=768?844:1000});await seek(page,.57);
  111 |     expect((await page.evaluate(sequence)).variant).toBe(other<=768?'mobile':'desktop');
  112 |     expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(5000);
  113 |     save(`responsive-${width}`,{scope:'Desktop Edge viewport emulation; not a physical tablet or phone',states,resized:await page.evaluate(sequence)});
  114 |   });
  115 | }
  116 | 
  117 | test('Save-Data uses a smaller frame set and reduced motion has explicit static controls',async({page})=>{
  118 |   const requested:string[]=[];page.on('request',r=>{const p=new URL(r.url()).pathname;if(p.includes('/exploded-cycles/desktop/'))requested.push(p);});
  119 |   const manifest=JSON.parse(fs.readFileSync(path.resolve('public/assets/exploded-cycles/manifest.json'),'utf8'));
  120 |   const allowed=new Set(manifest.variants.desktop.urls.filter((_:string,i:number)=>i%2===0));
  121 |   await page.addInitScript(()=>{Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true});});
  122 |   await page.goto('/#assembly');await seek(page,.332);
  123 |   expect((await page.evaluate(sequence)).displayedFrame%2).toBe(0);
  124 |   await page.emulateMedia({reducedMotion:'reduce'});await seek(page,0);
  125 |   expect((await page.evaluate(sequence)).displayedFrame).toBe(0);
  126 |   await page.getByRole('button',{name:'Separate layers'}).click();await page.waitForTimeout(500);await ready(page);
  127 |   const exploded=await page.evaluate(sequence);expect(exploded.displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  128 |   const draws=exploded.draws;await page.waitForTimeout(800);expect((await page.evaluate(sequence)).draws).toBe(draws);
  129 |   await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(400);
  130 |   await page.emulateMedia({reducedMotion:'reduce'});await seek(page,0);
  131 |   await expect(page.getByRole('button',{name:'Separate layers'})).toBeVisible();
  132 |   expect((await page.evaluate(sequence)).displayedFrame).toBe(0);
  133 |   await page.getByRole('button',{name:'Separate layers'}).click();await page.waitForTimeout(500);await ready(page);
  134 |   await page.getByRole('button',{name:'Reassemble',exact:true}).click();await page.waitForTimeout(500);await ready(page);
  135 |   expect((await page.evaluate(sequence)).restMatrixDelta).toBe(0);
  136 |   expect(requested.every(p=>allowed.has(p))).toBe(true);
  137 |   save('save-data-reduced',{exploded,restored:await page.evaluate(sequence),requested});
  138 | });
  139 | 
  140 | test('the 2D sequence survives unavailable WebGL and the independent viewer uses its fallback',async({page})=>{
  141 |   await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type==='webgl'||type==='webgl2')return null;return Reflect.apply(original,this,[type,...args]);} as typeof original;});
  142 |   await page.goto('/#assembly');await seek(page,.72);
  143 |   expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);
  144 |   await page.locator('.desktop-nav').getByRole('link',{name:'Experience',exact:true}).click();
  145 |   await page.waitForFunction(()=>document.documentElement.dataset.studio==='error');
  146 |   await expect(page.locator('.viewer-slot img')).toBeVisible();
  147 |   await expect(page.locator('main>section')).toHaveCount(9);
  148 | });
  149 | 
```