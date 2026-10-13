from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];qa=root/'qa/phase3-1'
def read(name):return json.loads((qa/name).read_text(encoding='utf-8'))
before=read('performance-before.json');after=read('performance-after.json');framing=read('framing-comparison.json');scope=read('scope-verification.json');tests=read('test-results/results.json');free=read('free-performance.json');matrices=read('camera-matrix-validation.json');cleanup=read('bitmap-cleanup.json');switches=read('after-switches/diagnostics.json')
table='| العرض | ارتفاع الساعة قبل | بعد | تغير الحجم |\n|---|---:|---:|---:|\n'+''.join(f'| {r["viewport"]}px | {r["frame0HeightBefore"]:.1f}px | {r["frame0HeightAfter"]:.1f}px | {r["scaleChangePercent"]:+.1f}% |\n' for r in framing)
perf='| القياس | الكمبيوتر قبل / بعد | الهاتف قبل / بعد |\n|---|---|---|\n'
def row(label,values):return '| '+label+' | '+' | '.join(values)+' |\n'
def both(fn):return [f'{fn(before["results"][i])} / {fn(after["results"][i])}' for i in range(2)]
perf+=row('نقل الموارد الأولية، bytes، دون HTML',both(lambda r:sum(e['bytes'] for e in r['initial']['resources'])))
perf+=row('أول إطار orbit، ms',both(lambda r:r['firstOrbitMs']))
perf+=row('أول إطار كامل الدقة، ms',both(lambda r:r['refinedMs']))
perf+=row('LCP محلي، ms',both(lambda r:round(r['initial']['metrics']['lcp'],2)))
perf+=row('CLS محلي',both(lambda r:round(r['initial']['metrics']['cls'],6)))
perf+=row('أعلى عدد صور في الكاش',both(lambda r:r['end']['d']['peakCacheFrames']))
perf+=row('ذاكرة الكاش المفكوكة، bytes',both(lambda r:r['end']['d']['peakDecodedBytes']))
perf+=row('متوسط drawImage/clear، ms',both(lambda r:round(r['end']['d']['averageDrawMs'],4)))
perf+=row('طلبات إطارات failed في جولة القياس',both(lambda r:r['end']['d']['failedFrames']))
delta=[sum(e['bytes'] for e in after['results'][i]['initial']['resources'])-sum(e['bytes'] for e in before['results'][i]['initial']['resources']) for i in range(2)]
stats=tests['stats'];visibleStale=sum(s['phase']=='immediate' and s['visibleMode']=='studio' and s['d']['desiredFrame']!=s['d']['displayedFrame'] for s in switches['samples'])
changed='\n'.join('- `'+f.replace('\\','/')+'`' for f in scope['changedOriginalSourceFiles']+scope['newSourceFiles'])
limitation='''- التسجيل الذي ذكر جزءًا يسار الساعة عند 55–57 ثانية لم يكن ضمن المرفقات المتاحة. لم يتكرر هذا الجزء في الاختبارات؛ لا يوجد ادعاء بإثبات سببه أو إصلاح مصدر هندسي غير مُثبت.
- Free 3D يحتفظ باختلافات Three.js في الانعكاس والانكسار والخامات المخبوزة؛ لا يطابق Cycles فوتوغرافيًا، خصوصًا الحركة الخلفية ومشبك السوار.
- الميل الرأسي والـroll الحر لا يمكن تمثيلهما بمجموعة Studio ذات المحور الواحد. العودة تُقرب azimuth إلى 5 درجات ولا تدعي مطابقة الميل.
- اختبار الهاتف محاكاة viewport/touch في Edge على Windows، وليس جهاز هاتف فعلي. لم يُختبر Safari أو iOS أو متصفح آخر.
- عند 360px صغر الإطار الابتدائي بنحو 7% مقابل النسخة السابقة لحماية أعرض زوايا السوار. لم أستخدم نسبة تكبير واحدة لكل الأجهزة.
- fallback الـatlas أقل دقة مؤقتًا، وSave-Data ينتظر الإطار الكامل مع إبقاء العرض الحالي عند تبديل الوضع.'''
report=f'''# VYREN — Phase 3.1 / تقرير التنفيذ

توسعت ساعة Section 7 على الكمبيوتر بنحو 20.6% باستخدام صور Cycles الأصلية. لا إعادة رندر ولا استبدال نموذج. يبقى Studio الوضع الافتراضي وFree 3D اختياريًا.

## ما تغير فعليًا

- `studio-framing.ts` يستعمل حدود الألفا المجمعة `[404,210,1191,995]`، مع هوامش رأسية وأفقية منفصلة للهاتف والكمبيوتر وسقف تكبير بكسلي ثابت. الحجم ثابت أثناء دوران الساعة؛ لا تكبير متغير حسب الزاوية.
- مساحة Studio على الكمبيوتر أصبحت `clamp(600px,78svh,1000px)`؛ الهاتف `clamp(500px,72svh,660px)`. شريط التعليمات له ارتفاع ثابت بين الوضعين لتقليل حركة الساعة أثناء الانتقال.
- الصور الكاملة والـatlas والـposter والـhotspots تستعمل الإسقاط نفسه. الإطارات تتناسب دون تمدد أو قص السوار في الزوايا العادية.
- فصلت الوضع المطلوب عن الوضع الظاهر. Studio يبقى ظاهرًا أثناء أول تحميل GLB؛ Free يبقى ظاهرًا خلال تجهيز إطار Studio الجديد. لا يُكشف canvas القديم أثناء انتظار الزاوية. تسليم Free مرتبط بإتمام render لنسخة الكاميرا المطلوبة، مع إلغاء التسليمات القديمة عند النقر السريع.
- انتقال دخول قصير 180ms لشاشة واحدة؛ لا تراكب ساعتين. Reduced motion يلغي الحركة.
- مطابقة كاميرا Free مع مصفوفات CAM_HERO الفعلية وتحويل Blender إلى glTF، وعدسة 66mm، وfit/إزاحة بصرية مشتركة. خطأ المقارنة العددي الأقصى {matrices['maxError']:.9g} لكل مكون مقابل مصفوفات float32 للإطارات الـ72.
- الـhotspots تختفي لكل نقطة حسب ray casting في Blender؛ الزجاج الحقيقي شفاف للفحص والقطع المعتمة تحجب النقاط. التاج الظاهر خلفيًا يظل قابلًا للفحص، ويختفي Dial عندما يُحجب.
- حافظت على presets الأصلية Front=66، 3/4=0، Side=12، Back=24 وReset=0 ولف 71↔0. zoom-out في Free يستعمل حد OrbitControls بدل القفزة إلى مسافة .25m. Resize أثناء الاستكشاف يحفظ اتجاه المستخدم.

## ضبط Free 3D

AgX بقي كما هو؛ exposure من +.15 إلى +.25EV، environment .55→.62، key .55→.8، edge fill .18→.26. مكاسب بطاقة front من 1.15 إلى .78 وkey من 1.1 إلى .92 لتوازن الانعكاسات. PMREM بقي 512 دون blur إضافي بعد رفض معاينة بدت ألين من اللازم.

خشونة sapphire النهائية .006 بدل .004 السابقة؛ الأصل .012. جُربت .012 ثم .006 بعد المقارنة البصرية للحفاظ على قراءة الميناء مع انعكاس السافير. transmission=1، IOR≈1.76، السماكة≈.0007m، opacity=1 والهندسة الأصلية محفوظة. Titanium يحتفظ بخرائط PBR وnormalScale .75؛ لا chrome أو CSS highlights أو bloom جديد. الانعكاسات الموجودة في المصدر ليست عيوبًا تُمحى.

## العيب المؤكد وحدود التشخيص

قبل التعديل، 8 من 12 عينات العودة الفورية سجلت زاوية جديدة مطلوبة بينما canvas يحمل الإطار السابق. السبب المؤكد في مسار العرض هو كشف سطح Studio المحتفظ ببكسلاته قبل إتمام الصورة الجديدة؛ ليس دليلًا على سبب الجزء المنفصل المذكور في فيديو غير متاح.

بعد التعديل: 24 تبديلًا مسجلًا، {visibleStale} عينات تُظهر Studio بإطار قديم، ولا أخطاء pageerror. قد يبقى رقم الإطار القديم في السطح المخفي أثناء التحميل، لكن التسليم لا يكتمل إلا عند الإطار الصحيح. فحص الصور الـ72 كامل الدقة بألفا>16 واتصال 4-neighbor لم يجد مكونات منفصلة أكبر من 24 بكسل. لم تُعدل صور المصدر أو تُخفَ منطقة يسار الساعة.

## الحفظ والتحقق

Checkpoint: `D:/VYREN/08_BACKUPS/WEBSITE_PHASE3_1_ENTRY_20261011` — 582 ملفًا منسوخًا ومطابقًا. {scope['protectedAssetsVerified']} أصلًا محميًا طابق SHA-256 عند التسليم: Blender master، GLB الأصلي، metadata وكل public بما فيها exploded Cycles و72×2 Studio والـatlas. 14 ملف مصدر سابق آخر بقي byte-for-byte كما هو.

لا تبعيات جديدة. لا GLB في التحميل الأولي، لا renderer إضافي، ولا shader compilation إضافي خلال اختبار 32 تبديلًا. الكاش 6/5/2 كما كان؛ كل {cleanup['created']} bitmap مسجّل في اختبار التنظيف أُغلق ({cleanup['closed']}).

## الملفات المعدلة

{changed}

أضيفت `playwright.phase31.config.ts` وأدوات `scripts/phase31-*` والتقارير الأربعة والأدلة في `qa/phase3-1`. كود sequence/صفحات الأقسام الأخرى وملفات public غير معدلة.

## الأدلة والنتيجة

TypeScript وESLint وproduction build ناجحة. المجموعة الكاملة: {stats['expected']} ناجح، {stats['unexpected']} إخفاق في التشغيل الأول؛ الحالة المنفردة أعيدت دون تعديل تطبيق ونجحت 3/3. التفاصيل في [QA](PHASE3_1_QA.md). انظر [المقارنة](PHASE3_1_VISUAL_COMPARISON.md)، [الأداء](PHASE3_1_PERFORMANCE.md)، و[معرض الأدلة](qa/phase3-1/index.html).

## القيود المتبقية

{limitation}
'''
visual=f'''# VYREN — Phase 3.1 / مقارنة بصرية

الصور من Edge {after['browser']} محليًا على Windows، DPR 1 للمقارنة الأساسية، بالأبعاد الستة نفسها قبل وبعد. لم تُنشأ صورة ساعة بالذكاء الاصطناعي. ملفات screenshots كاملة وغير معدلة؛ ملفات comparison تجمعها بنسبة أبعاد محفوظة.

## الحجم

{table}

هذه القيم محسوبة من ارتفاع الألفا للإطار صفر (666px في المصدر) ومن dimensions canvas الفعلية، مع دقة قياس تقارب بكسلًا. لا تعني زيادة دقة الصور. المصدر نفسه 1600×1200 desktop و720×960 mobile. الساعة الأكبر على desktop تحت سقف 1 source pixel لكل CSS pixel؛ DPR المرتفع ما زال يستعمل interpolation من الصور الحالية.

![الكمبيوتر قبل وبعد](qa/phase3-1/comparison-1440.jpg)

![الهاتف قبل وبعد](qa/phase3-1/comparison-390.jpg)

## مطابقة الزوايا

صور `after/matched-studio-{{0,12,24,66}}.png` و`after/matched-free-{{0,12,24,66}}.png` مأخوذة عند الزوايا نفسها والكاميرات الفعلية المحولة. الكاميرا وfit متطابقان حسابيًا ضمن فرق float32؛ اختلاف المظهر الضوئي ظاهر وصريح.

![Studio / 3⁄4](qa/phase3-1/after/matched-studio-0.png)

![Free 3D / 3⁄4](qa/phase3-1/after/matched-free-0.png)

فحص Front/Side/Back يبيّن silhouette كاملة وهندسة التاج/السوار الأصلية. خلف الساعة جزء من السوار يحجب الحركة في بعض الزوايا وفق النموذج الحقيقي؛ لم يُحذف هذا الجزء. لقطات Free العامة front/rear/detail موجودة في `qa/phase3-1/legacy/legacy-viewer`.

## التسجيل

[جلسة Studio الفعلية](qa/phase3-1/recording/studio-polish-session.webm): 33.24 ثانية، 1440×1000، WebM VP9/25fps. فيها دوران كامل بالماوس ومسار زوايا، presets، انتقالا الوضعين، تبديل سريع، macro، fullscreen ثم الرجوع للصفحة. `recording/timing.json` يحدد الأحداث، و`inspection-contact.jpg` يعرض 16 عينة من التسجيل. توجد جلسة 24 تبديلًا إضافية في `after-switches/validated-switches.webm`.

![عينات التسجيل الفعلي](qa/phase3-1/recording/inspection-contact.jpg)

لم يظهر الجزء المنفصل في المصادر أو العينات المسجلة. فحص فيديو 25fps لا يثبت غياب خلل أقصر من frame، لذا أُضيفت اختبارات تسليم الصور المتأخرة والطلبات الملغاة والتبديل السريع بدل الاكتفاء بالفيديو.

{limitation}
'''
performance=f'''# VYREN — Phase 3.1 / الأداء

## القياس المقارن

السكربت نفسه قبل/بعد: Edge {after['browser']} محلي، viewport 1440×1000 و390×844، DPR 1. القياس الأولي بعد navigation و3s انتظار. orbit في CDP محاكاة 4Mbps و120ms latency، مع application shell محفوظ في السياق نفسه. ليست قياسات WAN أو هاتف فعلي أو متوسطات متعددة.

{perf}

زيادة نقل initial resources: desktop {delta[0]:+d} bytes، mobile {delta[1]:+d} bytes. هذه كلفة JS لضبط fit وحجب hotspots وتسليم الانتقال؛ لم تُضف صور أو بيانات GLB إلى التحميل الأولي. اختلاف توقيت محلي منفرد لا يُثبت تحسنًا مستمرًا. original images وatlas bytes لم تتغير.

## الذاكرة والرسم

- الصور المقيمة: desktop حد 6 = 46,080,000 decoded bytes؛ mobile حد 5 = 13,824,000؛ Save-Data حد 2 دون atlas. الـatlas منفصل: 12,441,600 desktop و5,529,600 mobile bytes. هذه cache/atlas residency وليست كامل RAM/GPU، وقد توجد عمليتا decode قيد الإنجاز.
- عند DPR1 و1440px، backing canvas الخاص بـStudio من 1312×578 إلى 1312×683: زيادة مساحة 18.17%، ونحو 551,040 bytes إضافية لسطح RGBA حسابي واحد. عند DPR2 تتضاعف مساحة البكسلات ×4؛ لا قياس مباشر لذاكرة GPU هنا.
- GLB يبقى lazy بعد اختيار Free فقط؛ renderer والنموذج والشيدرز مستمرة بين الوضعين. 32 تبديلًا سريعًا لم تضف compileShader calls. لا shader recompile لكل انتقال.
- shadows تبقى cached، transmission scale يبقى 1.5 settled/1 moving/.5 low-power، وPMREM يبقى 512. حجم عرض أكبر يعني احتمال كلفة رسم أعلى؛ لا ادعاء أن الكلفة متساوية رغم البكسلات الإضافية.
- تنظيف navigation: {cleanup['created']} bitmap منشأ و{cleanup['closed']} مغلق في الفحص المراقب. test النتائج يتحقق أيضًا من حفظ حدود الكاش وعودة decode المتأخر.

## Free 3D الفعلي

WebGL renderer: `{free['webgl']['renderer']}`. Vendor: `{free['webgl']['vendor']}`. هذا وضع المتصفح المختبَر، وليس وعدًا باستخدام GPU الجهاز في كل تشغيل.

متوسط JavaScript حول `renderer.render()` بعد دورة presets دافئة: {free['warmed']['averageCpuRenderMs']:.3f}ms. هو CPU/submission ويشمل عمل Three.js؛ لا GPU timer ولا FPS مستنتج. activeFrames خلال انتظار idle 1s: {free['idle']['activeFrames']-free['warmed']['activeFrames']}; خلال 700ms خارج القسم: {free['offscreenEnd']['activeFrames']-free['offscreen']['activeFrames']}.

البيانات الكاملة: `qa/phase3-1/performance-before.json`، `performance-after.json`، `free-performance.json`. أرقام لقطات matched-cameras أُخذت تحت warmup وتشغيل اختبارات أخرى؛ لم تُستعمل كـbenchmark GPU.
'''
qaDoc=f'''# VYREN — Phase 3.1 / QA

## بيئة الاختبار

Windows، Edge {after['browser']} headless، نسخة Next.js production محلية على 127.0.0.1:3001. responsive widths 360/390/768/1280/1440/1920؛ المجموعة السابقة تشمل أيضًا 360×640 و844×390 وDPR2 وtouch emulation. لا اختبار Safari أو جهاز هاتف فعلي.

## نتائج فعلية

- `npm.cmd run typecheck`: ناجح.
- `npm.cmd run lint`: ناجح بلا تحذيرات مصدر.
- `npm.cmd run build`: ناجح. تشغيل Turbopack احتاج صلاحية العملية المحلية على Windows؛ لا نشر خارجي.
- `npx.cmd playwright test --config playwright.phase31.config.ts`: 59 حالة ({stats['expected']} ناجحة، {stats['unexpected']} إخفاق في التشغيل الكامل الأول). 50 من Phase 3 و9 جديدة للانتقالات.
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

{scope['protectedAssetsVerified']} أصل محمي مطابق SHA-256، Blender/GLB/public/exploded محفوظة. 14 ملفات source غير متعلقة بقيت مطابقة. لا duplicate Three canvases، ولا bitmap orphan في الاختبار، لا initial GLB. راجع `scope-verification.json` و`diffs` وcheckpoint.

## ملفات الإثبات

- `test-results/results.json` و`full-test-run.log`: التشغيل الكامل الأول بما فيه الإخفاق.
- `sequence-recheck.log` و`recheck-results`: النجاح 3/3 للحالة المعادة.
- `after` و`before`: screenshots الأبعاد الستة والزوايا.
- `reproduction` و`after-switches`: اختبار العودة المتكرر وdiagnostics.
- `recording/studio-polish-session.webm` و`timing.json` و`inspection-contact.jpg`: جلسة المتصفح الفعلية.
- `camera-matrix-validation.json` و`hotspot-rays.json` و`bitmap-cleanup.json`: فحوص المصدر والإسقاط والموارد.

{limitation}
'''
for name,content in [('PHASE3_1_STUDIO_POLISH_REPORT.md',report),('PHASE3_1_VISUAL_COMPARISON.md',visual),('PHASE3_1_PERFORMANCE.md',performance),('PHASE3_1_QA.md',qaDoc)]:
    content=content.replace('](qa/phase3-1/','](D:/VYREN/06_WEBSITE/qa/phase3-1/')
    for linked in ['PHASE3_1_QA.md','PHASE3_1_VISUAL_COMPARISON.md','PHASE3_1_PERFORMANCE.md']:
        content=content.replace(']('+linked+')','](D:/VYREN/06_WEBSITE/'+linked+')')
    (root/name).write_text(content,encoding='utf-8')
print({'reports':4,'firstFullRun':stats,'recheck':'3/3','initialBytesDelta':delta})
