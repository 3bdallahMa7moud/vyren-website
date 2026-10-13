# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: regression-tests\sequence.spec.ts >> Save-Data uses a smaller frame set and reduced motion has explicit static controls
- Location: qa\section-seven-fixes\regression-tests\sequence.spec.ts:127:1

# Error details

```
TimeoutError: page.waitForFunction: Timeout 90000ms exceeded.
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
          - img "Actual exposed balance, hairspring, jewelled bearings and bridges in the VYREN VN-01 illustrative assembly" [ref=e90]
          - generic [ref=e92]:
            - generic [ref=e93]:
              - generic [ref=e94]: "04"
              - generic [ref=e95]: The heart of time
            - heading [level=2] [ref=e96]:
              - text: The artof
              - emphasis [ref=e97]: motion.
            - paragraph [ref=e98]: Behind the quiet surface,a world of considered detail.
            - paragraph [ref=e100]: An open-heart aperture offers a glimpse into the VN-01 — an illustrative mechanical landscape of bridges, balance and spring.
          - generic [ref=e101]: BALANCE & HAIRSPRINGVisual mechanism study
          - generic [ref=e106]:
            - text: SUPPORTING BRIDGE
            - generic [ref=e107]: Considered down to the smallest form.
          - generic [ref=e108]:
            - generic [ref=e109]: MECHANICAL EXPRESSION / VN-01
            - generic [ref=e110]: Concept geometry. Unhurried detail.
      - region "Every detail. In its place." [ref=e111]:
        - generic [ref=e112]:
          - generic:
            - generic:
              - generic: "05"
              - generic: Beyond the surface
            - heading "Every detail. In its place." [level=2]:
              - text: Every detail.
              - emphasis: In its place.
            - paragraph: A singular vision.Revealed, layer by layer.
          - img "The component layers of the NOCTIS 01" [ref=e113]:
            - img "NOCTIS 01, assembled" [ref=e115]
          - generic [aria-hidden]:
            - generic: 01 Sapphire-style crystal
            - generic: 02 Anthracite dial
            - generic: 03 VN-01 visual assembly
            - generic: 04 Sculpted case
          - generic [ref=e116]:
            - generic [ref=e117]: In balance / 04
            - button "Separate layers" [ref=e120] [cursor=pointer]
      - region [ref=e123]:
        - generic [ref=e124]:
          - generic [ref=e125]:
            - generic [ref=e126]:
              - generic [ref=e127]: "06"
              - generic [ref=e128]: Materials of time
            - heading [level=2] [ref=e129]:
              - text: Built to be
              - emphasis [ref=e130]: felt.
            - generic [ref=e131]: 01 — 04
          - generic [ref=e133]:
            - article [ref=e134]:
              - generic [ref=e135]:
                - img "Actual VYREN titanium design detail, rendered in Blender Cycles" [ref=e137]
                - generic [ref=e138]: 01 / MATERIAL STUDY
              - generic [ref=e139]:
                - text: A study in light.
                - heading "Titanium —" [level=3] [ref=e140]:
                  - generic [ref=e141]: Titanium
                  - generic [ref=e142]: —
                - paragraph [ref=e143]: Satin surfaces meet polished edges. An architectural expression of strength and restraint.
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
            - article [ref=e156]:
              - generic [ref=e157]:
                - img "Actual VYREN anthracite design detail, rendered in Blender Cycles" [ref=e159]
                - generic [ref=e160]: 03 / MATERIAL STUDY
              - generic [ref=e161]:
                - text: Darkness, defined.
                - heading "Anthracite —" [level=3] [ref=e162]:
                  - generic [ref=e163]: Anthracite
                  - generic [ref=e164]: —
                - paragraph [ref=e165]: A considered dial. Applied markers, sculptural hands and an open window into motion.
            - article [ref=e167]:
              - generic [ref=e168]:
                - img "Actual VYREN rubber design detail, rendered in Blender Cycles" [ref=e170]
                - generic [ref=e171]: 04 / MATERIAL STUDY
              - generic [ref=e172]:
                - text: The softer side of precision.
                - heading "Rubber —" [level=3] [ref=e173]:
                  - generic [ref=e174]: Rubber
                  - generic [ref=e175]: —
                - paragraph [ref=e176]: An integrated black strap follows the case. Quiet texture. A continuous silhouette.
      - region [ref=e178]:
        - generic [ref=e179]:
          - generic [ref=e180]:
            - generic [ref=e181]: "07"
            - generic [ref=e182]: Explore every angle
          - heading [level=2] [ref=e183]:
            - text: Make time
            - emphasis [ref=e184]: yours.
          - paragraph [ref=e185]: A closer look changes everything.
        - generic [ref=e186]:
          - generic: NOCTIS 0141 MM / CONCEPT STUDY
          - generic "Interactive 3D view of VYREN NOCTIS 01" [ref=e187]:
            - img "NOCTIS 01 in the same studio pose as the interactive view" [ref=e189]
          - generic [ref=e190]:
            - generic [ref=e191]: A watch with nothing to hide.
            - button "Interact with the watch" [disabled] [ref=e192]:
              - text: Interact with the watch
              - generic [aria-hidden] [ref=e193]: ↔
        - group "3D viewer controls" [ref=e195]:
          - generic [ref=e196]:
            - button "front view" [disabled] [pressed] [ref=e197]
            - button "rear view" [disabled] [ref=e198]
            - button "Dial detail" [disabled] [ref=e199]
            - button "Reset" [disabled] [ref=e200]
          - generic [ref=e203]:
            - button "Zoom out" [disabled] [ref=e204]: −
            - button "Zoom in" [disabled] [ref=e205]: +
            - button "Low power" [disabled] [ref=e206]
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
            - generic [ref=e220]: 41 MM
            - generic [ref=e224]: CIRCULAR CASE DIAMETER
          - generic [ref=e225]:
            - generic [ref=e226]:
              - generic [ref=e227]:
                - term [ref=e228]: Model
                - definition [ref=e229]: NOCTIS 01
              - generic [ref=e230]:
                - term [ref=e231]: Case diameter
                - definition [ref=e232]: 41 mm
              - generic [ref=e233]:
                - term [ref=e234]: Case expression
                - definition [ref=e235]: Titanium-inspired
              - generic [ref=e236]:
                - term [ref=e237]: Crystal
                - definition [ref=e238]: Sapphire-style
              - generic [ref=e239]:
                - term [ref=e240]: Dial
                - definition [ref=e241]: Anthracite / semi-skeleton
              - generic [ref=e242]:
                - term [ref=e243]: Strap
                - definition [ref=e244]: Integrated black rubber
              - generic [ref=e245]:
                - term [ref=e246]: Mechanism
                - definition [ref=e247]: VN-01 visual concept
            - paragraph [ref=e248]: NOCTIS 01 is a fictional design exploration. Material names describe visual intent. No manufactured performance, certification or purchase availability is claimed.
      - region [ref=e249]:
        - img "The VYREN NOCTIS 01 in its final cinematic composition" [ref=e253]
        - generic [ref=e254]:
          - generic [ref=e255]:
            - generic [ref=e256]: "09"
            - generic [ref=e257]: Own the moment
          - heading "Time belongs to you." [level=2] [ref=e258]:
            - generic [ref=e259]: Time belongs
            - generic [ref=e262]:
              - text: to
              - emphasis [ref=e263]: you.
          - paragraph [ref=e264]: VYREN NOCTIS 01 — An exploration of precision.
          - link "Explore in 3D" [ref=e265] [cursor=pointer]:
            - /url: "#experience"
        - generic [ref=e268]:
          - generic [ref=e269]: VYREN
          - generic [ref=e270]: TIME, REDEFINED.
          - link "Back to top" [ref=e271] [cursor=pointer]:
            - /url: "#watch"
    - contentinfo [ref=e274]:
      - generic [ref=e275]: © 2026 VYREN. A fictional watch concept.
      - generic [ref=e276]: DESIGNED AROUND THE DETAILS.
  - alert [ref=e277]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import fs from 'node:fs';
  3   | import path from 'node:path';
  4   | import sharp from 'sharp';
  5   | 
  6   | const output=path.resolve('qa/section-seven-fixes/sequence-regression');
  7   | fs.mkdirSync(output,{recursive:true});
  8   | const sequence=()=>window.__VYREN_SEQUENCE!.diagnostics();
  9   | async function ready(page:Page){
> 10  |   await page.waitForFunction(()=>{const d=window.__VYREN_SEQUENCE?.diagnostics();return d?.ready&&d.displayedFrame>=0&&d.displayedFrame===d.desiredFrame;},null,{timeout:90000});
      |              ^ TimeoutError: page.waitForFunction: Timeout 90000ms exceeded.
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
  73  |   expect(waiting.desiredFrame).toBeGreaterThan(135);
  74  |   expect(waiting.displayedFrame).toBeGreaterThanOrEqual(before.displayedFrame);
  75  |   expect(waiting.displayedFrame).toBeLessThan(before.displayedFrame+12);
  76  |   const heldPixels=await canvasEvidence(page);expect(heldPixels.alphaPixels).toBeGreaterThan(10000);
  77  |   const heldImage=await page.locator('[data-vyren-sequence]').screenshot();
  78  |   await page.waitForTimeout(250);
  79  |   const stillWaiting=await page.evaluate(sequence);expect(stillWaiting.displayedFrame).toBe(waiting.displayedFrame);
  80  |   const retainedImage=await page.locator('[data-vyren-sequence]').screenshot();
  81  |   const a=await sharp(heldImage).ensureAlpha().raw().toBuffer(),b=await sharp(retainedImage).ensureAlpha().raw().toBuffer();
  82  |   expect(a.length).toBe(b.length);let difference=0;for(let i=0;i<a.length;i++)difference+=Math.abs(a[i]-b[i]);
  83  |   // Canvas GPU/CPU readback may round antialiased pixels differently; compare the visible image.
  84  |   expect(difference/a.length).toBeLessThan(.5);
  85  |   const progress=await page.locator('.assembly-progress span').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
  86  |   expect(progress).toBeCloseTo(waiting.displayedProgress!,3);
  87  |   unblock();await ready(page);const after=await page.evaluate(sequence);
  88  |   expect(after.displayedFrame).toBeGreaterThan(135);expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(10000);
  89  |   save('slow-loading',{before,waiting,stillWaiting,after,pixels,heldPixels,meanHeldImageDifference:difference/a.length});
  90  | });
  91  | 
  92  | test('rapid scrubbing releases obsolete requests, seeks after refresh and releases offscreen bitmaps',async({page})=>{
  93  |   await page.goto('/#assembly');await seek(page,.57);
  94  |   for(const p of [.15,.92,.31,.74,.22,.98,.42,.85,.33]){
  95  |     await page.evaluate(p=>{const e=document.getElementById('assembly')!;scrollTo({top:e.offsetTop+(e.offsetHeight-innerHeight)*p,behavior:'instant'});},p);
  96  |     await page.waitForTimeout(55);
  97  |   }
  98  |   await seek(page,.33);const before=await page.evaluate(sequence);
  99  |   await page.reload();await page.waitForTimeout(1500);await ready(page);const reloaded=await page.evaluate(sequence);
  100 |   expect(reloaded.displayedFrame).toBe(before.displayedFrame);expect(reloaded.peakCacheFrames).toBeLessThanOrEqual(12);
  101 |   await page.locator('.desktop-nav').getByRole('link',{name:'Watch',exact:true}).click();await page.waitForTimeout(1900);
  102 |   const offscreen=await page.evaluate(sequence);expect(offscreen.active).toBe(false);expect(offscreen.cacheFrames).toBe(0);expect(offscreen.pending).toBe(0);
  103 |   const draws=offscreen.draws;await page.waitForTimeout(700);expect((await page.evaluate(sequence)).draws).toBe(draws);
  104 |   await seek(page,.72);expect((await page.evaluate(sequence)).displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  105 |   save('rapid-reload-disposal',{before,reloaded,offscreen,returned:await page.evaluate(sequence)});
  106 | });
  107 | 
  108 | for(const width of [1440,1280,768,390,360]){
  109 |   test(`Cycles responsive variant, resize and unclipped canvas ${width}px`,async({page})=>{
  110 |     await page.setViewportSize({width,height:width<=768?844:1000});await page.goto('/#assembly');
```