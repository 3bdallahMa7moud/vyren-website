# VYREN — Phase 3.1 / الأداء

## القياس المقارن

السكربت نفسه قبل/بعد: Edge 155.0.4283.45 محلي، viewport 1440×1000 و390×844، DPR 1. القياس الأولي بعد navigation و3s انتظار. orbit في CDP محاكاة 4Mbps و120ms latency، مع application shell محفوظ في السياق نفسه. ليست قياسات WAN أو هاتف فعلي أو متوسطات متعددة.

| القياس | الكمبيوتر قبل / بعد | الهاتف قبل / بعد |
|---|---|---|
| نقل الموارد الأولية، bytes، دون HTML | 610771 / 611599 | 488307 / 489135 |
| أول إطار orbit، ms | 1815 / 1859 | 1448 / 1480 |
| أول إطار كامل الدقة، ms | 1817 / 1865 | 1450 / 1493 |
| LCP محلي، ms | 152 / 172 | 100 / 128 |
| CLS محلي | 0 / 0 | 0 / 0 |
| أعلى عدد صور في الكاش | 6 / 6 | 5 / 5 |
| ذاكرة الكاش المفكوكة، bytes | 46080000 / 46080000 | 13824000 / 13824000 |
| متوسط drawImage/clear، ms | 0.051 / 0.0979 | 0.0653 / 0.091 |
| طلبات إطارات failed في جولة القياس | 0 / 0 | 1 / 1 |


زيادة نقل initial resources: desktop +828 bytes، mobile +828 bytes. هذه كلفة JS لضبط fit وحجب hotspots وتسليم الانتقال؛ لم تُضف صور أو بيانات GLB إلى التحميل الأولي. اختلاف توقيت محلي منفرد لا يُثبت تحسنًا مستمرًا. original images وatlas bytes لم تتغير.

## الذاكرة والرسم

- الصور المقيمة: desktop حد 6 = 46,080,000 decoded bytes؛ mobile حد 5 = 13,824,000؛ Save-Data حد 2 دون atlas. الـatlas منفصل: 12,441,600 desktop و5,529,600 mobile bytes. هذه cache/atlas residency وليست كامل RAM/GPU، وقد توجد عمليتا decode قيد الإنجاز.
- عند DPR1 و1440px، backing canvas الخاص بـStudio من 1312×578 إلى 1312×683: زيادة مساحة 18.17%، ونحو 551,040 bytes إضافية لسطح RGBA حسابي واحد. عند DPR2 تتضاعف مساحة البكسلات ×4؛ لا قياس مباشر لذاكرة GPU هنا.
- GLB يبقى lazy بعد اختيار Free فقط؛ renderer والنموذج والشيدرز مستمرة بين الوضعين. 32 تبديلًا سريعًا لم تضف compileShader calls. لا shader recompile لكل انتقال.
- shadows تبقى cached، transmission scale يبقى 1.5 settled/1 moving/.5 low-power، وPMREM يبقى 512. حجم عرض أكبر يعني احتمال كلفة رسم أعلى؛ لا ادعاء أن الكلفة متساوية رغم البكسلات الإضافية.
- تنظيف navigation: 30 bitmap منشأ و30 مغلق في الفحص المراقب. test النتائج يتحقق أيضًا من حفظ حدود الكاش وعودة decode المتأخر.

## Free 3D الفعلي

WebGL renderer: `ANGLE (Intel, Intel(R) UHD Graphics (0x0000A78B) Direct3D11 vs_5_0 ps_5_0, D3D11)`. Vendor: `Google Inc. (Intel)`. هذا وضع المتصفح المختبَر، وليس وعدًا باستخدام GPU الجهاز في كل تشغيل.

متوسط JavaScript حول `renderer.render()` بعد دورة presets دافئة: 4.890ms. هو CPU/submission ويشمل عمل Three.js؛ لا GPU timer ولا FPS مستنتج. activeFrames خلال انتظار idle 1s: 0; خلال 700ms خارج القسم: 0.

البيانات الكاملة: `qa/phase3-1/performance-before.json`، `performance-after.json`، `free-performance.json`. أرقام لقطات matched-cameras أُخذت تحت warmup وتشغيل اختبارات أخرى؛ لم تُستعمل كـbenchmark GPU.
