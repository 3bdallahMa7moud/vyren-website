"""Build Phase 2 evidence from actual browser captures; originals are read-only."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageStat
import json, hashlib, subprocess, html

site=Path(__file__).resolve().parents[1]
qa=site/'qa/phase2-cinematic'
out=qa/'comparisons';out.mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',17)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',13)
names=['02-hero-revealed','03-typography','04-case','05-movement','08-assembly-full','10-materials','11-viewer-front','14-details','15-finale']
sheet=Image.new('RGB',(1500,1280),'#080a0d');d=ImageDraw.Draw(sheet)
for i,name in enumerate(names):
    im=Image.open(qa/'after'/f'{name}.png').convert('RGB');im.thumbnail((484,336))
    x=12+i%3*496;y=12+i//3*425;sheet.paste(im,(x,y));d.text((x,y+350),name,fill='#f1eee8',font=small)
sheet.save(qa/'after-contact.jpg',quality=94)
pair_names=names+['16-mobile-hero','17-mobile-assembly','18-mobile-viewer']
contact=Image.new('RGB',(1440,len(pair_names)*310),'#080a0d');d=ImageDraw.Draw(contact)
for i,name in enumerate(pair_names):
    pair=Image.new('RGB',(1440,560 if 'mobile' not in name else 860),'#080a0d');pd=ImageDraw.Draw(pair)
    for j,mode in enumerate(['baseline','after']):
        im=Image.open(qa/mode/f'{name}.png').convert('RGB');im.thumbnail((708,pair.height-48))
        pair.paste(im,(j*720+(708-im.width)//2,42));pd.text((j*720+12,12),f'{mode.upper()} / {name}',fill='white',font=font)
    pair.save(out/f'{name}.jpg',quality=93)
    thumb=pair.copy();thumb.thumbnail((1420,292));contact.paste(thumb,((1440-thumb.width)//2,i*310))
contact.save(qa/'before-after-contact.jpg',quality=93)

fidelity=[]
for name in ['hero','front','rear','movement','strap','crown']:
    ref=Image.open(site.parent/f'04_RENDER_OUTPUT/Comparison_Final/Controlled/after/{name}.png').convert('RGB')
    before=Image.open(site/f'qa/screenshots/fidelity-{name}.png').convert('RGB').resize(ref.size)
    after=Image.open(qa/f'regression/screenshots/fidelity-{name}.png').convert('RGB').resize(ref.size)
    mae=lambda im:round(sum(ImageStat.Stat(ImageChops.difference(ref,im)).mean)/3,3)
    fidelity.append({'view':name,'beforeRgbDifference':mae(before),'afterRgbDifference':mae(after),'meaning':'Composition-matched whole-image RGB difference including background, not realism or percentage fidelity.'})
    target_w=450;target_h=round(ref.height*target_w/ref.width)
    triptych=Image.new('RGB',(1380,target_h+60),'#080a0d');td=ImageDraw.Draw(triptych)
    for j,(label,im) in enumerate([('CYCLES',ref),('BEFORE WEBGL',before),('AFTER WEBGL',after)]):
        td.text((j*460+10,12),label,fill='white',font=font);triptych.paste(im.resize((target_w,target_h)),(j*460+5,48))
    triptych.save(out/f'fidelity-{name}.jpg',quality=94)
(qa/'fidelity-metrics.json').write_text(json.dumps(fidelity,indent=2))

manifest=json.loads((site/'qa/asset-manifest.json').read_text())
protected=[]
for item in manifest['sources']:
    p=Path(item['path']);digest=hashlib.sha256(p.read_bytes()).hexdigest();protected.append({'path':str(p),'unchanged':digest==item['sha256'],'sha256':digest})
assert all(i['unchanged'] for i in protected),'Protected source changed'
copied=hashlib.sha256((site/'public/assets/vyren-noctis-01.glb').read_bytes()).hexdigest()
original=hashlib.sha256((site.parent/'05_WEB_EXPORT/GLB/vyren_noctis_01.glb').read_bytes()).hexdigest()
assert copied==original
(qa/'source-preservation.json').write_text(json.dumps({'protected':protected,'copiedGlbIdentical':True},indent=2))
checkpoint=Path((site/'qa/phase2-checkpoint.txt').read_text().strip())
backup_manifest=json.loads((checkpoint/'verified-manifest.json').read_text(encoding='utf-8-sig'))
changes=[]
for item in backup_manifest:
    bp=checkpoint/'06_WEBSITE'/item['path'];assert hashlib.sha256(bp.read_bytes()).hexdigest().upper()==item['sha256']
    current=site/item['path']
    if current.exists() and hashlib.sha256(current.read_bytes()).hexdigest().upper()!=item['sha256']:changes.append(item['path'])
(qa/'rollback-verification.json').write_text(json.dumps({'checkpoint':str(checkpoint),'verifiedBackupFiles':len(backup_manifest),'changedExistingFiles':changes},indent=2))

ffmpeg=qa/'runtime/ffmpeg-1013/ffmpeg-win64.exe'
capture=json.loads((qa/'after/capture.json').read_text())
samples=capture['motionSamples']
motion_start=samples[0]['elapsedMs']/1000
motion_end=samples[-1]['elapsedMs']/1000
frames=qa/'motion-review';frames.mkdir(exist_ok=True)
for stale in frames.glob('sample-*.png'):stale.unlink()
subprocess.run([str(ffmpeg),'-v','error','-y','-i',str(qa/'after/scroll-through.webm'),'-r','5','-vf','scale=288:200','-c:v','png',str(frames/'sample-%04d.png')],check=True)
count=0;previous=None;metrics=[];uniform=[];first_product_frame=None
for frame in sorted(frames.glob('sample-*.png')):
    time=count/5;im=Image.open(frame).convert('RGB').crop((0,20,288,200));gray=im.convert('L');st=ImageStat.Stat(gray)
    diff=0 if previous is None else sum(ImageStat.Stat(ImageChops.difference(previous,im)).mean)/3
    if first_product_frame is None and st.mean[0]<100 and st.stddev[0]>3:first_product_frame=time
    if motion_start<=time<=motion_end:
        metrics.append({'seconds':round(time,1),'luma':round(st.mean[0],2),'contrastStdDev':round(st.stddev[0],2),'deltaRgb':round(diff,2)})
        if st.stddev[0]<1.7:uniform.append(round(time,1))
    previous=im;count+=1
film=Image.new('RGB',(1470,9*360),'#080a0d');fd=ImageDraw.Draw(film)
for i in range(9):
    begin=samples[i*2]['elapsedMs']/1000;end=samples[i*2+1]['elapsedMs']/1000
    for j,fraction in enumerate([.25,.5,.8]):
        time=begin+(end-begin)*fraction;destination=frames/f'{i+1:02}-{j}.png'
        subprocess.run([str(ffmpeg),'-v','error','-y','-ss',str(time),'-i',str(qa/'after/scroll-through.webm'),'-frames:v','1','-vf','scale=480:-1','-c:v','png',str(destination)],check=True)
        im=Image.open(destination);film.paste(im,(j*490+5,i*360+35));fd.text((j*490+10,i*360+10),f"{samples[i*2]['id']} / {time:.1f}s",fill='white',font=small)
film.save(qa/'motion-filmstrip.jpg',quality=93)
opening=Image.new('RGB',(1500,360),'#080a0d');od=ImageDraw.Draw(opening)
for i,offset in enumerate([0,.2,.4,.8,1.2]):
    time=(first_product_frame or 0)+offset
    destination=frames/f'hero-{i}.png'
    subprocess.run([str(ffmpeg),'-v','error','-y','-ss',str(time),'-i',str(qa/'after/scroll-through.webm'),'-frames:v','1','-vf','scale=296:-1','-c:v','png',str(destination)],check=True)
    opening.paste(Image.open(destination),(i*300,40));od.text((i*300+8,8),f'Actual Hero recording / {time:.1f}s',fill='white',font=small)
opening.save(qa/'hero-motion-review.jpg',quality=94)
subprocess.run([str(ffmpeg),'-v','error','-y','-ss',str(motion_start),'-i',str(qa/'after/scroll-through.webm'),'-t',str(motion_end-motion_start),'-c','copy',str(qa/'after/continuous-scroll.webm')],check=True)
motion={'video':'after/scroll-through.webm','recordedFramesAt5fps':count,'firstProductFrameSeconds':first_product_frame,'reviewedContinuousRangeSeconds':[motion_start,motion_end],'nearUniformSamples':uniform,'samples':metrics,'method':'Decoded actual video at 5 fps; sequential quarter/middle/late frames inspected per scene. Hero filmstrip starts at the first sampled product frame; the full recording retains the white browser page before navigation. Not a live-frame-time or stutter benchmark. Earlier baseline recording uses 100px stepped scroll with section jumps; do not compare video smoothness quantitatively.'}
(qa/'motion-review.json').write_text(json.dumps(motion,indent=2))

figures=''.join(f'<figure><figcaption>{html.escape(n)}</figcaption><img loading="lazy" src="comparisons/{n}.jpg" alt="Matched before and after {n}"></figure>' for n in pair_names)
fidelity_figs=''.join(f'<figure><figcaption>{n}: Cycles / before / after</figcaption><img loading="lazy" src="comparisons/fidelity-{n}.jpg" alt="Real material comparison {n}"></figure>' for n in ['hero','front','rear','movement','strap','crown'])
all_capture_names=[c['name'] for c in capture['captures']]+['16-mobile-hero','17-mobile-assembly','18-mobile-viewer']
capture_figs=''.join(f'<figure><figcaption>{html.escape(n)}</figcaption><a href="after/{n}.png"><img loading="lazy" src="after/{n}.png" alt="Actual final browser capture {n}"></a></figure>' for n in all_capture_names)
gallery=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>VYREN / Phase 2 Evidence</title><style>body{{background:#080a0d;color:#f1eee8;font:14px system-ui;margin:0 auto;max-width:1440px;padding:32px}}h1{{font:52px Georgia;letter-spacing:-2px}}p{{max-width:950px;line-height:1.8;color:#a8adb4}}figure{{margin:35px 0;border-top:1px solid #333;padding-top:18px}}figcaption{{margin-bottom:12px;color:#b49a7a}}img,video{{width:100%;height:auto}}a{{color:#d2b490}}nav{{display:flex;gap:24px;flex-wrap:wrap;position:sticky;top:0;background:#080a0ded;padding:18px 0}}button{{font:inherit;padding:10px 20px;background:#f1eee8;color:#080a0d;border:0;cursor:pointer}}</style><h1>VYREN / The cinematic refinement</h1><p>Actual production Edge captures. DPR 1, 1440 × 1000; mobile 390 × 844. Matched normalized scene progress. Camera framing, section heights, exposure and studio lighting intentionally changed. Browser emulation is not physical-phone testing.</p><nav><a href="#motion">Motion</a><a href="#comparisons">Before / after</a><a href="#fidelity">Cycles comparison</a><a href="../../docs/PHASE2_CINEMATIC_REPORT.md">Report</a></nav><section id="motion"><h2>Actual browser motion</h2><p>The full recording includes capture setup, then a continuous requestAnimationFrame scroll. The player starts at the continuous pass. No frame-sequence slideshow is presented as video.</p><video controls preload="metadata" src="after/scroll-through.webm#t={motion_start:.2f},{motion_end:.2f}"></video><p><a href="after/scroll-through.webm">Full desktop recording</a> · <a href="after/mobile-motion.webm">Mobile emulation recording</a> · <a href="baseline/scroll-through.webm">Earlier baseline recording</a></p><img loading="lazy" src="motion-filmstrip.jpg" alt="Sequential frames extracted from the actual motion recording"></section><section id="comparisons"><h2>Controlled scene comparisons</h2>{figures}</section><section id="fidelity"><h2>Same reference camera and model</h2><p>Original physical glass, PBR maps and geometry are retained. Light and normal calibration changed. These comparisons are not a percentage realism score. WebGL still differs in indirect shading and solid-glass refraction.</p>{fidelity_figs}</section></html>'''
gallery=gallery.replace('<a href="#fidelity">Cycles comparison</a>','<a href="#fidelity">Cycles comparison</a><a href="#captures">All final captures</a>')
gallery=gallery.replace('</html>',f'<section id="captures"><h2>All 18 final captures</h2><p>Includes initial Hero, three assembly stages, exact restoration, front/rear/detail viewer and three mobile captures. Select an image for its full-resolution source.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">{capture_figs}</div></section></html>')
(qa/'gallery.html').write_text(gallery,encoding='utf-8')
summary={'scenePairs':len(pair_names),'fidelityPairs':len(fidelity),'protectedSourceFiles':len(protected),'backupFilesVerified':len(backup_manifest),'uniformVideoSamples':uniform,'changedExistingFiles':changes}
(qa/'evidence-summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary))
