from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,html

site=Path(__file__).resolve().parents[1];qa=site/'qa/exploded-cycles'
read=lambda p:json.loads(p.read_text())
assets=read(qa/'asset-report.json');production=read(site.parent/'04_RENDER_OUTPUT/Exploded_Scroll/production/sequence.json')
visual=read(qa/'production-frame-review.json');hero=read(qa/'production-hero-comparison.json');scope=read(qa/'scope-audit.json')
tests=read(qa/'test-results/results.json');performance=read(qa/'performance/report.json');capture=read(qa/'after/capture.json')
mb=lambda n:f'{n/1000000:.2f} MB'
link=lambda title,p:f'- [{title}]({p.as_posix()})'
lines=[
'# تقرير تسليم VYREN — تسلسل التفكيك السينمائي',
'',
'تم استبدال تصوير الساعة داخل قسم التفكيك فقط بتسلسل Cycles حقيقي من هندسة الساعة الأصلية. التحكم بالتمرير أمامًا وخلفًا، مع بقاء العناوين والتنقل والأسماء ومؤشر التقدم. العارض التفاعلي الثلاثي الأبعاد مستقل ويحتفظ بالتحريك والتقريب والمشاهد الجاهزة.',
'',
'هذا التسلسل صور مرندرة مسبقًا يتحكم بها التمرير، وليس نموذجًا ثلاثي الأبعاد حر الحركة أو مشغل فيديو.',
'',
'## الرندر والمصدر',
'',
f'- Blender {production["blender"]}، Cycles، {production["backend"]} GPU، {production["samples"]} عينة، إزالة ضوضاء، adaptive threshold {production["adaptiveThreshold"]}.',
'- AgX / Medium High Contrast، تعريض +0.25 EV، Gamma 1. إضاءة وخامات الاستوديو الأصلية. Max bounces 10، transmission 8، transparent 8.',
'- البداية بكاميرا CAM_HERO الأصلية وعدسة 66 mm. انتقال مستمر إلى محور التفكيك مع اتساع إلى 46 mm، ثم عودة للكاميرا والوضع الأصلي.',
f'- معاينة منخفضة التكلفة: 49 إطارًا، 800×600، 32 عينة، تمت مراجعتها قبل الإنتاج. الإنتاج: {assets["frameCount"]} موضعًا زمنيًا، {visual["uniqueRenderedFrames"]} رندرًا فريدًا مع إعادة استخدام الوقفات المتطابقة.',
f'- مدة عمليات الرندر المسجلة: {visual["renderSeconds"]/60:.1f} دقيقة. الأرشيف PNG RGBA: {mb(assets["archivalBytes"])}، خارج مجلد ملفات المتصفح.',
f'- فرق مصفوفات الأجزاء عند العودة: {visual["restoredMatrixDelta"]}، وفرق مصفوفة الكاميرا: {visual["endpointCameraMatrixDelta"]}. حدود Alpha متساوية. متوسط فرق RGBA بين الرندرين: {visual["endpointRgbaMeanDifference"]}؛ يعود الوضع الأصلي دون ادعاء تطابق كل البكسلات.',
f'- تحقق SHA-256 من {len(scope["protectedSources"])} مصدرًا محميًا، يشمل ملفات Blender وGLB وبيانات التجميع والرندرات الأصلية. نسخة التراجع تحتوي على {scope["backupFilesVerified"]} ملفًا متحققًا.',
'',
'## ملفات الويب والتحميل',
'',
'WebP RGBA بجودة 90 / method 4. الاختيار جاء بعد قياس وقت الترميز والحجم وخطأ الضغط مقابل method 6، مع الحفاظ على Alpha دون تغيير. الشفافية اختيرت بعد مقارنة فعلية مع ضغط خلفية #14191e داخل الصورة؛ الخلفية الشفافة تترك لون الموقع نفسه وتتفادى حدود مستطيل مضغوط.',
'',
'| النسخة | الدقة | الصور الفريدة | الحجم الكامل للصور | حد الصور المفكوكة |',
'|---|---|---:|---:|---:|',
]
for name,label in [('desktop','الكمبيوتر'),('mobile','الموبايل')]:
    v=assets['variants'][name];lines.append(f'| {label} | {v["width"]}×{v["height"]} | {v["uniqueFrames"]} | {mb(v["totalBytes"])} | {v["limit"]} |')
lines += [
'',
'نسخة الموبايل قص عمودي من مساحة المصدر، مع التحقق من بقاء الساعة وكل أجزائها داخل القص في جميع الإطارات. لا تمديد أو تشويه. حجم الجدول هو مجموع ملفات الصور الفريدة؛ البوسترات والـmanifest إضافية وصغيرة، والتحميل الفعلي يعتمد على مسار التمرير والكاش.',
'',
'التحميل يبدأ قرب القسم بمسافة 900 px، ويقدم الإطار المطلوب وأقرب أربعة إطارات في كل اتجاه. التزامن 3 طلبات للكمبيوتر / 2 للموبايل. الصور القديمة تُحرر عبر ImageBitmap.close، والطلبات المتجاوزة تُلغى، والذاكرة المفكوكة تُفرغ عند مغادرة القسم أو إخفاء الصفحة. عند التأخير يبقى آخر إطار صحيح ويظل التمرير متاحًا.',
'عند وصول صورة جاهزة قريبة خلف موضع التمرير، يستفيد العرض منها ويتقدم باتجاه الإطار المطلوب بدل انتظار رقم يتحرك باستمرار. عند التوقف يصل للإطار المطلوب بدقة. الأسماء ومؤشر التقدم يتبعان الصورة المعروضة.',
'',
'## GSAP والتزامن',
'',
'نفس ScrollTrigger للقسم، من top top إلى bottom bottom، مع scrub 0.55 للكمبيوتر / 0.22 للموبايل. التعيين الحتمي: `round(clamp(progress,0,1) × 160)`. التدرج الحركي للأجزاء والكاميرا داخل رندر Blender نفسه. الأسماء والخطوط ومؤشر التقدم تتبع الإطار المعروض، فتظل متزامنة عند انتظار التحميل.',
'',
'الحركة المخفضة تعرض وضعين ثابتين عبر الأزرار الأصلية، وSave-Data يختار المواضع الزوجية لزيارة مجموعة أصغر. تم إصلاح إعادة تحميل #assembly من منتصف الحركة وتحقق المتصفح من الاحتفاظ بموضع 33% قبل وبعد التحديث.',
'',
'## المقارنة البصرية',
'',
'مرجع hero-1600.webp مصدره رندر Cycles شفاف 1920×1440، 160 عينة، من نفس الكاميرا والخامات والإضاءة وAgX. المصدر الجديد 1600×1200 / 128 عينة، وضغطه مختلف. المطابقة بصرية وهندسية؛ لا توجد دعوى تطابق بكسلات مع الـHero.',
f'- حدود Alpha المرجعية: {hero["referenceAlphaBounds"]}، الجديدة: {hero["newAlphaBounds"]}.',
f'- متوسط فرق RGB بعد التركيب على خلفية الموقع: {[round(n,3) for n in hero["compositedMeanRgbDifference"]]} من 255.',
f'- متوسط الفرق داخل قناع الساعة المرجعي: {[round(n,3) for n in hero["referenceProductMaskedMeanRgbDifference"]]} من 255. هذا مقياس اختلاف صور، وليس نسبة واقعية.',
f'- جميع حدود Alpha داخل إطار المصدر: {visual["allAlphaBoundsInsideSource"]}. تم فحص storyboard وتتابع إطارات الإنتاج وصور المتصفح وحواف الضغط.',
'- انعكاس المستطيل الأبيض على الزجاج في زاوية التفكيك ناتج عن إضاءة الاستوديو الأصلية. تم فحص بقاء كل الأجزاء داخل الإطار على الكمبيوتر والموبايل، وتتابع التفكيك والعودة في تسجيل المتصفح الفعلي.',
'',
'## اختبار المتصفح والأداء',
'',
f'المتصفح الفعلي: Edge {capture["browser"]}. اختبارات Playwright: {tests["stats"]["expected"]} ناجحة، {tests["stats"]["unexpected"]} فاشلة، {tests["stats"]["flaky"]} متذبذبة. فحوص TypeScript وESLint والبناء الإنتاجي اجتازت.',
'',
'المقاسات: 1440، 1280، 768، 390، 360 px، بالإضافة إلى فحوص الموقع السابقة عند 1920 px. الاختبارات تشمل الأمام والخلف والقفز السريع والمواضع الوسيطة والتحديث وتغيير الحجم والحركة المخفضة والتحميل المحجوب والتنقل وغياب WebGL وعودة العارض المستقل وتحريك اللمس المحاكى.',
'',
'القياس التالي من متصفح حقيقي على الجهاز المحلي، مع ثلاث دورات بطيئة للذهاب/العودة ثم رجوع سريع. حالة 4 Mbps محاكاة شبكة CDP، وليست قياسًا من هاتف أو شبكة خارجية.',
'',
'| الحالة | بايتات النقل Resource Timing | صور الكاش القصوى | ذاكرة الصور المفكوكة القصوى | التأخر P95 بالأطر، ذهاب بارد / عودة / ذهاب دافئ / عودة سريعة |',
'|---|---:|---:|---:|---|',
]
for r in performance['reports']:
    lags=' / '.join(str(p['frameLag']['p95']) for p in r['passes']);f=r['final']
    lines.append(f'| {r["scenario"]["name"]} | {mb(r["transfer"]["wireBytes"])} | {f["peakCacheFrames"]} | {f["peakDecodedBytes"]/1048576:.1f} MiB | {lags} |')
lines += [
'',
'Resource Timing يشمل حمل الاستجابة وتكون قيمة النقل صفرًا للملفات المقروءة من الكاش. سجل CDP منفصل يتتبع النقل المكتمل وبيانات الطلبات الملغاة المتاحة. عداد downloadedBytes داخل العرض يقيس البلوْبات المفكوكة من fetch وقد يعيد احتساب قراءة الكاش؛ لا يستخدم كقياس بايتات الشبكة.',
'',
'ذاكرة الجدول تخص ImageBitmaps المحتفظ بها فقط؛ لا تشمل canvas أو فك الطلبات الجاري أو ذاكرة المتصفح وGPU. أزمنة RAF هي جدولة الصفحة، ولا تعني أن كل صورة سينمائية عُرضت بهذه السرعة. بيانات الإطارات الخام محفوظة للتحقق.',
'فحص الخروج من القسم سجل صفر صور مفكوكة وصفر طلبات معلقة في الحالات الثلاث. فحص خادم التطوير الذي سيظل مفتوحًا على بورت 3000 أعاد HTTP 200، ووصل للإطار 115 المطلوب دون أخطاء JavaScript.',
'',
'عند التمرير السريع أو شبكة بطيئة قد تتجاوز الحركة بعض المواضع أو تحتفظ مؤقتًا بآخر صورة حتى تتاح الصورة المطلوبة. الاختبار تحقق من عدم ظهور canvas فارغ ومن الوصول إلى الإطار الصحيح بعد التوقف. الأجهزة المحمولة الفعلية وSafari لم تُختبر؛ المقاسات واللمس محاكاة على Edge المكتبي.',
'',
'## المخرجات',
'',
link('المصدر القابل لإعادة الرندر',site.parent/'02_BLENDER/scripts/render_exploded_scroll.py'),
link('الأرشيف وبيانات الأجزاء والكاميرا',site.parent/'04_RENDER_OUTPUT/Exploded_Scroll/production/sequence.json'),
link('ملفات الويب وManifest',site/'public/assets/exploded-cycles/manifest.json'),
link('مكون العرض',site/'src/components/assembly-sequence.tsx'),
link('منطق التحميل والكاش',site/'src/lib/cycles-sequence.ts'),
link('مقارنة Hero',qa/'production-hero-match.jpg'),
link('قبل وبعد',qa/'before-after.jpg'),
link('تسجيل المتصفح الفعلي',qa/'after/assembly-scroll.webm'),
link('تقرير الأداء التفصيلي',qa/'performance/report.json'),
link('نتائج الاختبارات',qa/'test-results/results.json'),
link('فحص حدود التغيير والمصادر',qa/'scope-audit.json'),
link('دليل إعادة التشغيل والتنفيذ',site/'EXPLODED_CYCLES_IMPLEMENTATION.md'),
]
before_loading=read(qa/'performance-before-loading-fix/report.json')
old=before_loading['reports'][-1]['passes'][0]['frameLag']['p95'];new=performance['reports'][-1]['passes'][0]['frameLag']['p95']
lines.insert(lines.index('## المخرجات'),f'في اختبار 4 Mbps ظهر انتظار زائد للإطار الدقيق أثناء تحرك موضع التمرير. بعد تصحيح تقديم أقرب صورة جاهزة، انخفض تأخر P95 في المرور الأول من {old} إلى {new} إطارات. هذا يعادل نحو {new/10:.1f} ثانية في مسار الاختبار الذي يستغرق 16 ثانية؛ بعد التوقف يصل للإطار الصحيح، والمرور الدافئ سجل P95 صفرًا. سجل القياس السابق محفوظ للمقارنة.\n')
(site/'EXPLODED_CYCLES_REPORT_AR.md').write_text('\n'.join(lines),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',22)
pairs=[('ASSEMBLED',qa/'baseline/assembled.png',qa/'after/assembled.png'),('PARTIAL / SAME SCROLL 32%',qa/'baseline/partial.png',qa/'after/partial.png'),('FULL / PREVIOUS 56%, NEW 72%',site/'qa/phase2-cinematic/regression/screenshots/08-assembly-full.png',qa/'after/full.png')]
sheet=Image.new('RGB',(1440,1620),'#14191e');draw=ImageDraw.Draw(sheet)
for row,(name,before,after) in enumerate(pairs):
    for col,(label,file) in enumerate([('PREVIOUS WEBGL',before),('NEW CYCLES',after)]):
        im=Image.open(file).convert('RGB');im.thumbnail((720,500));sheet.paste(im,(col*720,row*540+40));draw.text((col*720+12,row*540+8),f'{label} / {name}',font=font,fill='white')
sheet.save(qa/'before-after.jpg',quality=95)
figures=[('مطابقة Hero','production-hero-match.jpg'),('الإنتاج','production-storyboard.jpg'),('قبل وبعد','before-after.jpg'),('موبايل 390 px','after/mobile-full.png'),('حواف الشفافية','edge-comparison-desktop.jpg'),('تتابع تسجيل المتصفح','after/recording-review/motion-filmstrip.jpg')]
body=''.join(f'<figure><figcaption>{html.escape(label)}</figcaption><a href="{url}"><img loading="lazy" src="{url}" alt="{html.escape(label)}"></a></figure>' for label,url in figures)
(qa/'index.html').write_text(f'<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>VYREN — مراجعة التسليم</title><style>body{{background:#14191e;color:#f1eee8;font:16px system-ui;max-width:1440px;margin:40px auto;padding:20px}}figure{{margin:32px 0}}img,video{{display:block;width:100%;height:auto}}figcaption{{margin-bottom:12px}}a{{color:#c5a684}}</style><h1>VYREN — مراجعة تسلسل Cycles</h1><p>رندر حقيقي من الساعة الأصلية. التسجيل التالي دليل مراجعة فقط؛ الموقع يعرض canvas يتحكم به التمرير.</p><video controls preload="metadata" src="after/assembly-scroll.webm"></video>{body}</html>',encoding='utf-8')
print(json.dumps({'report':str(site/'EXPLODED_CYCLES_REPORT_AR.md'),'tests':tests['stats'],'assetVariants':assets['variants']}))
