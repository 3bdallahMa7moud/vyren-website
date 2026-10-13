# VYREN — Phase 3.1 / QA

## بيئة الاختبار

Windows، Edge 155.0.4283.45 headless، نسخة Next.js production محلية على 127.0.0.1:3001. responsive widths 360/390/768/1280/1440/1920؛ المجموعة السابقة تشمل أيضًا 360×640 و844×390 وDPR2 وtouch emulation. لا اختبار Safari أو جهاز هاتف فعلي.

## نتائج فعلية

- `npm.cmd run typecheck`: ناجح.
- `npm.cmd run lint`: ناجح بلا تحذيرات مصدر.
- `npm.cmd run build`: ناجح. تشغيل Turbopack احتاج صلاحية العملية المحلية على Windows؛ لا نشر خارجي.
- `npx.cmd playwright test --config playwright.phase31.config.ts`: 59 حالة (58 ناجحة، 1 إخفاق في التشغيل الكامل الأول). 50 من Phase 3 و9 جديدة للانتقالات.
- الحالة السابقة `deterministic forward, reverse, arbitrary seek and synchronized labels` رأت فرق إطارين مقابل الحد 1 في أول تشغيل. أعيدت بذات assertions، دون تعديل كود sequence أو توسعة tolerance: `--repeat-each 3`، ناجحة 3/3 (39s). بقي سبب اختلاف التوقيت الأول غير مثبت؛ لم يُخفَ من التقرير. كل الحالات الـ59 لها نتيجة نجاح فعلية، لكن الجولة الكاملة لم تكن نظيفة من أول مرة.
- copied legacy tests لا تغير السلوك إلا assertion واحد: Back يخفي Dial المحجوب، ويُبقي Crown الظاهر بالفعل حسب rays. الباقي تحويل مسارات outputs إلى هذا المجلد للحفاظ على أدلة Phase 3 السابقة.

## الاختبارات التسعة الجديدة

1. 72 مصفوفة CAM_HERO + alpha bounds في 8 layouts، scale ثابت أثناء الدوران.
2. أربع زوايا Studio/Free، screen fit والكاميرا، والعودة إلى الإطار نفسه.
3. تأخير أول GLB: يبقى Studio الأصلي حتى render Free الصحيح.
4. تأخير atlas/frame أثناء العودة: Free يظل ظاهرًا وStudio القديم مخفيًا.
5. 32 تبديلًا سريعًا: تسليمات قديمة ملغاة، canvas واحد، compileShader count ثابت.
6. تأخير decode غير مرتب وإلغاء fetch: الزاوية النهائية لا تُكتب فوقها استجابة قديمة.
7. Save-Data: كاش 2، لا atlas، retry عند failure، لا empty flash.
8. Free tilt إلى nearest azimuth وresize أثناء exploration يحفظ الكاميرا.
9. bitmap cleanup بعد التبديل/navigation: كل المنشأ أُغلق.

المجموعة السابقة تغطي reduced motion، fullscreen الحقيقي والبديل، macro/focus/Escape، touch/scroll، keyboard wrap71↔0، WebGL unavailable وcontext loss مرتين، retry GLB، idle/offscreen، كل الأقسام التسعة، والتسلسل المنفصل بمصفوفات rest الأصلية.

## العيب البصري

فحص 72 WebP كاملة 1600×1200: alpha>16، اتصال 4-neighbor، تجاهل مجموعات ≤24 pixels. لا مكون منفصل فوق هذا الحد. `full-resolution-alpha-scan.json` وcontact sheet هما الدليل؛ لا ادعاء بنفي كل بكسل antialiasing صغير.

الـbaseline: 24 تبديلًا / 12 عودة، 8 عينات عدم تطابق الإطار القديم مع المطلوب. بعد: 24 تبديلًا / 12 عودة، صفر mismatch في Studio الظاهر. توجد 5 عينات buffer قديم أثناء التجهيز لكنه مخفي؛ ليست تسليمًا خاطئًا. recording الأول المرفق بالنص عند 55–57s غير متاح، لذلك لم يُثبت سبب fragment بعينه.

## الموارد والأصل

492 أصل محمي مطابق SHA-256، Blender/GLB/public/exploded محفوظة. 14 ملفات source غير متعلقة بقيت مطابقة. لا duplicate Three canvases، ولا bitmap orphan في الاختبار، لا initial GLB. راجع `scope-verification.json` و`diffs` وcheckpoint.

## ملفات الإثبات

- `test-results/results.json` و`full-test-run.log`: التشغيل الكامل الأول بما فيه الإخفاق.
- `sequence-recheck.log` و`recheck-results`: النجاح 3/3 للحالة المعادة.
- `after` و`before`: screenshots الأبعاد الستة والزوايا.
- `reproduction` و`after-switches`: اختبار العودة المتكرر وdiagnostics.
- `recording/studio-polish-session.webm` و`timing.json` و`inspection-contact.jpg`: جلسة المتصفح الفعلية.
- `camera-matrix-validation.json` و`hotspot-rays.json` و`bitmap-cleanup.json`: فحوص المصدر والإسقاط والموارد.

- التسجيل الذي ذكر جزءًا يسار الساعة عند 55–57 ثانية لم يكن ضمن المرفقات المتاحة. لم يتكرر هذا الجزء في الاختبارات؛ لا يوجد ادعاء بإثبات سببه أو إصلاح مصدر هندسي غير مُثبت.
- Free 3D يحتفظ باختلافات Three.js في الانعكاس والانكسار والخامات المخبوزة؛ لا يطابق Cycles فوتوغرافيًا، خصوصًا الحركة الخلفية ومشبك السوار.
- الميل الرأسي والـroll الحر لا يمكن تمثيلهما بمجموعة Studio ذات المحور الواحد. العودة تُقرب azimuth إلى 5 درجات ولا تدعي مطابقة الميل.
- اختبار الهاتف محاكاة viewport/touch في Edge على Windows، وليس جهاز هاتف فعلي. لم يُختبر Safari أو iOS أو متصفح آخر.
- عند 360px صغر الإطار الابتدائي بنحو 7% مقابل النسخة السابقة لحماية أعرض زوايا السوار. لم أستخدم نسبة تكبير واحدة لكل الأجهزة.
- fallback الـatlas أقل دقة مؤقتًا، وSave-Data ينتظر الإطار الكامل مع إبقاء العرض الحالي عند تبديل الوضع.
