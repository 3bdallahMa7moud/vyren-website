import fs from 'node:fs';
import crypto from 'node:crypto';
const root='qa/section-seven-fixes',read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const optimized=read(`${root}/optimization.json`),baseline=read('qa/section-seven/network-loading.json'),loading=read(`${root}/network-loading.json`),tests=read(`${root}/all-results/results.json`),poster=read(`${root}/poster-continuity.json`);
const rerun=read(`${root}/regression-results/results.json`);
const flatten=suites=>suites.flatMap(s=>[...(s.specs??[]),...flatten(s.suites??[])]);
const failed=flatten(tests.suites).filter(s=>!s.ok),passedAgain=new Set(flatten(rerun.suites).filter(s=>s.ok).map(s=>s.title));
if(rerun.stats.unexpected||failed.length!==2||!failed.every(s=>passedAgain.has(s.title)))throw new Error('Unresolved regression check');
const verifiedTests=tests.stats.expected+rerun.stats.expected;
const verification={verifiedChecks:verifiedTests,initialRun:tests.stats,rerun:rerun.stats,rerunTitles:[...passedAgain],unresolved:[],note:'Two legacy cases sought the viewer immediately after a motion-preference layout rebuild. QA now waits for GSAP setup and aligns the visible target before awaiting lazy assets. All application source outside the intended viewer scope stays unchanged.',reports:['all-results/results.json','regression-results/results.json']};
fs.writeFileSync(`${root}/verification.json`,JSON.stringify(verification,null,2));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const checkpoint=read(`${root}/checkpoint.json`),allowed=['src/components/landing.tsx','src/components/product-stage.tsx','src/lib/watch-engine.ts','src/app/globals.css'];
const changes=checkpoint.filter(e=>sha(e.path)!==e.sha256).map(e=>e.path),unexpected=changes.filter(p=>!allowed.some(a=>p.replaceAll('\\','/').endsWith(a)));
const stripViewer=s=>s.replace(/\r/g,'').replace(/function Viewer\(\) \{[\s\S]*?(?=\nexport function Landing)/,'<VIEWER>');
const landingOutsideViewerIdentical=stripViewer(fs.readFileSync('src/components/landing.tsx','utf8'))===stripViewer(fs.readFileSync('../08_BACKUPS/SECTION_SEVEN_FIXES_20261011/src/components/landing.tsx','utf8'));
const proof={checked:checkpoint.length,changes,unexpected,protectedAssetsUnchanged:unexpected.length===0,landingOutsideViewerIdentical};
fs.writeFileSync(`${root}/scope-proof.json`,JSON.stringify(proof,null,2));
if(unexpected.length||!landingOutsideViewerIdentical)throw new Error('Review verification failed');
const beforeMs=baseline.measuredFromNavigationStartMs.firstRenderedFrame,afterMs=loading.measuredFromNavigationStartMs.firstRenderedFrame;
const payloadPercent=(1-optimized.optimized.gzipBytes/optimized.original.gzipBytes)*100,timePercent=(1-afterMs/beforeMs)*100;
const rows=[
 ['توقف WebGL بعد الاستعادة','إعادة بناء إضاءة PMREM والظلال واستكمال العرض بنفس الكاميرا؛ دورتان فعليتان ناجحتان.'],
 ['فشل تحميل الموديل بلا استعادة','ثلاث محاولات محدودة للشبكة، وزر Try again يعيد إنشاء العارض ويلغي التحميل القديم. اختُبرت المحاولة التلقائية واليدوية.'],
 ['قص السوار في Rear view','الكادر يُحسب من رؤوس الموديل الفعلية مع هامش. فُحصت 358,773 نقطة أصلية في الأمام والخلف على سبعة مقاسات.'],
 ['تعذر التدوير بالكيبورد','الأسهم تدور، + و− يقربان، وEsc ينهي التفاعل ويعيد التركيز للزر.'],
 ['ضبابية الموبايل وتداخل الأدوات','دقة 2× عند الاستقرار، ودقة أخف أثناء الحركة. النص وزر التفاعل في مساحة مستقلة تحت الساعة. مساحة الصورة ثابتة عند بدء التفاعل وإنهائه.'],
 ['تحميل أولي ثقيل',`حجم النقل المضغوط ${ (optimized.original.gzipBytes/1e6).toFixed(2)} ← ${(optimized.optimized.gzipBytes/1e6).toFixed(2)} MB؛ انخفاض ${payloadPercent.toFixed(1)}%. أول إطار ${(beforeMs/1000).toFixed(2)} ← ${(afterMs/1000).toFixed(2)} ثانية؛ تحسن ${timePercent.toFixed(1)}%.`],
 ['اختلاف صورة الانتظار عن العرض','صورتان حقيقيتان من كاميرا العارض للموبايل والديسكتوب، بنفس الزاوية والخلفية. متوسط فرق البكسلات بين صورة الموبايل والإطار الأول '+poster.meanAbsoluteChannelDifference.toFixed(3)+' من 255 لكل قناة.'],
 ['صغر الخط وغموض Low power','أزرار بحجم خط 11–12 px ومساحة نقر لا تقل عن 44 px. اسم Low power ثابت وحالة الضغط تعبّر عن تشغيله.'],
];
const summary={tests:verification,optimizedPayloadReductionPercent:payloadPercent,firstFrameImprovementPercent:timePercent,beforeFirstFrameMs:beforeMs,afterFirstFrameMs:afterMs,proof,poster};fs.writeFileSync(`${root}/summary.json`,JSON.stringify(summary,null,2));
fs.writeFileSync('SECTION_SEVEN_FIXES_AR.md',`# إصلاح السكشن السابع — VYREN

تم تنفيذ إصلاحات العرض والاستعادة والتفاعل وفحصها في Edge. الموقع يعمل على [المعاينة المحلية](http://127.0.0.1:3000/#experience).

| المشكلة السابقة | نتيجة الإصلاح |
|---|---|
${rows.map(([a,b])=>`| ${a} | ${b} |`).join('\n')}

## التحقق

نجح ${verifiedTests} اختبارًا: 14 حالة خاصة بالعارض و25 حالة للموقع والأقسام التسعة وتسلسل Cycles واللمس والملاحة وتقليل الحركة. نجح TypeScript وESLint وبناء الإنتاج. المقاسات: 360×640، 390×844، 768×1024، 844×390، 1280×720، 1440×1000، 1920×1080.

في الجولة الكاملة نجح 37 اختبارًا وانتهت مهلة حالتين بعد تبديل تفضيل الحركة. تم تحديث توقيت الاختبارين لانتظار اكتمال تهيئة GSAP وإظهار العارض داخل النافذة قبل انتظار أصوله المحملة عند الحاجة؛ نجحت إعادتهما. السجلان الأصليان محفوظان.

قياس التحميل هو أول إطار مرسوم من بداية الملاحة، مع فحص كل 20 ms. نفس محاكاة 4 Mbps و120 ms، وموبايل 390×844/DPR 2، وسياق متصفح جديد. دقة الرسم الفعلية في القياس القديم 1× وفي النسخة النهائية 2×؛ المقارنة تشمل رفع جودة أول إطار. التحميل عند الاقتراب من السكشن؛ الصورة البديلة تبقى متاحة أثناء التحميل. هذه قياسات محلية على Edge ومحاكاة لمس؛ أجهزة فعلية وSafari لم يُختبرا.

## حفظ الأصل ودقة نسخة العرض

فُحصت ${checkpoint.length} ملفات بالهاش. أصول الصور والـGLB وتسلسل السكشن الخامس ومشروع Blender الأصلي محفوظة. محتوى Landing خارج دالة Viewer مطابق للنسخة السابقة. النسخة الاحتياطية: D:/VYREN/08_BACKUPS/SECTION_SEVEN_FIXES_20261011.

نسخة الويب تستخدم [EXT_meshopt_compression](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Vendor/EXT_meshopt_compression/README.md). فهارس المثلثات وترتيبها مطابقان؛ أكبر فرق عددي محلي في إحداثيات الرؤوس ${(optimized.maxPositionErrorM*1e6).toFixed(4)} ميكرومتر. بيانات العقد والخامات وعدد الأجزاء محفوظة. حُوّلت أربع صور خامات إلى WebP بلا فقد، والتحقق أكد تطابق كل بكسلات RGBA. العدد محفوظ: 85 mesh و27 خامة و360,274 مثلثًا و10 مجموعات تركيب. [ملف GLB الأصلي](D:/VYREN/06_WEBSITE/public/assets/vyren-noctis-01.glb) محفوظ؛ ملف العرض مشتق مستقل.

## الأدلة

- [الفحص السابق](D:/VYREN/06_WEBSITE/SECTION_SEVEN_AUDIT_AR.md)
- [صور قبل وبعد](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/index.html)
- [نتائج الاختبارات والتحقق من الإعادة](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/verification.json)
- [الجولة الكاملة](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/all-results/results.json)
- [إعادة الحالتين](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/regression-results/results.json)
- [قياس التحميل](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/network-loading.json)
- [حفظ الأصول](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/scope-proof.json)
- [الضغط ودقته](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/optimization.json)
- [استعادة WebGL](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/context-recovery.json)
- [تطابق صورة الانتظار](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/poster-continuity.json)

![العارض بعد الإصلاح](D:/VYREN/06_WEBSITE/qa/section-seven-fixes/1440x1000-front.png)
`);
fs.writeFileSync(`${root}/index.html`,`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>VYREN — إصلاح السكشن السابع</title><style>body{background:#0d1014;color:#ebe7df;font:16px system-ui;margin:32px auto;max-width:1400px;padding:0 24px}h1{font-size:32px}.pairs{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:42px}img{width:100%;height:auto;border:1px solid #42474b}figure{margin:0}figcaption{margin-bottom:12px;color:#c1a780}table{width:100%;border-collapse:collapse;margin:30px 0}td,th{text-align:right;padding:14px;border-bottom:1px solid #42474b}p{line-height:1.8}@media(max-width:700px){.pairs{grid-template-columns:1fr}}</style><h1>السكشن السابع — بعد الإصلاح</h1><p>${verifiedTests} اختبارًا ناجحًا. حجم النقل أقل ${payloadPercent.toFixed(1)}%، وأول إطار أسرع ${timePercent.toFixed(1)}% على نفس محاكاة الشبكة.</p><table><tr><th>المشكلة</th><th>الإصلاح</th></tr>${rows.map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table>${[['1440x1000','front'],['1440x1000','rear'],['390x844','front'],['390x844','rear']].map(([size,pose])=>`<h2>${size} — ${pose}</h2><div class="pairs"><figure><figcaption>قبل</figcaption><img src="../section-seven/viewport/${size}-${pose}.png"></figure><figure><figcaption>بعد</figcaption><img src="${size}-${pose}.png"></figure></div>`).join('')}<h2>من متصفح المستخدم</h2><img style="max-width:518px" src="in-app-browser.jpg"><p>التحقق على Edge؛ المقاسات واللمس والشبكة محاكاة. لم تُختبر أجهزة فعلية أو Safari.</p></html>`);
console.log(JSON.stringify({tests:verifiedTests,payloadPercent,timePercent,scopeVerified:unexpected.length===0,landingOutsideViewerIdentical}));
