# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio.spec.ts >> default Cycles orbit, circular drag, presets, loupe, fullscreen and both modes
- Location: qa\phase3\tests\studio.spec.ts:7:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Interact with the watch', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - generic [ref=e134]: Scroll to reveal. Scroll back to restore.
      - region [ref=e135]:
        - generic [ref=e136]:
          - generic [ref=e137]:
            - generic [ref=e138]:
              - generic [ref=e139]: "06"
              - generic [ref=e140]: Materials of time
            - heading [level=2] [ref=e141]:
              - text: Built to be
              - emphasis [ref=e142]: felt.
            - generic [ref=e143]: 04 — 04
          - generic [ref=e145]:
            - article [ref=e146]:
              - generic [ref=e147]:
                - img "Actual VYREN titanium design detail, rendered in Blender Cycles" [ref=e149]
                - generic [ref=e150]:
                  - generic:
                    - img "Titanium under nine genuine studio light positions"
                  - generic [ref=e151]:
                    - generic [ref=e152]:
                      - text: TRACE THE LIGHT
                      - slider "Material titanium light position" [ref=e153]: "4"
                    - generic [ref=e154]: POLISHED CHAMFER / LIGHT BOUNDARY
                - generic [ref=e155]: 01 / MATERIAL STUDY
              - generic [ref=e156]:
                - text: A study in light.
                - heading "Titanium —" [level=3] [ref=e157]:
                  - generic [ref=e158]: Titanium
                  - generic [ref=e159]: —
                - paragraph [ref=e160]: Satin surfaces meet polished edges. An architectural expression of strength and restraint.
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
            - article [ref=e179]:
              - generic [ref=e180]:
                - img "Actual VYREN anthracite design detail, rendered in Blender Cycles" [ref=e182]
                - button "DISCOVER THE DIAL +" [ref=e184] [cursor=pointer]
                - generic [ref=e185]: 03 / MATERIAL STUDY
              - generic [ref=e186]:
                - text: Darkness, defined.
                - heading "Anthracite —" [level=3] [ref=e187]:
                  - generic [ref=e188]: Anthracite
                  - generic [ref=e189]: —
                - paragraph [ref=e190]: A considered dial. Applied markers, sculptural hands and an open window into motion.
            - article [ref=e192]:
              - generic [ref=e193]:
                - img "Actual VYREN rubber design detail, rendered in Blender Cycles" [ref=e195]
                - button "TRACE THE MOLDED SURFACE +" [ref=e197] [cursor=pointer]
                - generic [ref=e198]: 04 / MATERIAL STUDY
              - generic [ref=e199]:
                - text: The softer side of precision.
                - heading "Rubber —" [level=3] [ref=e200]:
                  - generic [ref=e201]: Rubber
                  - generic [ref=e202]: —
                - paragraph [ref=e203]: An integrated black strap follows the case. Quiet texture. A continuous silhouette.
          - generic [ref=e205]:
            - generic [ref=e206]: Four textures. One expression.
            - generic [ref=e209]: Continue scrolling
      - region [ref=e212]:
        - generic [ref=e213]:
          - generic [ref=e214]:
            - generic [ref=e215]: "07"
            - generic [ref=e216]: THE INTERACTIVE STUDIO
          - heading [level=2] [ref=e217]:
            - text: Make time
            - emphasis [ref=e218]: yours.
          - paragraph [ref=e219]: A closer look changes everything.
        - generic [ref=e220]:
          - generic [ref=e221]:
            - group "Viewing mode" [ref=e222]:
              - button "Studio" [ref=e223] [cursor=pointer]
              - button "Free 3D" [active] [pressed] [ref=e224] [cursor=pointer]
            - generic [ref=e225]: LIVE MODEL / FREE ORBIT
            - button "Fullscreen" [ref=e226] [cursor=pointer]:
              - text: Fullscreen
              - generic [aria-hidden] [ref=e227]: ↗
          - generic [ref=e228]:
            - generic: NOCTIS 0141 MM / CONCEPT STUDY
            - generic [ref=e229]:
              - generic "Interactive 3D view of VYREN NOCTIS 01" [ref=e230]:
                - img "Original watch studio preview while Free 3D loads" [ref=e232]
                - img "VYREN NOCTIS 01 interactive 3D canvas"
              - generic [aria-hidden]: 355° 360° ORBIT
            - generic [ref=e233]:
              - generic [ref=e234]: Explore freely in three dimensions.
              - button "Interact with the watch ↔" [ref=e235] [cursor=pointer]:
                - text: Interact with the watch
                - generic [ref=e236]: ↔
          - status [ref=e238]:
            - generic [ref=e239]: Ready to explore
          - group "3D viewer controls" [ref=e240]:
            - generic [ref=e241]:
              - button "front view" [pressed] [ref=e242] [cursor=pointer]
              - button "rear view" [ref=e243] [cursor=pointer]
              - button "Dial detail" [ref=e244] [cursor=pointer]
              - button "Reset" [ref=e245] [cursor=pointer]
            - generic [ref=e246]:
              - button "Zoom out" [ref=e247] [cursor=pointer]: −
              - button "Zoom in" [ref=e248] [cursor=pointer]: +
              - button "Low power" [ref=e249] [cursor=pointer]
          - generic [ref=e250]:
            - generic [ref=e251]: WATCHMAKER’S LOUPE
            - generic [ref=e252]:
              - button "Crown" [ref=e253] [cursor=pointer]:
                - text: Crown
                - generic [aria-hidden] [ref=e254]: +
              - button "Dial" [ref=e255] [cursor=pointer]:
                - text: Dial
                - generic [aria-hidden] [ref=e256]: +
              - button "Open-heart movement" [ref=e257] [cursor=pointer]:
                - text: Open-heart movement
                - generic [aria-hidden] [ref=e258]: +
              - button "Case / strap" [ref=e259] [cursor=pointer]:
                - text: Case / strap
                - generic [aria-hidden] [ref=e260]: +
        - paragraph [ref=e261]: Original geometry. Studio photographs rendered in Blender. Free 3D offers unconstrained inspection of the same watch.
      - region [ref=e262]:
        - generic [ref=e263]:
          - generic [ref=e264]:
            - generic [ref=e265]: "08"
            - generic [ref=e266]: The details define everything
          - generic [ref=e267]: NOCTIS 01 / DESIGN DOSSIER
        - heading [level=2] [ref=e268]:
          - text: Precision in
          - emphasis [ref=e269]: every form.
        - generic [ref=e270]:
          - generic [ref=e271]:
            - img "Front elevation of the NOCTIS 01 concept, with its verified 41 millimetre circular case" [ref=e273]
            - generic [ref=e274]:
              - img "Front elevation line drawing projected from the original watch meshes" [ref=e275]
              - generic [ref=e276]: NOCTIS 01 / GEOMETRY STUDY
            - generic: 41 MM
            - generic [ref=e277]: CIRCULAR CASE DIAMETER
          - generic [ref=e278]:
            - generic [ref=e279]:
              - generic [ref=e280]:
                - term [ref=e281]: Model
                - definition [ref=e282]: NOCTIS 01
              - generic [ref=e283]:
                - term [ref=e284]: Case diameter
                - definition [ref=e285]: 41 mm
              - generic [ref=e286]:
                - term [ref=e287]: Case expression
                - definition [ref=e288]: Titanium-inspired
              - generic [ref=e289]:
                - term [ref=e290]: Crystal
                - definition [ref=e291]: Sapphire-style
              - generic [ref=e292]:
                - term [ref=e293]: Dial
                - definition [ref=e294]: Anthracite / semi-skeleton
              - generic [ref=e295]:
                - term [ref=e296]: Strap
                - definition [ref=e297]: Integrated black rubber
              - generic [ref=e298]:
                - term [ref=e299]: Mechanism
                - definition [ref=e300]: VN-01 visual concept
            - paragraph [ref=e301]: NOCTIS 01 is a fictional design exploration. Material names describe visual intent. No manufactured performance, certification or purchase availability is claimed.
      - region [ref=e302]:
        - generic [ref=e304]:
          - img "The VYREN NOCTIS 01 in its final cinematic composition" [ref=e306]
          - generic [ref=e307]:
            - generic:
              - img "Original Cycles camera pullback, from detail to complete watch"
        - generic [ref=e308]:
          - generic [ref=e309]:
            - generic [ref=e310]: "09"
            - generic [ref=e311]: Own the moment
          - heading "Time belongs to you." [level=2] [ref=e312]:
            - generic [ref=e313]: Time belongs
            - generic [ref=e316]:
              - text: to
              - emphasis [ref=e317]: you.
          - paragraph [ref=e318]: VYREN NOCTIS 01 — An exploration of precision.
          - link "Enter the Studio" [ref=e319] [cursor=pointer]:
            - /url: "#experience"
        - generic [ref=e322]:
          - generic [ref=e323]: VYREN
          - generic [ref=e324]: TIME, REDEFINED.
          - link "Back to top" [ref=e325] [cursor=pointer]:
            - /url: "#watch"
    - contentinfo [ref=e328]:
      - generic [ref=e329]: © 2026 VYREN. A fictional watch concept.
      - generic [ref=e330]: DESIGNED AROUND THE DETAILS.
  - alert [ref=e331]
```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | import fs from 'node:fs';
  3  | const output='qa/phase3/after';fs.mkdirSync(output,{recursive:true});
  4  | async function scene(page: Page,id: string,progress=0) { await page.evaluate(({id,progress})=>{const e=document.getElementById(id)!;scrollTo({top:e.offsetTop+Math.max(0,e.offsetHeight-innerHeight)*progress-76,behavior:'instant'});},{id,progress});await page.waitForTimeout(1000); }
  5  | async function studio(page:Page) { await page.goto('/#experience');await page.waitForFunction(()=>window.__VYREN_STUDIO?.diagnostics().displayedFrame!>=0); }
  6  | async function settled(page:Page) { await page.waitForFunction(()=>{const d=window.__VYREN_STUDIO?.diagnostics();return d && d.desiredFrame===d.displayedFrame && d.fullResolution;}); }
  7  | test('default Cycles orbit, circular drag, presets, loupe, fullscreen and both modes',async({page})=>{
  8  |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await studio(page);
  9  |  await expect(page.getByRole('button',{name:'Studio',exact:true})).toHaveAttribute('aria-pressed','true');
  10 |  expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('.glb')))).toBe(false);
  11 |  const angles=[['Front',66],['3/4 View',0],['Side',12],['Back',24]] as const;
  12 |  for(const [name,frame] of angles){await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(750);await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).displayedFrame).toBe(frame);await page.screenshot({path:`${output}/studio-${name.replaceAll('/','').replaceAll(' ','-').toLowerCase()}.png`});}
  13 |  await page.getByRole('button',{name:'3/4 View',exact:true}).click();await page.waitForTimeout(750);await settled(page);
  14 |  await page.getByRole('button',{name:'Crown',exact:false}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.screenshot({path:`${output}/studio-macro.png`});await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Crown',exact:false})).toBeFocused();
  15 |  expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).desiredFrame).toBe(0);
  16 |  const slider=page.getByRole('slider',{name:'Watch rotation'}), box=(await slider.boundingBox())!;
  17 |  for(const delta of [box.width*.7,-box.width*.7,box.width*.85,-box.width*.3]){await page.mouse.move(box.x+box.width*.1,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.1+delta,box.y+box.height*.5,{steps:28});await page.mouse.up();await page.waitForTimeout(650);}
  18 |  await settled(page);const d=await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics());expect(d.cacheFrames).toBeLessThanOrEqual(d.cacheLimit);expect(d.failedFrames).toBe(0);expect(d.displayedFrame).toBeGreaterThanOrEqual(0);
  19 |  await slider.focus();await page.keyboard.press('Home');await page.waitForTimeout(750);await settled(page);await page.keyboard.press('ArrowLeft');await page.waitForTimeout(750);await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).desiredFrame).toBe(71);
  20 |  await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await expect(page.getByRole('button',{name:'Exit fullscreen',exact:true})).toBeVisible();await page.keyboard.press('ArrowRight');await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Fullscreen',exact:true})).toBeFocused();
  21 |  await page.getByRole('button',{name:'Free 3D',exact:true}).click();await page.waitForFunction(()=>window.__VYREN?.diagnostics().ready);await page.waitForTimeout(700);await page.screenshot({path:`${output}/free-3d.png`});
> 22 |  await page.getByRole('button',{name:'Interact with the watch',exact:true}).click();const before=await page.evaluate(()=>window.__VYREN!.diagnostics().camera);await page.keyboard.press('ArrowRight');await page.waitForTimeout(250);expect(await page.evaluate(()=>window.__VYREN!.diagnostics().camera)).not.toEqual(before);await page.keyboard.press('Escape');
     |                                                                             ^ Error: locator.click: Test timeout of 120000ms exceeded.
  23 |  for(const name of ['rear view','Dial detail','Reset']){await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(1200);}
  24 |  await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.getByRole('button',{name:'Zoom out',exact:true}).click();await page.getByRole('button',{name:'Low power',exact:true}).click();await page.waitForTimeout(350);expect((await page.evaluate(()=>window.__VYREN!.diagnostics())).dpr).toBe(.8);
  25 |  await page.getByRole('button',{name:'Studio',exact:true}).click();await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).displayedFrame).toBeGreaterThanOrEqual(0);await expect(page.locator('[data-vyren-canvas]')).toHaveCount(1);
  26 |  fs.writeFileSync('qa/phase3/studio-diagnostics.json',JSON.stringify({d,errors},null,2));expect(errors).toEqual([]);
  27 | });
  28 | for(const width of [360,390,768,1280,1440,1920])test(`all nine sections and studio at ${width}px`,async({page})=>{
  29 |  await page.setViewportSize({width,height:width<=768?844:1000});await studio(page);await expect(page.locator('main>section')).toHaveCount(9);await settled(page);await page.screenshot({path:`${output}/studio-${width}.png`});
  30 |  await page.setViewportSize({width:width<=768?390:1280,height:844});await settled(page);await page.setViewportSize({width,height:width<=768?844:1000});await settled(page);
  31 |  for(const id of ['watch','manifesto','craftsmanship','movement','assembly','materials','details','moment']){await scene(page,id,id==='assembly'?.72:.55);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await page.screenshot({path:`${output}/${id}-${width}.png`});}
  32 |  await scene(page,'experience');await settled(page);await page.reload();await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).mode).toBe('studio');
  33 | });
  34 | test('reduced motion, Save-Data and slow network keep a visible source image',async({browser})=>{
  35 |  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();const session=await context.newCDPSession(page);
  36 |  await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
  37 |  await session.send('Network.enable');await session.send('Network.emulateNetworkConditions',{offline:false,latency:120,downloadThroughput:500000,uploadThroughput:250000});await studio(page);await settled(page);
  38 |  await page.getByRole('button',{name:'Back',exact:true}).click();await expect(page.locator('.studio-poster img')).toBeVisible();await settled(page);const d=await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics());expect(d.cacheFrames).toBeLessThanOrEqual(2);
  39 |  expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('.glb')))).toBe(false);fs.writeFileSync('qa/phase3/slow-save-data.json',JSON.stringify(d,null,2));await context.close();
  40 | });
  41 | test('emulated horizontal touch rotates and vertical touch scrolls',async({browser})=>{
  42 |  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();await studio(page);const cdp=await context.newCDPSession(page),box=(await page.getByRole('slider',{name:'Watch rotation'}).boundingBox())!;const x=box.x+box.width*.7,y=Math.min(650,box.y+box.height*.5);
  43 |  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=15;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*9,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(750);await settled(page);expect((await page.evaluate(()=>window.__VYREN_STUDIO!.diagnostics())).desiredFrame).not.toBe(0);
  44 |  const before=await page.evaluate(()=>scrollY);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:500}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:500-i*12}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(before);await context.close();
  45 | });
  46 | test('lighting, microscope, material studies, blueprint and component spotlight',async({page})=>{
  47 |  await page.goto('/');await scene(page,'craftsmanship',.4);const light=page.getByRole('slider',{name:'Titanium light position',exact:true});await light.focus();await page.keyboard.press('End');await expect(page.locator('.craftsmanship .light-inspection-control')).toContainText('CROWN FLUTES');
  48 |  await scene(page,'movement',.5);for(const name of ['Balance','Hairspring','Bridge']){await page.getByRole('button',{name,exact:false}).click();await expect(page.locator('.microscope-study h3')).toHaveText(name);}await page.getByRole('button',{name:'Overall view',exact:false}).click();await expect(page.locator('.microscope-study')).toHaveCount(0);
  49 |  await scene(page,'assembly',.72);await page.waitForFunction(()=>window.__VYREN_SEQUENCE?.diagnostics().displayedFactors?.ASSEMBLY_MOVEMENT===1);await expect(page.locator('.component-spotlight')).toContainText('MOVEMENT');await scene(page,'assembly',0);await page.waitForFunction(()=>window.__VYREN_SEQUENCE?.diagnostics().restMatrixDelta===0);
  50 |  await scene(page,'materials',.4);await expect(page.locator('.material-interaction')).toHaveCount(3);await scene(page,'details',.5);await expect(page.locator('.blueprint-morph img')).toBeVisible();expect(await page.locator('.blueprint-morph img').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  51 | });
  52 | 
```