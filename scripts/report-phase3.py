from pathlib import Path
import hashlib, json, html
from PIL import Image, ImageDraw
root=Path('D:/VYREN'); site=root/'06_WEBSITE'; qa=site/'qa/phase3'
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def save(p,s): p.write_text(s,encoding='utf-8')
def mib(n): return f'{n/1048576:.2f} MiB'
media=read(qa/'media-sizes.json'); perf=read(qa/'performance.json'); fidelity=read(qa/'compression-fidelity.json')
tests=read(qa/'test-results/results.json') if (qa/'test-results/results.json').exists() else {}
baseline=read(root/'08_BACKUPS/WEBSITE_PHASE3_ENTRY_20261011/protected-hashes.json')
protected=[{'path':i['Path'],'unchanged':hashlib.sha256(Path(i['Path']).read_bytes()).hexdigest().upper()==i['Hash']} for i in baseline]
save(qa/'preservation.json',json.dumps({'protectedCount':len(protected),'allUnchanged':all(i['unchanged'] for i in protected),'files':protected},indent=2))
original=root/'08_BACKUPS/WEBSITE_PHASE3_ENTRY_20261011'; changed=[]
for p in (site/'src').rglob('*'):
    old=original/'src'/p.relative_to(site/'src')
    if p.is_file() and (not old.exists() or old.read_bytes()!=p.read_bytes()):changed.append(str(p))
modified={'sourceFiles':changed,'otherChanges':['package.json','playwright.phase3.config.ts','scripts/pack-phase3.py','scripts/phase3-baseline.mjs','scripts/phase3-fidelity.py','scripts/phase3-measure.mjs','scripts/phase3-record.mjs','scripts/phase3-details-qa.mjs','scripts/prepare-phase3-regressions.py','scripts/report-phase3.py','qa/phase3/tests','public/assets/studio-cycles','public/assets/phase3-signatures'],'blenderScripts':[str(root/'02_BLENDER/scripts'/n) for n in ['inspect_phase3_studio.py','render_phase3_studio.py','export_phase3_blueprint.py','export_phase3_hotspots.py']]}
modified['otherChanges'].extend(['scripts/phase3-qa-contacts.py','scripts/verify-phase3.py','PHASE3_IMMERSIVE_REPORT.md','PHASE3_STUDIO_VIEWER.md','PHASE3_FEATURES.md','PHASE3_PERFORMANCE.md','PHASE3_VISUAL_QA.md'])
save(qa/'modified-files.json',json.dumps(modified,ensure_ascii=False,indent=2))
browser_bytes=sum(p.stat().st_size for folder in ['studio-cycles','phase3-signatures'] for p in (site/'public/assets'/folder).rglob('*') if p.is_file())
archive_bytes=sum(p.stat().st_size for p in (root/'04_RENDER_OUTPUT/Phase3_Studio').rglob('*.png'))
features='''| القسم | التغيير المنفّذ |
|---|---|
| 01 — Light Sculpting | أربع حالات Cycles بإضاءة أصلية متدرجة: التاج، حافة العلبة، المينا ثم الساعة. Poster أصلي سريع، ثم حركة 2.2 ثانية؛ تُتخطى عند تقليل الحركة أو Save-Data أو الدخول لقسم آخر. |
| 02 — Kinetic Typography | حركة مستقلة لسطرَي الكتابة، تباعد أحرف مرتبط بالتمرير، كشف مقنّع وإزاحة رأسية. خلفية العاج محفوظة؛ ترتيب الطبقات يضع المنتج بين مستويَي الكتابة؛ حركة أخف للهاتف. |
| 03 — Light Inspection | تسع مواضع فعلية لضوء Blender على نفس كاميرا الماكرو؛ شريط للسحب ولوحة المفاتيح مع أوصاف للسطح والحافة والتاج. لا فلاتر لإنشاء انعكاسات مزيفة. |
| 04 — Microscope | رندرات مقرّبة مستقلة للميزان والنابض والجسر؛ أوصاف سياقية والعودة للمنظر العام. جرى تصحيح تأطير الجسر وإعادة إخراج هذه اللقطة فقط. |
| 05 — Component Spotlight | الوصف يتبع عوامل الإطار المعروض، ويشرح الزجاج والمينا والمجموعة الميكانيكية. تسلسل التفكيك الأصلي و161 موضعًا وكاشه محفوظة؛ لا إعادة رندر للتفكيك. |
| 06 — Material Discovery | Titanium: تحريك ضوء حقيقي؛ Sapphire: كشف صورة فعلية للزجاج والمينا؛ Anthracite: ماكرو جديد؛ Rubber: ماكرو مستقل للسطح والوصل. العرض الأفقي الأصلي والقصص العمودية للهاتف محفوظة. |
| 07 — Cycles Studio | Studio افتراضي؛ 72 زاوية، سحب وقصور حركة، لمس أفقي ومفاتيح، Front/3⁄4/Side/Back وReset، أربع نقاط فحص مسقطة من هندسة Blender، صور Macro حقيقية، ملء شاشة وFree 3D اختياري. |
| 08 — Blueprint Morph | كشف مرتبط بالتمرير لرسم SVG مشتق من حواف الميش المُقيّمة فعليًا. الزجاج يُخفى في نسخة الإسقاط المؤقتة لإظهار المينا. قياس 41mm الموجود سابقًا ودلائله المتحركة محفوظان؛ لا أبعاد مخترعة. |
| 09 — Cinematic Finale | 12 رندر من كاميرا Hero البديلة: سحب كاميرا من تكوين تفصيلي إلى الساعة كاملة، مع تدرج إضاءة فعلي. حركة عكسية بالتمرير وCTA يعود إلى Studio. |
'''
settings=read(root/'04_RENDER_OUTPUT/Phase3_Studio/production/render.json')
studio=f'''Studio يستخدم `studio-viewer.tsx` للتحكم بالزاوية والوضع والسحب والقصور والتركيز والحوار. `studio-hotspots.tsx` يعرض أربع نقاط من إسقاط Blender متزامنة مع الإطار المرئي، وتختفي النقاط الأمامية عند دورانها إلى الخلف؛ شريط العدسة يبقى متاحًا لكل الزوايا. صور العدسة مستقلة عن صور الدوران.

`CyclesSurface` يرسم Canvas عند تغير الإطار أو وصول الصورة أو تغير المقاس فقط. `CyclesFrameCache` مشترك بين Studio ودراسات الضوء والنهاية. أُبقي كاش التفكيك الأصلي مستقلًا لتجنب تعديل مسار مثبت بالاختبارات.

التحميل يبدأ قرب القسم: الإطار الحالي أولًا ثم ±1 و±2، وطلبان متزامنان فقط. أطلس صغير من الـ72 رندر نفسها يعطي استجابة للزاوية قبل وصول الصورة الكاملة. لا تُحمّل الـ72 صورة كاملة مقدمًا. يُلغى الطلب غير المطلوب وتُغلق ImageBitmap عند الطرد أو الخروج من الرؤية أو إزالة المكوّن. الصورة الأصلية تظهر حتى يُفك ترميز أول إطار، ثم تختفي خلف Canvas لمنع تراكب ساعتين؛ آخر Canvas صحيح يبقى أثناء انتظار التحميل.

الكاش: 6 صور Desktop و5 Mobile؛ Save-Data يخفضه إلى صورتين ويطلب الحالي فقط دون أطلس. يوجد تحرير عند إخفاء الصفحة والخروج من القسم. القياس يصف كاش الصور، وليس ذاكرة المتصفح كلها.

Free 3D يحمّل النموذج المحسّن الموجود سابقًا فقط بعد اختيار المستخدم. يستمر محرك Three.js واحد، مع الدوران واللمس والزووم وFront/Rear/Dial detail/Reset/Low power. التحويل بين Blender وglTF يطابق أقرب زاوية سمت؛ الميل العمودي الحر لا يمكن نسخه إلى دورة أحادية المحور. عند غياب bitmap decoding، تظهر صورة Studio ورسالة واضحة لاختيار Free 3D بدل التبديل التلقائي.

ملء الشاشة يستخدم Fullscreen API مع بديل ثابت؛ خروج واضح وEscape وإرجاع التركيز. فتح العدسة يحفظ الزاوية، ويقفل تمرير الصفحة ثم يعيد التركيز لمشغّلها. فُصل مشغّل ملء الشاشة عن مشغّل العدسة حتى لا تضيع وجهة التركيز.

الرندر: Blender {settings['blender']} / Cycles / {settings['backend']} على RTX 3050 Laptop؛ {settings['samples']} samples، denoising، adaptive threshold {settings['adaptiveThreshold']:.3f}. AgX، {settings['color']['look']}، Exposure {settings['color']['exposure']}EV. خامات وهندسة وأضواء الماستر الأصلية؛ سكربتات منفصلة بلا حفظ للـblend.

المعاينة: 24 زاوية 800×600 عند 32 samples فُحصت قبل الإنتاج. الإنتاج: 72 زاوية بفواصل 5°، صور أرشيف PNG RGBA 1600×1200، ونسخة Desktop WebP بنفس الدقة. نسخة Mobile بقص [347,0,1247,1200] ثم 720×960 دون تمديد.

المحور Y باتجاه السوار؛ Z عمود المينا. المركز (0,0,-0.016)m. اتجاه وعدسة Hero الأصلية 66mm مع مسافة ثابتة ×1.3 للحفاظ على الساعة طوال الدوران. العرض يحافظ على الهامش الحقيقي للألفا ويكبّر التكوين ×1.3 للديسكتوب و×1.18 للهاتف. Front=66، 3⁄4=0، Side=12، Back=24. Back زاوية خلفية مائلة تُظهر الآلية؛ السوار الحلقي قد يحجب أجزاء من الخلف في زوايا أخرى كما في المصدر.
'''
limits='''إضاءة Studio الثانية مؤجلة لتجنب مضاعفة الرندر والتنزيل؛ يوجد Soft Studio فقط ولا زر غير عامل. دراسات الضوء في القسم الثالث منفصلة. اختبار الهاتف محاكاة Edge/لمس CDP؛ لم تُختبر أجهزة هاتف فعلية أو Safari. اختلاف الانعكاسات والشفافية بين WebGL وCycles ما زال مرئيًا. الآلية نموذج بصري خيالي وليست ادعاءً بأنها تعمل أو معتمدة. لا توجد ادعاءات كمال فوتوغرافي أو ضمان FPS.
'''
performance='''القياسات من إنتاج Next.js محلي على Edge 155، DPR=1. التحميل الأولي مقاس بعد 3 ثوانٍ دون تقييد شبكة؛ الرقم مجموع resource.transferSize ويستثني وثيقة HTML. أزمنة Studio من بداية التنقل إلى `#experience` على شبكة CDP محاكاة 4Mbps / 120ms مع shell مخزّن من الزيارة الأولى وصور Studio غير مخزّنة. Poster منفصل ويظهر قبل اكتمال فك ترميز الدوران. هذه قياسات مخبرية محلية وليست نتائج خدمة منشورة.

| المقياس | 1440×1000 | 390×844 محاكاة |
|---|---:|---:|
'''
a,b=perf['results']; rows=[('الموارد الأولية',*[f"{sum(e['bytes'] for e in r['initial']['resources']):,} bytes" for r in [a,b]]),('طلب GLB أولي',*[str(r['initial']['glbRequested']) for r in [a,b]]),('LCP محلي',*[f"{r['initial']['metrics']['lcp']:.0f} ms" for r in [a,b]]),('CLS',*[f"{r['initial']['metrics']['cls']:.6f}" for r in [a,b]]),('أول إطار دوران / كامل الدقة',*[f"{r['firstOrbitMs']} / {r['refinedMs']} ms" for r in [a,b]]),('أقصى صور كاملة في الكاش',*[str(r['end']['d']['peakCacheFrames']) for r in [a,b]]),('أقصى كاش صور مفكوكة',*[mib(r['end']['d']['peakDecodedBytes']) for r in [a,b]]),('الأطلس مفكوك',mib(media['studio']['desktopAtlas']['decodedBytes']),mib(media['studio']['mobileAtlas']['decodedBytes'])),('CPU drawImage متوسط',*[f"{r['end']['d']['averageDrawMs']:.3f} ms" for r in [a,b]]),('تنزيل موارد Studio خلال المرور المقاس',*[f"{sum(e['bytes'] for e in r['end']['resources']):,} bytes" for r in [a,b]]),('أخطاء محاولات إطار / طلبات ملغاة',*[f"{r['end']['d']['failedFrames']} / {r['end']['d']['abortedRequests']}" for r in [a,b]])]
performance+='\n'.join(f'| {name} | {x} | {y} |' for name,x,y in rows)
performance+='''

محاكاة الهاتف سجلت محاولة إطار واحدة فاشلة ثم تعافت؛ الإطار النهائي كامل الدقة، والطلبات الملغاة عند تغير الزوايا جزء من سياسة الأولوية. اختبار منفصل يقطع أول طلب عمدًا ويثبت إعادة المحاولة واستمرار الصورة. تنزيلات الموارد المقاسة تختلف عن downloadedBytes الداخلي، لأن الأخير يحسب blobs كاملة وصلت إلى الكاش ويمكن أن تشمل تكرارات من HTTP cache، ولا يشمل الأطلس.

CPU drawImage لا يقيس زمن GPU أو العرض أو الإدخال ولا يثبت 60fps. كاش الصور مع الأطلس ≈55.81 MiB Desktop و18.46 MiB Mobile، ويضاف Canvas والصور HTML والكاش الآخر وWebGL وفك الترميز المؤقت. JavaScript heap ≈7–9MB في هذا المرور لا يمثل ذاكرة الرسوم. لا يوجد قياس process RAM دقيق.

حجم الملفات الجديدة على القرص يشمل نسختَي المقاس معًا، ولا يساوي التنزيل الأولي:

| المجموعة | Desktop | Mobile |
|---|---:|---:|
'''
for key,title in [('studio','72 Studio frames'),('hero','4 Hero lights'),('light','9 Light positions'),('final','12 Finale frames')]: performance+=f"| {title} | {mib(media[key]['sizes']['desktop'])} | {mib(media[key]['sizes']['mobile'])} |\n"
performance+=f"\nالأطلس Desktop {media['studio']['desktopAtlas']['bytes']:,} bytes، Mobile {media['studio']['mobileAtlas']['bytes']:,} bytes. صور الماكرو والـposter الإضافية {media['macroBytes']:,} bytes. إجمالي مجلدَي الأصول الجديدة مع SVG والبيانات والـposters: **{browser_bytes:,} bytes / {mib(browser_bytes)}**. أرشيف PNG للمعاينة والإنتاج والدراسات واللقطة المستبدلة: **{archive_bytes:,} bytes / {mib(archive_bytes)}**. القياسات الخام: [performance.json](qa/phase3/performance.json)، [media-sizes.json](qa/phase3/media-sizes.json).\n"
stats=tests.get('stats',{}); qa_text=f'''الجولة النهائية: {stats.get('expected','قيد التنفيذ')} ناجح، {stats.get('unexpected','—')} فشل، {stats.get('flaky','—')} غير مستقر، {stats.get('skipped','—')} متخطى. نتائج Playwright الخام في `qa/phase3/test-results/results.json`. الجولة الأولى محفوظة في `full-round1`: 46 ناجحًا وحالة شاشة أفقية قصيرة تعثرت لأن الاختبار انتظر الرسم خارج الرؤية؛ جرى إظهار مساحة الساعة قبل انتظار الرسم، دون تغيير المحرك لتوليد إطارات خارج الشاشة.

الاختبارات تغطي الدوران الدائري وعكسه واللمس والتمرير الرأسي والزوايا والعدسة والتركيز وEscape وFullScreen API والبديل، التبديل بين الوضعين، انقطاع إطار Cycles وإعادة المحاولة، غياب bitmap decoding وWebGL، التعافي من فقد context، إعادة تحميل GLB، الثبات والخروج من الرؤية، resize/reload، تقليل الحركة وSave-Data وشبكة بطيئة. جميع المقاسات المطلوبة 360/390/768/1280/1440/1920، إضافة إلى 844×390 للـFree 3D.

صور إنتاج فعلية في `qa/phase3/after`؛ فُحصت الواجهة والـMacro وخيارات المواد والميكروسكوب في Desktop ومحاكاة 390. التسجيل الحقيقي 40.56 ثانية في `qa/phase3/recordings/phase3-journey.webm`، مع لوحة إطارات `motion-contact.jpg`. لا توجد إعادة تركيب لصور الموقع داخل الفيديو.

مقارنة PNG / WebP عند 0/66/12/24 محفوظة في `source-webp-comparison.jpg`. متوسط فرق قنوات RGB داخل قناع المنتج {min(i['productMaskMeanChannelDifference'] for i in fidelity):.3f}–{max(i['productMaskMeanChannelDifference'] for i in fidelity):.3f} من 255؛ فرق الألفا صفر. هذا مقياس فقد الضغط وليس تقييمًا للواقعية. جرى فحص العلبة والسوار والتاج والمينا والزجاج والخلف مباشرة؛ لم تُستبدل الساعة بصور مولدة.

حفظ الأصل: {len(protected)} ملفًا، تطابق SHA256 بالكامل = {all(i['unchanged'] for i in protected)}؛ يشمل الماستر والـGLB والـassembly metadata والأصول السابقة. نسخة الرجوع في `D:/VYREN/08_BACKUPS/WEBSITE_PHASE3_ENTRY_20261011`.
'''
paths=r'''الواجهة والأصول: `D:/VYREN/06_WEBSITE`؛ رندرات الأرشيف: `D:/VYREN/04_RENDER_OUTPUT/Phase3_Studio`؛ سكربتات Blender: `D:/VYREN/02_BLENDER/scripts`؛ الأدلة والتسجيل والتقارير الخام: `D:/VYREN/06_WEBSITE/qa/phase3`.

تشغيل محلي:
```powershell
cd D:\VYREN\06_WEBSITE
npm run build
npm start -- --port 3001
```
الفحص: `npm run typecheck`، `npm run lint`، `npm run test:phase3`. تسجيل الفيديو يعيد استخدام ffmpeg الموجود سابقًا؛ عند تشغيل السكربت اضبط PLAYWRIGHT_BROWSERS_PATH إلى `D:/VYREN/06_WEBSITE/qa/phase2-cinematic/runtime`.
'''
save(site/'PHASE3_FEATURES.md','# تجارب الأقسام التسعة\n\n'+features+'\n'+limits)
save(site/'PHASE3_STUDIO_VIEWER.md','# بنية الاستوديو والرندر\n\n'+studio+'\n'+limits)
save(site/'PHASE3_PERFORMANCE.md','# الأداء والتحميل\n\n'+performance)
save(site/'PHASE3_VISUAL_QA.md','# التحقق البصري واختبارات المتصفح\n\n'+qa_text+'\n'+limits)
save(site/'PHASE3_IMMERSIVE_REPORT.md','# VYREN — تقرير المرحلة الثالثة\n\n'+features+'\n## الاستوديو والرندر\n\n'+studio+'\n## القياسات\n\n'+performance+'\n## التحقق\n\n'+qa_text+'\n## الملفات والمسارات\n\n'+paths+'\nالملفات المصدرية المعدلة/المضافة:\n\n'+'\n'.join(f'- `{p}`' for p in changed)+'\n\nالقائمة الكاملة مع السكربتات والأصول والإعدادات: [modified-files.json](qa/phase3/modified-files.json).\n\n'+limits)
scenes=[('watch','01 Light sculpting'),('manifesto','02 Kinetic typography'),('craftsmanship','03 Light inspection'),('movement','04 Microscope'),('assembly','05 Component spotlight'),('materials','06 Material discovery'),('experience','07 Cycles studio'),('details','08 Blueprint'),('moment','09 Finale')]
gallery=['<!doctype html><html lang="en"><meta charset="utf-8"><title>VYREN / Phase 3 QA</title><style>body{background:#0d1014;color:#f1eee8;font:14px Arial;margin:0;padding:35px}h1{font:48px Georgia}h2{font:28px Georgia}.pair,.studies{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:45px}img,video{width:100%;display:block}small{display:block;color:#b49a7a;margin:10px 0}video{max-height:85vh}a{color:#b49a7a}@media(max-width:700px){.pair,.studies{grid-template-columns:1fr}}</style><h1>VYREN / Phase 3</h1><p>Actual production Edge output. Phone captures are desktop emulation. Before / after scene framing varies with the interaction.</p>']
sheet=Image.new('RGB',(1200,len(scenes)*250),'#0d1014');draw=ImageDraw.Draw(sheet)
for row,(id,label) in enumerate(scenes):
    old=qa/'before'/f'{id}.png';new=qa/'after'/(f'{id}-1440.png' if id!='experience' else 'studio-shell-1440.png')
    gallery.append(f'<h2>{label}</h2><div class="pair"><div><small>Before</small><img src="before/{old.name}"></div><div><small>After</small><img src="after/{new.name}"></div></div>')
    for col,p in enumerate([old,new]):
        if p.exists():im=Image.open(p).convert('RGB');im.thumbnail((570,220));sheet.paste(im,(col*600+15,row*250+25))
    draw.text((15,row*250+5),label,fill='#b49a7a')
sheet.save(qa/'before-after-contact.jpg',quality=93)
gallery.append('<h2>Studio / material / microscope studies</h2><div class="studies">')
for pattern in ['studio-front.png','studio-34-view.png','studio-side.png','studio-back.png','studio-macro.png','free-3d.png','studio-shell-390.png','fullscreen-390.png','micro-*-1440.png','micro-*-390.png','material-*-1440.png','material-*-390.png']:
    for p in sorted((qa/'after').glob(pattern)):gallery.append(f'<div><small>{html.escape(p.name)}</small><img loading="lazy" src="after/{p.name}"></div>')
gallery.append('</div><h2>Hero / Studio continuity</h2><p>Source images normalized to product bounds for camera and material comparison; these are not UI screenshots.</p><img loading="lazy" src="hero-studio-continuity.jpg"><h2>Original PNG / WebP comparison</h2><img loading="lazy" src="source-webp-comparison.jpg"><h2>Actual production browser motion</h2><video controls preload="metadata" src="recordings/phase3-journey.webm"></video><img loading="lazy" src="recordings/motion-contact.jpg"></html>')
save(qa/'gallery.html',''.join(gallery))
print(json.dumps({'protected':len(protected),'allUnchanged':all(i['unchanged'] for i in protected),'mediaBytes':browser_bytes,'archivePngBytes':archive_bytes,'sourceCount':len(changed),'tests':stats},ensure_ascii=False,indent=2))
