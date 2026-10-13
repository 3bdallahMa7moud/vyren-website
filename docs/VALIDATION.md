# Actual validation — VYREN website

Final production application tested at 2026-10-10T18:05:31.739Z. All **nine scenes are implemented**. Actual browser testing was performed. Nine Playwright cases passed; failures: 0; skipped: 0. Edge 155.0.4283.45, headless Windows, using ANGLE (Intel, Intel(R) UHD Graphics (0x0000A78B) Direct3D11 vs_5_0 ps_5_0, D3D11).

## Executed checks

- `npm run build`: successful Next.js 16.4.0 production build, static App Router homepage.
- Strict TypeScript and `npm run lint`: successful, no lint warnings.
- All nine scene captures; initial and revealed hero; case and movement macros; intermediate/full/restored assembly; materials; front/rear/dial viewer; specifications; finale.
- Forward disassembly, backward scroll and exact restoration: local translation delta **0 m**.
- Mouse drag changes the camera. Front/rear/detail/reset, zoom in/out and low-power controls are exercised.
- Desktop anchors, Back to Top, deep-scroll refresh and mobile menu focus/Escape/navigation are exercised.
- A mobile deep link plus CDP touch events rotates the actual model; Finish exploring releases the canvas interaction mode and page scrolling remains available.
- Reduced-motion content and manual separation/reassembly pass.
- WebGL disabled: the original Cycles images and all nine editorial scenes remain visible.
- Desktop main test: console errors **0**, failed requests/HTTP failures **0**.

## Measured local observations

| Measurement | Result |
|---|---:|
| Hero 1600px WebP | 66,436 bytes |
| All 24 prepared WebP derivatives | 1,396,336 bytes |
| Original/copied GLB | 15,723,748 bytes (15.00 MiB) |
| Initial recorded resource transfer (excluding HTML document) | 474,841 bytes |
| Browser LCP observation on loopback | 144 ms |
| Browser CLS observation | 0.001137 |
| GLB requested on initial hero | False |
| Geometry triangles / Three.js mesh primitives / materials | 360,274 / 85 / 27 |
| Steady viewer render calls, including transmission passes | 167 |
| Peak calls when the desktop shadow map updates | 250 |
| Steady rendered triangles across passes | 692,054 |
| Renderer texture objects, including derived studio buffers | 7 |
| Observed viewer render rate over a 3s sample | 48.1 frames/s |
| Mean CPU submission/render-call time (last 180 samples) | 1.47 ms |
| Total recorded shadow updates during desktop run | 7 |

These are actual local headless measurements, not Lighthouse scores, GPU timer queries, field Core Web Vitals or promises of performance on a phone. The test used Intel UHD rather than the available RTX 3050. The 1.5x glass buffer favors clarity and remains a significant GPU cost. Low-power mode reduces DPR, transmission resolution and removes the shadow pass. CPU submission time is not GPU frame time.

Four embedded image maps (two 2048² and two 1024²) require approximately 40 MiB of uncompressed RGBA storage before mipmaps (about 53.3 MiB with complete mip chains), plus environment/render targets and geometry. This is an estimate from image dimensions, not a driver memory measurement. No KTX2, Draco, Meshopt or LOD result is claimed. The source-quality GLB stays intact.

## Responsive scope

360, 390, 768, 1280, 1440 and 1920px widths were checked in the desktop browser. All tested scene positions have no horizontal page overflow. Screenshots cover mobile hero, mobile menu and viewer, plus tablet/large desktop. Touch was tested through browser-generated touch input. **No physical phone, mobile GPU or Safari was available.** Desktop emulation is not a real-device test.

## Preservation, dependency review and remaining manual work

16 protected source files were rehashed and remain unchanged: both Blender files, original GLB/assembly JSON and the selected source PNG renders. Original scripts and prior reports were not edited; all website changes live under `06_WEBSITE`.

Production dependency audit: zero reported vulnerabilities. Full development audit reports five affected dependency entries in the Next ESLint / fast-glob / micromatch / braces chain (the braces denial-of-service advisory), with no compatible patched fix offered by the registry at delivery. This is tooling scope; no production vulnerability was reported. Do not force a downgrade of the verified framework or disable lint to hide it.

Manual release review remains: actual iOS/Android graphics and touch, Safari rendering, slow-network cold load, the eventual hosting origin, and RTX browser performance. Set `NEXT_PUBLIC_SITE_URL` before public hosting. No deployment or purchase workflow was requested or performed.
