# Phase 2 — Motion QA

Actual final production Edge recording: `qa/phase2-cinematic/after/scroll-through.webm`. Continuous pass: 34.2–66.4s; earlier recording seconds include setup, initial/revealed Hero and scene capture pauses. This is actual browser motion, not a slideshow. Mobile recording is desktop emulation and section navigation, not a physical-phone scroll film.

Decoded video sampled at 5 fps and inspected at quarter/middle/late progression for all nine scenes. Near-uniform samples during the continuous pass: []. Filmstrip and per-sample brightness/contrast/differences are retained. This detects gross blank intervals and supports temporal visual inspection; it is not a live FPS or objective stutter assessment. The Hero review starts at the first sampled product frame (0.4s). The full untrimmed recording retains the browser's white page before navigation; that is not an application transition.

Distinct choreography per scene, eight boundaries reviewed: Hero product exit into editorial contrast; editorial graphite curtain into case; genuine crown view followed by movement/dial cut; movement into six-phase assembly; restoration into material studies; held rubber composition into interactive orbit; photographic front elevation into measurement; final pullback into signature/footer. No repeated global fade-up preset.

Functional suite: 14 passed, 0 failures. Rapid reversals, intermediate reload, exact rest matrices, preset/inertia reset, offscreen and idle suspension, material holds, resize, keyboard/mobile menus, deep links, reduced-motion preference cycling, mouse/touch and WebGL fallback executed. Canvas count remains 1. GSAP context/matchMedia cleanup and Lenis ticker cleanup remain in the existing hook. Original QA is retained unchanged; Phase 2 outputs are separate.

Run `npm run build` then `npm run test:phase2`; the config reuses or launches a production server at port 3001. Run capture using `PLAYWRIGHT_BROWSERS_PATH=qa/phase2-cinematic/runtime` and `node scripts/phase2-capture.mjs after` (PowerShell environment assignment). Edge is the installed browser; no replacement browser installed.
