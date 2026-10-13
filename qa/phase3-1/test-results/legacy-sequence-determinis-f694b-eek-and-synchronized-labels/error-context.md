# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: legacy-sequence.spec.ts >> deterministic forward, reverse, arbitrary seek and synchronized labels
- Location: qa\phase3-1\tests\legacy-sequence.spec.ts:46:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 1
Received:    2
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
            - link "Enter the Studio" [ref=e37] [cursor=pointer]:
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
          - generic [ref=e79]:
            - generic:
              - img "Titanium under nine genuine studio light positions"
            - generic [ref=e80]:
              - generic [ref=e81]:
                - text: TRACE THE LIGHT
                - slider "Titanium light position" [ref=e82]: "4"
              - generic [ref=e83]: POLISHED CHAMFER / LIGHT BOUNDARY
        - generic [ref=e84]:
          - generic [ref=e85]: 01 — SURFACE & FORM
          - paragraph [ref=e86]: Titanium-inspired surfaces. Precisely framed reflections.An interplay of brushed planes and polished edges.
          - link "The material language" [ref=e87] [cursor=pointer]:
            - /url: "#materials"
      - region [ref=e90]:
        - generic [ref=e91]:
          - img "The actual open-heart dial before the closer movement study" [ref=e94]
          - img "Actual exposed balance, hairspring, jewelled bearings and bridges in the VYREN VN-01 illustrative assembly" [ref=e97]
          - generic [ref=e99]:
            - generic [ref=e100]:
              - generic [ref=e101]: "04"
              - generic [ref=e102]: The heart of time
            - heading [level=2] [ref=e103]:
              - text: The artof
              - emphasis [ref=e104]: motion.
            - paragraph [ref=e105]: Behind the quiet surface,a world of considered detail.
            - paragraph [ref=e107]: An open-heart aperture offers a glimpse into the VN-01 — an illustrative mechanical landscape of bridges, balance and spring.
          - generic [ref=e108]: BALANCE & HAIRSPRINGVisual mechanism study
          - generic [ref=e113]:
            - text: SUPPORTING BRIDGE
            - generic [ref=e114]: Considered down to the smallest form.
          - group "Movement microscope" [ref=e115]:
            - generic [ref=e116]: INSPECT THE MOVEMENT
            - button "Balance +" [ref=e117] [cursor=pointer]
            - button "Hairspring +" [ref=e118] [cursor=pointer]
            - button "Bridge +" [ref=e119] [cursor=pointer]
          - generic [ref=e120]:
            - generic [ref=e121]: MECHANICAL EXPRESSION / VN-01
            - generic [ref=e122]: Concept geometry. Unhurried detail.
      - region "Every detail. In its place." [ref=e123]:
        - generic [ref=e124]:
          - generic:
            - generic:
              - generic: "05"
              - generic: Beyond the surface
            - heading "Every detail. In its place." [level=2]:
              - text: Every detail.
              - emphasis: In its place.
            - paragraph: A singular vision.Revealed, layer by layer.
          - img "The component layers of the NOCTIS 01" [ref=e125]:
            - img "NOCTIS 01, assembled" [ref=e127]
          - status [ref=e128]:
            - generic [ref=e129]: ASSEMBLED / NOCTIS 01
            - paragraph [ref=e130]: Ten component groups. One complete silhouette.
          - generic [aria-hidden]:
            - generic: 01 Sapphire-style crystal
            - generic: 02 Anthracite dial
            - generic: 03 VN-01 visual assembly
            - generic: 04 Sculpted case
          - generic [ref=e131]:
            - generic [ref=e132]: Assembled / 01
            - generic [ref=e135]: Scroll to reveal. Scroll back to restore.
      - region [ref=e136]:
        - generic [ref=e137]:
          - generic [ref=e138]:
            - generic [ref=e139]:
              - generic [ref=e140]: "06"
              - generic [ref=e141]: Materials of time
            - heading [level=2] [ref=e142]:
              - text: Built to be
              - emphasis [ref=e143]: felt.
            - generic [ref=e144]: 01 — 04
          - generic [ref=e146]:
            - article [ref=e147]:
              - generic [ref=e148]:
                - img "Actual VYREN titanium design detail, rendered in Blender Cycles" [ref=e150]
                - generic [ref=e151]:
                  - generic:
                    - img "Titanium under nine genuine studio light positions"
                  - generic [ref=e152]:
                    - generic [ref=e153]:
                      - text: TRACE THE LIGHT
                      - slider "Material titanium light position" [ref=e154]: "4"
                    - generic [ref=e155]: POLISHED CHAMFER / LIGHT BOUNDARY
                - generic [ref=e156]: 01 / MATERIAL STUDY
              - generic [ref=e157]:
                - text: A study in light.
                - heading "Titanium —" [level=3] [ref=e158]:
                  - generic [ref=e159]: Titanium
                  - generic [ref=e160]: —
                - paragraph [ref=e161]: Satin surfaces meet polished edges. An architectural expression of strength and restraint.
            - article [ref=e162]:
              - generic [ref=e163]:
                - img "Actual VYREN sapphire design detail, rendered in Blender Cycles" [ref=e165]
                - generic [ref=e166]:
                  - img "Sapphire reflections and the dial underneath, from the original Cycles macro" [ref=e169]
                  - generic [ref=e170]:
                    - text: THROUGH THE CRYSTAL
                    - slider "Sapphire optical study reveal" [ref=e171]: "0"
                - generic [ref=e172]: 02 / MATERIAL STUDY
              - generic [ref=e173]:
                - text: Clarity with depth.
                - heading "Sapphire —" [level=3] [ref=e174]:
                  - generic [ref=e175]: Sapphire
                  - generic [ref=e176]: —
                - paragraph [ref=e177]: A sapphire-style lens catches the light while revealing the intricate landscape beneath.
            - article [ref=e178]:
              - generic [ref=e179]:
                - img "Actual VYREN anthracite design detail, rendered in Blender Cycles" [ref=e181]
                - button "DISCOVER THE DIAL +" [ref=e183] [cursor=pointer]
                - generic [ref=e184]: 03 / MATERIAL STUDY
              - generic [ref=e185]:
                - text: Darkness, defined.
                - heading "Anthracite —" [level=3] [ref=e186]:
                  - generic [ref=e187]: Anthracite
                  - generic [ref=e188]: —
                - paragraph [ref=e189]: A considered dial. Applied markers, sculptural hands and an open window into motion.
            - article [ref=e190]:
              - generic [ref=e191]:
                - img "Actual VYREN rubber design detail, rendered in Blender Cycles" [ref=e193]
                - button "TRACE THE MOLDED SURFACE +" [ref=e195] [cursor=pointer]
                - generic [ref=e196]: 04 / MATERIAL STUDY
              - generic [ref=e197]:
                - text: The softer side of precision.
                - heading "Rubber —" [level=3] [ref=e198]:
                  - generic [ref=e199]: Rubber
                  - generic [ref=e200]: —
                - paragraph [ref=e201]: An integrated black strap follows the case. Quiet texture. A continuous silhouette.
          - generic [ref=e202]:
            - generic [ref=e203]: Four textures. One expression.
            - generic [ref=e205]: Continue scrolling
      - region [ref=e208]:
        - generic [ref=e209]:
          - generic [ref=e210]:
            - generic [ref=e211]: "07"
            - generic [ref=e212]: THE INTERACTIVE STUDIO
          - heading [level=2] [ref=e213]:
            - text: Make time
            - emphasis [ref=e214]: yours.
          - paragraph [ref=e215]: A closer look changes everything.
        - generic [ref=e216]:
          - generic [ref=e217]:
            - group "Viewing mode" [ref=e218]:
              - button "Studio" [pressed] [ref=e219] [cursor=pointer]
              - button "Free 3D" [ref=e220] [cursor=pointer]
            - generic [ref=e221]: SOFT STUDIO / CYCLES
            - button "Fullscreen" [ref=e222] [cursor=pointer]:
              - text: Fullscreen
              - generic [aria-hidden] [ref=e223]: ↗
          - generic [ref=e224]:
            - generic: NOCTIS 0141 MM / CONCEPT STUDY
            - generic [ref=e225]:
              - slider "Watch rotation" [ref=e226]:
                - img "The original NOCTIS 01 in its Blender studio" [ref=e228]
                - generic:
                  - img "Authentic Cycles orbit of NOCTIS 01"
              - generic [aria-hidden]: 000° 360° ORBIT
            - generic [ref=e229]:
              - generic [ref=e230]: Drag horizontally to rotate · Arrow keys for precision
              - status [ref=e231]: Studio photograph · loading orbit
          - group "Studio angles" [ref=e232]:
            - button "Front" [ref=e233] [cursor=pointer]
            - button "3/4 View" [pressed] [ref=e234] [cursor=pointer]
            - button "Side" [ref=e235] [cursor=pointer]
            - button "Back" [ref=e236] [cursor=pointer]
            - button "Reset" [ref=e237] [cursor=pointer]
          - generic [ref=e238]:
            - generic [ref=e239]: WATCHMAKER’S LOUPE
            - generic [ref=e240]:
              - button "Crown" [ref=e241] [cursor=pointer]:
                - text: Crown
                - generic [aria-hidden] [ref=e242]: +
              - button "Dial" [ref=e243] [cursor=pointer]:
                - text: Dial
                - generic [aria-hidden] [ref=e244]: +
              - button "Open-heart movement" [ref=e245] [cursor=pointer]:
                - text: Open-heart movement
                - generic [aria-hidden] [ref=e246]: +
              - button "Case / strap" [ref=e247] [cursor=pointer]:
                - text: Case / strap
                - generic [aria-hidden] [ref=e248]: +
        - paragraph [ref=e249]: Original geometry. Studio photographs rendered in Blender. Free 3D offers unconstrained inspection of the same watch.
      - region [ref=e250]:
        - generic [ref=e251]:
          - generic [ref=e252]:
            - generic [ref=e253]: "08"
            - generic [ref=e254]: The details define everything
          - generic [ref=e255]: NOCTIS 01 / DESIGN DOSSIER
        - heading [level=2] [ref=e256]:
          - text: Precision in
          - emphasis [ref=e257]: every form.
        - generic [ref=e258]:
          - generic [ref=e259]:
            - img "Front elevation of the NOCTIS 01 concept, with its verified 41 millimetre circular case" [ref=e261]
            - generic [ref=e262]:
              - img "Front elevation line drawing projected from the original watch meshes" [ref=e263]
              - generic [ref=e264]: NOCTIS 01 / GEOMETRY STUDY
            - generic: 41 MM
            - generic [ref=e265]: CIRCULAR CASE DIAMETER
          - generic [ref=e266]:
            - generic [ref=e267]:
              - generic [ref=e268]:
                - term [ref=e269]: Model
                - definition [ref=e270]: NOCTIS 01
              - generic [ref=e271]:
                - term [ref=e272]: Case diameter
                - definition [ref=e273]: 41 mm
              - generic [ref=e274]:
                - term [ref=e275]: Case expression
                - definition [ref=e276]: Titanium-inspired
              - generic [ref=e277]:
                - term [ref=e278]: Crystal
                - definition [ref=e279]: Sapphire-style
              - generic [ref=e280]:
                - term [ref=e281]: Dial
                - definition [ref=e282]: Anthracite / semi-skeleton
              - generic [ref=e283]:
                - term [ref=e284]: Strap
                - definition [ref=e285]: Integrated black rubber
              - generic [ref=e286]:
                - term [ref=e287]: Mechanism
                - definition [ref=e288]: VN-01 visual concept
            - paragraph [ref=e289]: NOCTIS 01 is a fictional design exploration. Material names describe visual intent. No manufactured performance, certification or purchase availability is claimed.
      - region [ref=e290]:
        - generic [ref=e292]:
          - img "The VYREN NOCTIS 01 in its final cinematic composition" [ref=e294]
          - generic [ref=e295]:
            - generic:
              - img "Original Cycles camera pullback, from detail to complete watch"
        - generic [ref=e296]:
          - generic [ref=e297]:
            - generic [ref=e298]: "09"
            - generic [ref=e299]: Own the moment
          - heading "Time belongs to you." [level=2] [ref=e300]:
            - generic [ref=e301]: Time belongs
            - generic [ref=e304]:
              - text: to
              - emphasis [ref=e305]: you.
          - paragraph [ref=e306]: VYREN NOCTIS 01 — An exploration of precision.
          - link "Enter the Studio" [ref=e307] [cursor=pointer]:
            - /url: "#experience"
        - generic [ref=e310]:
          - generic [ref=e311]: VYREN
          - generic [ref=e312]: TIME, REDEFINED.
          - link "Back to top" [ref=e313] [cursor=pointer]:
            - /url: "#watch"
    - contentinfo [ref=e316]:
      - generic [ref=e317]: © 2026 VYREN. A fictional watch concept.
      - generic [ref=e318]: DESIGNED AROUND THE DETAILS.
  - alert [ref=e319]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import fs from 'node:fs';
  3   | import path from 'node:path';
  4   | import sharp from 'sharp';
  5   | 
  6   | const output=path.resolve('qa/phase3-1/legacy/legacy-exploded');
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
> 50  |     expect(Math.abs(d.displayedFrame-Math.round(p*160))).toBeLessThanOrEqual(1);
      |                                                          ^ Error: expect(received).toBeLessThanOrEqual(expected)
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
  111 |     const states=[];
  112 |     for(const p of [0,.32,.72,1]){
  113 |       await seek(page,p);const d=await page.evaluate(sequence);
  114 |       expect(d.variant).toBe(width<=768?'mobile':'desktop');
  115 |       expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  116 |       const evidence=await canvasEvidence(page);expect(evidence.alphaPixels).toBeGreaterThan(5000);states.push({p,...d,evidence});
  117 |       await page.screenshot({path:path.join(output,`viewport-${width}-${Math.round(p*100)}.png`)});
  118 |     }
  119 |     const other=width<=768?1280:390;
  120 |     await page.setViewportSize({width:other,height:other<=768?844:1000});await seek(page,.57);
  121 |     expect((await page.evaluate(sequence)).variant).toBe(other<=768?'mobile':'desktop');
  122 |     expect((await canvasEvidence(page)).alphaPixels).toBeGreaterThan(5000);
  123 |     save(`responsive-${width}`,{scope:'Desktop Edge viewport emulation; not a physical tablet or phone',states,resized:await page.evaluate(sequence)});
  124 |   });
  125 | }
  126 | 
  127 | test('Save-Data uses a smaller frame set and reduced motion has explicit static controls',async({page})=>{
  128 |   const requested:string[]=[];page.on('request',r=>{const p=new URL(r.url()).pathname;if(p.includes('/exploded-cycles/desktop/'))requested.push(p);});
  129 |   const manifest=JSON.parse(fs.readFileSync(path.resolve('public/assets/exploded-cycles/manifest.json'),'utf8'));
  130 |   const allowed=new Set(manifest.variants.desktop.urls.filter((_:string,i:number)=>i%2===0));
  131 |   await page.addInitScript(()=>{Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true});});
  132 |   await page.goto('/#assembly');await seek(page,.332);
  133 |   expect((await page.evaluate(sequence)).displayedFrame%2).toBe(0);
  134 |   await page.emulateMedia({reducedMotion:'reduce'});await seek(page,0);
  135 |   expect((await page.evaluate(sequence)).displayedFrame).toBe(0);
  136 |   await page.getByRole('button',{name:'Separate layers'}).click();await page.waitForTimeout(500);await ready(page);
  137 |   const exploded=await page.evaluate(sequence);expect(exploded.displayedFactors!.ASSEMBLY_MOVEMENT).toBe(1);
  138 |   const draws=exploded.draws;await page.waitForTimeout(800);expect((await page.evaluate(sequence)).draws).toBe(draws);
  139 |   await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(400);
  140 |   await page.emulateMedia({reducedMotion:'reduce'});await seek(page,0);
  141 |   await expect(page.getByRole('button',{name:'Separate layers'})).toBeVisible();
  142 |   expect((await page.evaluate(sequence)).displayedFrame).toBe(0);
  143 |   await page.getByRole('button',{name:'Separate layers'}).click();await page.waitForTimeout(500);await ready(page);
  144 |   await page.getByRole('button',{name:'Reassemble',exact:true}).click();await page.waitForTimeout(500);await ready(page);
  145 |   expect((await page.evaluate(sequence)).restMatrixDelta).toBe(0);
  146 |   expect(requested.every(p=>allowed.has(p))).toBe(true);
  147 |   save('save-data-reduced',{exploded,restored:await page.evaluate(sequence),requested});
  148 | });
  149 | 
  150 | test('the 2D sequence survives unavailable WebGL and the independent viewer uses its fallback',async({page})=>{
```