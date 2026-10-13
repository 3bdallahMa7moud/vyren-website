from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil

site=Path(__file__).resolve().parents[1]
docs=site/'docs'; docs.mkdir(exist_ok=True)
desktop=json.loads((site/'qa/reports/desktop.json').read_text())
metrics=json.loads((site/'qa/reports/fidelity-metrics.json').read_text())
tests=json.loads((site/'qa/test-results/results.json').read_text())
stats=tests['stats']
if stats['unexpected'] or stats['expected'] != 9: raise ValueError(f'Final suite did not pass: {stats}')
assets=json.loads((site/'qa/asset-manifest.json').read_text())
resources=desktop['initial']['resources']
transfer=sum(r['transferBytes'] for r in resources)
fps=desktop['observedFramesPerSecond']; viewer=desktop['viewer']
hero_bytes=(site/'public/assets/hero-1600.webp').stat().st_size
media_bytes=sum(m['bytes'] for m in assets['media'])
validation=f'''# Actual validation — VYREN website

Final production application tested at {desktop['testedAt']}. All **nine scenes are implemented**. Actual browser testing was performed. Nine Playwright cases passed; failures: {stats['unexpected']}; skipped: {stats['skipped']}. Edge {desktop['browser']}, headless Windows, using {desktop['gpu']}.

## Executed checks

- `npm run build`: successful Next.js 16.4.0 production build, static App Router homepage.
- Strict TypeScript and `npm run lint`: successful, no lint warnings.
- All nine scene captures; initial and revealed hero; case and movement macros; intermediate/full/restored assembly; materials; front/rear/dial viewer; specifications; finale.
- Forward disassembly, backward scroll and exact restoration: local translation delta **{desktop['restored']['restDelta']} m**.
- Mouse drag changes the camera. Front/rear/detail/reset, zoom in/out and low-power controls are exercised.
- Desktop anchors, Back to Top, deep-scroll refresh and mobile menu focus/Escape/navigation are exercised.
- A mobile deep link plus CDP touch events rotates the actual model; Finish exploring releases the canvas interaction mode and page scrolling remains available.
- Reduced-motion content and manual separation/reassembly pass.
- WebGL disabled: the original Cycles images and all nine editorial scenes remain visible.
- Desktop main test: console errors **{len(desktop['errors'])}**, failed requests/HTTP failures **{len(desktop['failures'])}**.

## Measured local observations

| Measurement | Result |
|---|---:|
| Hero 1600px WebP | {hero_bytes:,} bytes |
| All 24 prepared WebP derivatives | {media_bytes:,} bytes |
| Original/copied GLB | 15,723,748 bytes (15.00 MiB) |
| Initial recorded resource transfer (excluding HTML document) | {transfer:,} bytes |
| Browser LCP observation on loopback | {desktop['initial']['lcp']:.0f} ms |
| Browser CLS observation | {desktop['initial']['cls']:.6f} |
| GLB requested on initial hero | {desktop['initial']['glbInitiallyRequested']} |
| Geometry triangles / Three.js mesh primitives / materials | 360,274 / 85 / 27 |
| Steady viewer render calls, including transmission passes | {viewer['drawCalls']} |
| Peak calls when the desktop shadow map updates | {viewer['peakRenderCalls']} |
| Steady rendered triangles across passes | {viewer['renderedTriangles']:,} |
| Renderer texture objects, including derived studio buffers | {viewer['textures']} |
| Observed viewer render rate over a 3s sample | {fps:.1f} frames/s |
| Mean CPU submission/render-call time (last 180 samples) | {viewer['averageCpuRenderMs']:.2f} ms |
| Total recorded shadow updates during desktop run | {viewer['shadowUpdates']} |

These are actual local headless measurements, not Lighthouse scores, GPU timer queries, field Core Web Vitals or promises of performance on a phone. The test used Intel UHD rather than the available RTX 3050. The 1.5x glass buffer favors clarity and remains a significant GPU cost. Low-power mode reduces DPR, transmission resolution and removes the shadow pass. CPU submission time is not GPU frame time.

Four embedded image maps (two 2048² and two 1024²) require approximately 40 MiB of uncompressed RGBA storage before mipmaps (about 53.3 MiB with complete mip chains), plus environment/render targets and geometry. This is an estimate from image dimensions, not a driver memory measurement. No KTX2, Draco, Meshopt or LOD result is claimed. The source-quality GLB stays intact.

## Responsive scope

360, 390, 768, 1280, 1440 and 1920px widths were checked in the desktop browser. All tested scene positions have no horizontal page overflow. Screenshots cover mobile hero, mobile menu and viewer, plus tablet/large desktop. Touch was tested through browser-generated touch input. **No physical phone, mobile GPU or Safari was available.** Desktop emulation is not a real-device test.

## Preservation, dependency review and remaining manual work

16 protected source files were rehashed and remain unchanged: both Blender files, original GLB/assembly JSON and the selected source PNG renders. Original scripts and prior reports were not edited; all website changes live under `06_WEBSITE`.

Production dependency audit: zero reported vulnerabilities. Full development audit reports five affected dependency entries in the Next ESLint / fast-glob / micromatch / braces chain (the braces denial-of-service advisory), with no compatible patched fix offered by the registry at delivery. This is tooling scope; no production vulnerability was reported. Do not force a downgrade of the verified framework or disable lint to hide it.

Manual release review remains: actual iOS/Android graphics and touch, Safari rendering, slow-network cold load, the eventual hosting origin, and RTX browser performance. Set `NEXT_PUBLIC_SITE_URL` before public hosting. No deployment or purchase workflow was requested or performed.
'''
(docs/'VALIDATION.md').write_text(validation,encoding='utf-8')
rows='\n'.join(f"| {m['view']} | {m['meanAbsoluteRgbDifference_0to255']:.3f} |" for m in metrics)
fidelity=f'''# Visual fidelity — real website compared with Cycles

Six image pairs were captured from the actual production Three.js scene and visually reviewed: hero, front, rear, movement, strap and crown. Reference PNGs are the existing controlled final-master Cycles renders under `04_RENDER_OUTPUT/Comparison_Final/Controlled/after`. Browser captures use matching camera positions, target orientation, lens/sensor-derived field of view, source aspect ratio, product dimensions, assembled state and a #343c42 background. Interface overlays are hidden only during comparison captures; the real renderer/model/materials remain in use.

The comparison script normalizes the browser image to the reference dimensions and measures mean absolute RGB difference. This includes the background and lighting, so it is **not a realism score, percent match or proof of radiometric equivalence**.

| View | Mean absolute RGB difference, 0–255 scale |
|---|---:|
{rows}

## Observed strengths and weaknesses

- **Hero:** the watch silhouette, case/crown proportions, integrated strap and dial layout agree closely. Browser metal is darker and flatter in its broad reflections; the deployant face reflects a darker studio region. The website hero/finale therefore use the actual Cycles render.
- **Front:** markers, hands, open-heart position and the 41mm case are faithful. Web transmission still softens small typography and bright edges; it is clearer at larger framing but does not equal Cycles. Both solid crystals remain present with transmission 1, IOR 1.76 and exported volume thickness (1.2mm front, 0.7mm rear).
- **Rear:** rotor/bridge geometry and strap silhouette are consistent. Browser glass, reduced multi-bounce shading and less indirect occlusion make the movement look shallower/brighter than Cycles.
- **Movement:** fine source geometry remains identifiable. The baked web microfinish, screen-space refraction and simple key shadows do not reproduce ray-traced contact shading or anisotropy. The website's extreme movement scene uses the actual Cycles macro.
- **Strap:** matte black rubber and the sculptural lug connection are preserved. Directional microfinish and interface shadows remain weaker/different; the key light can accentuate the baked normal response. Cycles supplies the material photograph.
- **Crown:** the flutes, engraved V and guard geometry match. Broad titanium gradients and polished-edge reflection layout are less photographic in the browser. Cycles supplies the craftsmanship macro.

## Website calibration choices

Existing Blender rectangle geometry/radiance reconstructed into a PMREM environment, Three.js AgX, sRGB output, 2^0.25 exposure; environment intensity adjusted from the asset harness's 0.35 to 0.45 for the website. Neutral fill 0.25 plus a restrained 0.8 key adds a 1024px PCF shadow pass on desktop. Static shadows are cached; assembly changes invalidate the map. Mobile and low-power mode omit this pass.

Source normal and roughness/metallic atlases are retained with their original non-color texture interpretation. A documented web approximation changes only the sapphire micro-roughness from 0.012 to 0.004 and uses a 1.5x transmission render target to improve clarity. Reflection, transmission, IOR, lens geometry and thickness remain intact. No invisible sapphire or alpha-glass shortcut is used.

The hybrid uses optimized still Cycles renders, animated with layered framing, masks and typography. No new Blender video/image sequence is claimed. A brief dark cut avoids crossfading incompatible product poses when the real-time slot becomes ready. There is no claim of photographic parity; the actual paired JPGs are in `qa/comparisons`.
'''
(docs/'VISUAL_FIDELITY.md').write_text(fidelity,encoding='utf-8')
arabic=f'''# تقرير تسليم VYREN NOCTIS 01

تم تنفيذ الموقع الكامل داخل `D:\\VYREN\\06_WEBSITE`. الأقسام التسعة موجودة، واختبار المتصفح الفعلي أُجري على النسخة الإنتاجية، ونجحت الحالات التسع الأخيرة.

1. الافتتاح: صورة Cycles الأصلية، كشف تدريجي من الظلام، أقنعة سطور العنوان، ثم الأزرار.
2. بيان العلامة: تباعد حروف مرتبط بالتمرير وحركة متعاكسة للنص حول الساعة.
3. الهيكل: تتبع لقطة ماكرو، مسح ضوئي محدود وخطوط وصف المادة.
4. الحركة: توسع فتحة بصرية واقتراب ماكرو وتعليق تدريجي على الميزان والنابض. الآلية توضيحية ثابتة وليست محاكاة تشغيل معتمدة.
5. التفكيك: عشرة تجمعات فعلية تستعمل إزاحات glTF وتوقيت JSON الأصلي؛ فصل، توقف، ثم إعادة تركيب. التمرير العكسي يعمل، وفارق العودة إلى الموضع الأصلي صفر.
6. المواد: لوحات أفقية على سطح المكتب ودراسات رأسية على الهاتف.
7. التجربة: GLB حقيقي قابل للدوران بالماوس واللمس، تخميد، واجهة/خلفية/ماكرو، إعادة ضبط، تكبير ووضع توفير الطاقة.
8. التفاصيل: خطوط قياس وظهور مقصوص لصفوف المواصفات، مع قطر دائري متحقق منه 41 مم.
9. الخاتمة: تراجع بصري للمنتج وحسم الإضاءة وأزرار التجربة والعودة للأعلى.

المعمارية: Next.js App Router وReact وTypeScript strict وTailwind/CSS، مع GSAP/ScrollTrigger وLenis على سطح المكتب. محرك Three.js واحد، نموذج واحد وCanvas واحدة تنتقل بين موضعي التفكيك والتجربة. تتوقف عملية الرسم خارج هذه المشاهد، وتُحرّر الموارد والمستمعات عند الإزالة.

الدمج الهجين: الصور مشتقة من رندرات الساعة الأصلية فقط، بتنسيق WebP متجاوب. GLB مطابق للمصدر، دون تغيير ملفات Blender أو المصدر. تُحافظ الخامات على خرائطها وعلى انتقال الزجاج وIOR والسُمك، مع تقريب موثق لخشونة الزجاج. لم يتم توليد ساعة بديلة أو فيديو Blender جديد.

الجودة البصرية: تمت مراجعة ست مقارنات فعلية. الشكل والأبعاد متقاربان؛ انعكاسات المعدن وعمق الزجاج وظلال الماكرو لا تطابق Cycles. لذلك بقيت لقطات الماكرو السينمائية من Cycles. النتائج والصور مرفقة في VISUAL_FIDELITY.md وqa/comparisons.

الاختبارات: نجاح TypeScript وlint وproduction build. تسع حالات متصفح ناجحة، تشمل التمرير العكسي، استعادة التجميع، جميع الأزرار، التنقل، تحديث صفحة عميقة، القائمة ولوحة المفاتيح، الحركة المخفّضة، غياب WebGL، وإدخال لمس مُحاكى. أخطاء console وطلبات الشبكة في اختبار سطح المكتب: صفر.

القياسات المحلية: ملصق الافتتاح {hero_bytes:,} بايت؛ كل مشتقات WebP {media_bytes:,} بايت؛ GLB نحو 15 MiB ومؤجّل التحميل. LCP على localhost {desktop['initial']['lcp']:.0f}ms، وCLS {desktop['initial']['cls']:.6f}. العارض سجل {fps:.1f} إطاراً/ثانية على Intel UHD؛ {viewer['drawCalls']} استدعاء رسم مستقر وذروة {viewer['peakRenderCalls']} مع تحديث الظل. هذه ملاحظات محلية وليست نتيجة جهاز RTX أو هاتف أو Lighthouse.

التجاوب: 360 و390 و768 و1280 و1440 و1920 بكسل، دون تجاوز أفقي في مواضع المشاهد المختبرة. هذه محاكاة سطح مكتب، وإدخال اللمس تم عبر المتصفح؛ لم يُختبر هاتف فعلي أو Safari.

المراجعة اليدوية المتبقية: أداء iOS/Android، Safari، شبكة بطيئة، اختيار GPU المنفصل، وتحديد عنوان الاستضافة النهائي. GLB ما زال 15 MiB ولا توجد مطالبة بضغط KTX2/Draco/Meshopt. audit الإنتاجي صفر؛ سلسلة أدوات lint تحتوي خمس إدخالات اعتماد متأثرة بتنبيه تطوير موثق.

التشغيل المحلي:
```powershell
cd D:\\VYREN\\06_WEBSITE
npm run dev
```
ثم http://127.0.0.1:3000. للإنتاج: `npm run build` ثم `npm start`.
'''
(docs/'DELIVERY_AR.md').write_text(arabic,encoding='utf-8')
for name in ['cormorant-garamond','manrope']:
 shutil.copy2(site/f'node_modules/@fontsource/{name}/LICENSE',docs/f'FONT_LICENSE_{name}.txt')
fingerprints=[]
for p in sorted((site/'src').rglob('*')):
 if p.is_file(): fingerprints.append({'path':str(p.relative_to(site)), 'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
summary={'createdAt':datetime.now(timezone.utc).isoformat(),'allNineSectionsImplemented':True,'actualBrowserTesting':True,'testStats':stats,'productionBuild':'passed','strictTypeScript':'passed','lint':'passed, no warnings','files':fingerprints,'report':'docs/VALIDATION.md','fidelity':'docs/VISUAL_FIDELITY.md','arabic':'docs/DELIVERY_AR.md'}
(site/'qa/reports/delivery.json').write_text(json.dumps(summary,indent=2))
print(json.dumps({'testsPassed':stats['expected'],'fps':round(fps,1),'initialResourceBytes':transfer,'documentsCreated':3,'sourceFilesFingerprinted':len(fingerprints)}))
