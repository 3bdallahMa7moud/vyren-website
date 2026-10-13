from pathlib import Path
import json
site=Path(__file__).resolve().parents[1];qa=site/'qa/phase2-cinematic';docs=site/'docs';docs.mkdir(exist_ok=True)
read=lambda p:json.loads((qa/p).read_text())
before=read('baseline/performance.json');after=read('after/performance.json');capture=read('after/capture.json');baseline_capture=read('baseline/capture.json');evidence=read('evidence-summary.json');orbit=read('hero-orbit.json');motion=read('motion-review.json');tests=read('test-results/results.json');fidelity=read('fidelity-metrics.json')
ratio=(after['activeRotationFps']/before['activeRotationFps']-1)*100
scenes='''| المشهد | التحسين الفعلي والحركة المميزة |
|---|---|
| 01 — Hero | ساعة أكبر، صورة أصلية من أول إطار، قناع سطري للعناوين، فتح حجاب استوديو داكن، ودوران كاميرا Cycles أصلي صغير يعود إلى زاوية البداية. الصورة الثابتة تبقى تحت الحركة. |
| 02 — Typography | سطران يتحركان باتجاهين مع تدرّج التباعد؛ الساعة في مستوى مستقل تحت الكلمات؛ ستارة من العاجي إلى الجرافيت عند الخروج، مع لون تنقل يتبع موضع الستارة الحقيقي في الاتجاهين. |
| 03 — Titanium | تتبّع محدود داخل دقة الصورة ثم مسح إلى زاوية التاج الأصلية المختلفة؛ خطوط التعليقات تظهر عند اللقطة المناسبة. |
| 04 — Movement | انتقال من الميناء المفتوح إلى ماكرو الآلية، وتتابع تعليق النابض والجسر؛ تمدّد بصري محدود دون اختراع حركة ميكانيكية. |
| 05 — Exploded | تأسيس، محاذاة المحور، فصل، تأمل، عودة، حل نهائي؛ GSAP واحد يحرك المجموعات الأصلية؛ تعليقات مرتبطة بإسقاط مواقعها الحقيقية. |
| 06 — Materials | انتقال أفقي له فترات توقف مستقرة لكل خامة؛ قناع اتجاهي للتيتانيوم، كشف عمودي للسافير، تباعد دقيق للميناء، واستقرار هادئ للمطاط. الموبايل يحتفظ بأربعة أقسام عمودية. |
| 07 — Viewer | ساعة أكبر وزاوية أمامية مائلة قليلًا، هدف خلفي أوضح، قصور حركي أهدأ، Zoom متدرّج وReset يعيد الوضع نفسه بدقة. |
| 08 — Details | رسم خط القطر وامتداداته عند حدود العلبة، كشف الرقم الموثّق 41 فقط، وقناع متتابع للبيانات؛ الصورة لا تُغطّى عند العقارب. |
| 09 — Finale | تكوين أكبر على اليسار، انسحاب بصري محدود، قناع سطري للعنوان وإغلاق خط التذييل؛ CTA يعود للعارض. |
'''
run='''```powershell
cd D:\\VYREN\\06_WEBSITE
npm run dev
```

لنسخة الإنتاج والاختبارات:

```powershell
npm run build
npm run test:phase2
npm run start
```
'''
report=f'''# VYREN — تقرير المرحلة الثانية السينمائية

تم صقل الموقع القائم، مع الحفاظ على Next.js وGSAP وLenis ونموذج Three.js وCanvas واحدة. لا توجد إعادة بناء أو ساعة بديلة أو تغيير للماستر أو GLB الأصلي. تاريخ الدليل الفعلي: {capture['testedAt']}.

{scenes}

## الخامات والإضاءة

AgX وsRGB مستمران. البيئة الأصلية من بطاقات Blender أصبحت PMREM بحجم 512 بدل 256، وشدتها 0.55 بدل 0.45. Exposure أصبح 2^0.15 بدل 2^0.25، والإضاءة الأساسية 0.55 بدل 0.8 مع ملء علوي 0.12 وضوء حافة دافئ 0.18. بطاقتا الضوء الأمامية والأساسية زيدتا قليلًا. خرائط PBR الأصلية باقية؛ Normal Scale لخارج التيتانيوم أصبح 0.75. سماكة العدستين، IOR 1.76 وTransmission 1 باقية؛ Roughness السافير 0.004 كان موجودًا في baseline وليس تحسينًا جديدًا.

مخزن الزجاج البصري 1.0 أثناء الحركة و1.5 عند الاستقرار، و0.5 في Low power. هذا تخفيف موثّق لأخذ العينات أثناء التفاعل، لا إزالة للزجاج. لا توجد مطابقة فوتوغرافية تامة مع Cycles.

## التحقق والنتائج

- نتيجة مجموعة المتصفح النهائية: {tests['stats']['expected']} نجحت، {tests['stats']['unexpected']} فشلت، {tests['stats']['skipped']} متجاوزة. Edge {capture['browser']} على Windows.
- رجوع سريع وإعادة تحميل وسط التفكيك، ثم Rest Translation وRest Matrix بانحراف صفر.
- Front / Rear / Detail / Reset، Zoom، موس، لمس مولّد بالمتصفح، Low power، التنقل والكيبورد، fallback وتقليل الحركة.
- 360، 390، 768، 1280، 1440، 1920 بكسل، دون overflow أفقي في مواقع الاختبار.
- تم التحقق من ثبات عدد ScrollTriggers بعد تبديل تقليل الحركة ثلاث مرات؛ مسار reduced-motion لا ينشئ ScrollTriggers.
- أخطاء console/request في التقاط التسليم: {len(capture['errors'])}/{len(capture['failures'])}.
- {evidence['protectedSourceFiles']} ملفًا أصليًا محفوظًا؛ النسخة العامة من GLB مطابقة بالـSHA256. نسخة رجوع من {evidence['backupFilesVerified']} ملفًا تم التحقق من كل hashes فيها.

## الأداء قبل وبعد

| قياس محلي بنفس المتصفح والـDPR | قبل | بعد |
|---|---:|---:|
| الرسم أثناء تدوير فعلي بالموس | {before['activeRotationFps']:.1f} FPS | {after['activeRotationFps']:.1f} FPS |
| إطارات مرسومة خلال 3 ثوانٍ من السكون | {before['idleRenderedFramesIn3s']} | {after['idleRenderedFramesIn3s']} |
| Draw calls مستمرة | {before['diagnostic']['drawCalls']} | {after['diagnostic']['drawCalls']} |
| GLB | 15,723,748 bytes | نفسه |
| LCP من التقاط loopback | {baseline_capture['initial']['lcp']:.0f} ms | {capture['initial']['lcp']:.0f} ms |
| CLS | 0.001137 | {capture['initial']['cls']:.6f} |

الفرق في قياس الدوران {ratio:+.1f}%. لا ندّعي تحسن FPS؛ الساعة أصبحت أكبر. التحسن الواضح هو وقف العمل عند السكون وخارج الشاشة. قياس الحركة الأول بعد التكبير كان قرابة 31 FPS، ثم عولجت تكلفة الزجاج. الأرقام محلية على Intel UHD، وليست أداء هاتف أو مؤشرات ميدانية أو زمن GPU.

## الدليل والملفات

`qa/phase2-cinematic/gallery.html` معرض مقارنة قبل وبعد؛ `{evidence['scenePairs']}` مقارنة مشاهد و`{evidence['fidelityPairs']}` مقارنة مع Cycles. الصور الجديدة في `after`، والاختبارات في `regression` و`test-results`، والتسجيل الفعلي في `after/scroll-through.webm`، والموبايل في `after/mobile-motion.webm`. `motion-filmstrip.jpg` مأخوذ من الفيديو الحقيقي؛ التحليل في `motion-review.json`.

حركة Hero: {orbit['animatedFrames']} إطار Cycles أصلي بدقة 1280×960، {orbit['samples']} عينة مع denoising، أقصى دوران 2.1 درجة، وWebP مدته 1.2 ثانية، حجمه {orbit['assetBytes']:,} بايت. التحريك يعمل مرة واحدة على desktop بعد الصورة الأصلية؛ لا يطلب على الموبايل أو reduced-motion أو Save-Data أو الرابط العميق. الإطارات وبيانات الرندر في `hero-frames`. لا حفظ لملف Blender. الموارد الأولية في التقاط المتصفح ارتفعت من {baseline_capture['initial']['resourceBytes']:,} إلى {capture['initial']['resourceBytes']:,} بايت؛ هذه تكلفة الحركة الإضافية وليست توفيرًا في التنزيل.

ملفات التنفيذ المعدّلة: `src/components/landing.tsx`، `motion.ts`، `product-stage.tsx`، `src/lib/watch-engine.ts`، `src/app/globals.css`. أضيف `src/components/hero-orbit.tsx`. أضيفت إعدادات وسكربتات QA والتقارير؛ `qa/tests/experience.spec.ts` أصبح يقبل مسار إخراج مستقل حتى لا يكتب فوق baseline.

## الحدود الباقية

لم يتوفر هاتف فعلي أو Safari؛ اللمس والموبايل محاكاة desktop. الزجاج في WebGL ما زال أنعم من Cycles، والتظليل غير المباشر وanisotropy أقل دقة؛ الماكرو يبقى صورة Cycles. الحركة الماكروية انتقال بين زوايا حقيقية وليست محاكاة escapement عامل. التشغيل العلني والاستضافة لم يكونا ضمن المطلوب. تصوير الفيديو القديم استخدم خطوات وتجاوزًا بين الأقسام؛ الفيديو النهائي يستخدم تمرير RAF متصل، فلا يصح قياس فرق نعومة الفيديوهين كاختبار متكافئ.

## التشغيل

{run}
'''
(docs/'PHASE2_CINEMATIC_REPORT.md').write_text(report,encoding='utf-8')
motion_doc=f'''# Phase 2 — Motion QA

Actual final production Edge recording: `qa/phase2-cinematic/after/scroll-through.webm`. Continuous pass: {motion['reviewedContinuousRangeSeconds'][0]:.1f}–{motion['reviewedContinuousRangeSeconds'][1]:.1f}s; earlier recording seconds include setup, initial/revealed Hero and scene capture pauses. This is actual browser motion, not a slideshow. Mobile recording is desktop emulation and section navigation, not a physical-phone scroll film.

Decoded video sampled at 5 fps and inspected at quarter/middle/late progression for all nine scenes. Near-uniform samples during the continuous pass: {motion['nearUniformSamples']}. Filmstrip and per-sample brightness/contrast/differences are retained. This detects gross blank intervals and supports temporal visual inspection; it is not a live FPS or objective stutter assessment. The Hero review starts at the first sampled product frame ({motion['firstProductFrameSeconds']:.1f}s). The full untrimmed recording retains the browser's white page before navigation; that is not an application transition.

Distinct choreography per scene, eight boundaries reviewed: Hero product exit into editorial contrast; editorial graphite curtain into case; genuine crown view followed by movement/dial cut; movement into six-phase assembly; restoration into material studies; held rubber composition into interactive orbit; photographic front elevation into measurement; final pullback into signature/footer. No repeated global fade-up preset.

Functional suite: {tests['stats']['expected']} passed, {tests['stats']['unexpected']} failures. Rapid reversals, intermediate reload, exact rest matrices, preset/inertia reset, offscreen and idle suspension, material holds, resize, keyboard/mobile menus, deep links, reduced-motion preference cycling, mouse/touch and WebGL fallback executed. Canvas count remains 1. GSAP context/matchMedia cleanup and Lenis ticker cleanup remain in the existing hook. Original QA is retained unchanged; Phase 2 outputs are separate.

Run `npm run build` then `npm run test:phase2`; the config reuses or launches a production server at port 3001. Run capture using `PLAYWRIGHT_BROWSERS_PATH=qa/phase2-cinematic/runtime` and `node scripts/phase2-capture.mjs after` (PowerShell environment assignment). Edge is the installed browser; no replacement browser installed.
'''
(docs/'PHASE2_MOTION_QA.md').write_text(motion_doc,encoding='utf-8')
rows='\n'.join(f"| {m['view']} | {m['beforeRgbDifference']} | {m['afterRgbDifference']} |" for m in fidelity)
visual=f'''# Phase 2 — Visual fidelity

The source GLB and 16 protected originals remain SHA256-identical. Every watch image is an authentic Blender render of the actual master. The new 30-frame Hero orbit rotates only the real camera in a read-only background Blender process; geometry, materials and studio lighting are unchanged. Source edits and .blend saves are absent.

Scene screenshot pairs: viewport 1440×1000 / mobile 390×844, DPR 1, same normalized scene progress and controls. Scene heights, camera framing and light calibration intentionally differ. The larger watch and changed spacing mean pixel scroll positions differ; these are editorial before/after comparisons, not radiometric tests. Hero is back at its original pose after the once-only orbit.

WebGL reference pairs: same original camera positions/up vectors, target, sensor/lens-derived FOV, source aspect and background, assembled transforms, and the real renderer. Existing reference poses are stored separately from the new viewer presets. Capture uses settled optical quality, not moving-buffer quality. Exposure/light/normal calibration changed and is disclosed in the cinematic report. Original PBR maps, metallic factors and dielectric lens properties remain intact.

| View | Before RGB difference | After RGB difference |
|---|---:|---:|
{rows}

Mean absolute whole-image RGB difference includes background and lighting. It is not a realism score, percentage match or photographic-equivalence test. Inspect the actual triptychs in `qa/phase2-cinematic/comparisons/fidelity-*.jpg`.

Observed limits: broad titanium reflections can still appear flatter than Cycles; screen-space solid-glass transmission softens the smallest text and fine edges; multi-bounce occlusion and microfinish anisotropy remain weaker. The existing Cycles macro images preserve those details. No invisible-glass shortcut, new approximation watch or unsupported mechanical animation was used. The fictional calibre is not certified or claimed mechanically functional.
'''
(docs/'PHASE2_VISUAL_FIDELITY.md').write_text(visual,encoding='utf-8')
performance=f'''# Phase 2 — Performance

Actual separate mouse-drag probe, same Edge {after['browser']}, 1440×1000, DPR 1, ANGLE Intel UHD. Before {before['activeRotationFps']:.2f} FPS; after {after['activeRotationFps']:.2f} FPS ({ratio:+.1f}%). These are rendered-frame observations during the recorded input path, not field metrics or a promise on every device. The earlier 48.1 FPS report sampled idle rendering; this new before/after samples actual rotation.

Static 3-second rendered-frame count: {before['idleRenderedFramesIn3s']} → {after['idleRenderedFramesIn3s']}. Offscreen rendering also suspends. The RAF driver still checks presentation and controls, but expensive WebGL/transmission work is skipped. Absolute transforms are computed from source rest data; no delta accumulation. A tiny signature quantization avoids drawing imperceptible damping residue and does not modify rest transforms.

Draw calls: {before['diagnostic']['drawCalls']} → {after['diagnostic']['drawCalls']}; peak remains 250 when shadow updates. Source geometry: 360,274 triangles, 85 mesh primitives, 27 materials, 10 assembly groups. Texture count remains 7; PMREM resolution doubles, which costs additional environment memory. Shader programs precompile once before ready. Source GLB remains 15.00 MiB and remains deferred beyond initial Hero.

Moving optical buffer: 1.0; settled: 1.5; Low power: 0.5 + DPR 0.8 + no desktop shadow pass. A first calibration at full optical sampling throughout interaction fell to ~31 FPS; the measured moving-buffer path recovered responsiveness. Native DPR 1 remains intact; high-DPR screens can reduce their cap toward 1 when sustained render intervals exceed 28 ms. This is a documented sampling tradeoff, not a reduction in geometry or glass material fidelity.

Mean CPU render-call time in the latest probe: {after['diagnostic']['averageCpuRenderMs']:.2f} ms versus {before['diagnostic']['averageCpuRenderMs']:.2f} ms. It includes driver work and buffer quality changes; it is not GPU time. LCP/CLS observations are loopback snapshots, not Lighthouse scores: {capture['initial']['lcp']:.0f} ms / {capture['initial']['cls']:.6f}. Initial recorded resources: {capture['initial']['resourceBytes']:,} bytes; Hero orbit adds {orbit['assetBytes']:,} bytes on eligible desktops after the poster, then unmounts. Mobile/reduced-motion/deep links skip it. Original 24 WebP stills stay unchanged.

No Draco/Meshopt/KTX2 or product-detail decimation was applied. Compare source JSON probes and screenshots; no real phone, Safari or mobile GPU performance was available.
'''
(docs/'PHASE2_PERFORMANCE.md').write_text(performance,encoding='utf-8')
print(json.dumps({'reports':4,'passed':tests['stats']['expected'],'activeFps':after['activeRotationFps'],'idleFrames':after['idleRenderedFramesIn3s']}))
