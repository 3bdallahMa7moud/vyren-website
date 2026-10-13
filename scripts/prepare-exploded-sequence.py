"""Optimize real Cycles RGBA frames and metadata; never changes Blender originals."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageChops,ImageStat
import json,hashlib,argparse
site=Path(__file__).resolve().parents[1];root=site.parent;qa=site/'qa/exploded-cycles'
parser=argparse.ArgumentParser();parser.add_argument('--mode',choices=['preview','production'],default='production');parser.add_argument('--posters-only',action='store_true');parser.add_argument('--partial-assets',action='store_true');args=parser.parse_args()
source=root/'04_RENDER_OUTPUT/Exploded_Scroll'/args.mode;metadata=json.loads((source/'sequence.json').read_text())
variants={'desktop':{'width':1600,'height':1200,'crop':[0,0,1600,1200],'limit':12},'mobile':{'width':600,'height':800,'crop':[350,0,1250,1200],'limit':10}}
if args.posters_only:
    assets=site/'public/assets/exploded-cycles';assets.mkdir(parents=True,exist_ok=True)
    first=Image.open(source/'000.png').convert('RGBA')
    for name,spec in variants.items():first.crop(spec['crop']).resize((spec['width'],spec['height']),Image.Resampling.LANCZOS).save(assets/f'poster-{name}.webp','WEBP',quality=90,method=4,exact=True)
    print('Prepared authentic final Cycles posters');raise SystemExit
if args.partial_assets:
    assets=site/'public/assets/exploded-cycles';assets.mkdir(parents=True,exist_ok=True);created=0
    for f in metadata['renders']:
        im=Image.open(source/f'{f["frame"]:03}.png').convert('RGBA')
        for name,spec in variants.items():
            folder=assets/name;folder.mkdir(exist_ok=True)
            delivery=im.crop(spec['crop']).resize((spec['width'],spec['height']),Image.Resampling.LANCZOS)
            file=folder/(hashlib.sha256(delivery.tobytes()).hexdigest()[:16]+'.webp')
            if not file.exists():delivery.save(file,'WEBP',quality=90,method=4,exact=True);created+=1
    print(json.dumps({'availableSourceFrames':len(metadata['renders']),'newCompressedAssets':created,'manifestPublished':False}));raise SystemExit
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',17)
selected=[round(p*(len(metadata['frames'])-1)) for p in [0,.1,.2,.32,.45,.57,.65,.72,.8,.88,.95,1]]
sheet=Image.new('RGB',(1600,1280),'#14191e');draw=ImageDraw.Draw(sheet)
for j,index in enumerate(selected):
    im=Image.open(source/f'{index:03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#14191e');bg.alpha_composite(im);bg=bg.convert('RGB');bg.thumbnail((390,292));x=j%4*400;y=j//4*425;sheet.paste(bg,(x,y+35));draw.text((x+10,y+8),f'{metadata["frames"][index]["progress"]:.0%} / {index:03}',font=font,fill='white')
sheet.save(qa/f'{args.mode}-storyboard.jpg',quality=95)
ref=Image.open(site/'public/assets/hero-1600.webp').convert('RGBA');first=Image.open(source/'000.png').convert('RGBA');ref=ref.resize(first.size,Image.Resampling.LANCZOS)
pair=Image.new('RGB',(1600,660),'#14191e');pd=ImageDraw.Draw(pair)
for j,(label,im) in enumerate([('EXISTING HERO REFERENCE',ref),('NEW CYCLES FIRST FRAME',first)]):
    bg=Image.new('RGBA',im.size,'#14191e');bg.alpha_composite(im);bg=bg.convert('RGB');bg.thumbnail((790,600));pair.paste(bg,(j*800,40));pd.text((j*800+15,10),label,font=font,fill='white')
pair.save(qa/f'{args.mode}-hero-match.jpg',quality=95)
comparison={'dimensions':first.size,'rgbaMeanAbsoluteDifference':ImageStat.Stat(ImageChops.difference(ref,first)).mean,'camera':'CAM_HERO 66mm, original orientation and assembled geometry','color':metadata['colorManagement'],'pixelIdentityClaimed':False,'referenceSamples':160,'newSamples':metadata['samples'],'referenceAlphaBounds':ref.getchannel('A').getbbox(),'newAlphaBounds':first.getchannel('A').getbbox()}
comparison['referenceWebpSha256']=hashlib.sha256((site/'public/assets/hero-1600.webp').read_bytes()).hexdigest()
comparison['referenceSourcePng']=str(root/'04_RENDER_OUTPUT/Hero/vyren_hero_transparent.png')
comparison['referenceSourcePngSha256']=hashlib.sha256(Path(comparison['referenceSourcePng']).read_bytes()).hexdigest()
comparison['masterSha256']=metadata['sourceSha256']
ref_bg=Image.new('RGBA',ref.size,'#14191e');ref_bg.alpha_composite(ref)
first_bg=Image.new('RGBA',first.size,'#14191e');first_bg.alpha_composite(first)
mask=ref.getchannel('A').point(lambda a:255 if a>16 else 0)
comparison['compositedMeanRgbDifference']=ImageStat.Stat(ImageChops.difference(ref_bg.convert('RGB'),first_bg.convert('RGB'))).mean
comparison['referenceProductMaskedMeanRgbDifference']=ImageStat.Stat(ImageChops.difference(ref_bg.convert('RGB'),first_bg.convert('RGB')),mask).mean
(qa/f'{args.mode}-hero-comparison.json').write_text(json.dumps(comparison,indent=2))
if args.mode=='preview':
    frames=[]
    for f in metadata['frames']:
        im=Image.open(source/f'{f["frame"]:03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#14191e');bg.alpha_composite(im);frames.append(bg.convert('RGB'))
    frames[0].save(qa/'preview-animation.webp',save_all=True,append_images=frames[1:],duration=80,loop=0,quality=82,method=4)
    (qa/'preview-review.json').write_text(json.dumps({'renderFrames':len(frames),'samples':metadata['samples'],'resolution':metadata['resolution'],'restoredMatrixDelta':metadata['frames'][-1]['restMatrixDelta'],'status':'Awaiting visual review of storyboard and animation'},indent=2))
    print(json.dumps({'previewFrames':len(frames),'heroComparison':comparison}));raise SystemExit

assets=site/'public/assets/exploded-cycles';assets.mkdir(parents=True,exist_ok=True)
previous=None;review=[]
for f in metadata['frames']:
    im=Image.open(source/f'{f["frame"]:03}.png').convert('RGBA');bounds=im.getchannel('A').getbbox()
    review.append({'frame':f['frame'],'alphaBounds':bounds,'meanRgbaChange':ImageStat.Stat(ImageChops.difference(im,previous)).mean if previous is not None else [0,0,0,0]})
    previous=im
endpoint_same=first.tobytes()==previous.tobytes()
(qa/'production-frame-review.json').write_text(json.dumps({'frames':review,'endpointPixelsIdentical':endpoint_same,'endpointRgbaMeanDifference':ImageStat.Stat(ImageChops.difference(first,previous)).mean,'endpointAlphaBoundsEqual':first.getchannel('A').getbbox()==previous.getchannel('A').getbbox(),'endpointCameraMatrixDelta':max(abs(a-b) for ar,br in zip(metadata['frames'][0]['cameraMatrix'],metadata['frames'][-1]['cameraMatrix']) for a,b in zip(ar,br)),'allAlphaBoundsInsideSource':all(r['alphaBounds'][0]>0 and r['alphaBounds'][1]>0 and r['alphaBounds'][2]<1600 and r['alphaBounds'][3]<1200 for r in review),'restoredMatrixDelta':metadata['frames'][-1]['restMatrixDelta'],'renderSeconds':sum(r['seconds'] for r in metadata['renders']),'uniqueRenderedFrames':sum(r['status']=='rendered' for r in metadata['renders']),'status':'Metrics complete; inspect production storyboard, browser screenshots and motion evidence'},indent=2))
for start in range(0,len(metadata['frames']),49):
    filmstrip=Image.new('RGB',(2240,1890),'#14191e');fd=ImageDraw.Draw(filmstrip)
    for j,f in enumerate(metadata['frames'][start:start+49]):
        im=Image.open(source/f'{f["frame"]:03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#14191e');bg.alpha_composite(im);bg=bg.convert('RGB');bg.thumbnail((316,237));x=j%7*320;y=j//7*270;filmstrip.paste(bg,(x,y+28));fd.text((x+8,y+4),f'{f["frame"]:03} / {f["progress"]:.1%}',font=font,fill='white')
    filmstrip.save(qa/f'production-motion-{start:03}.jpg',quality=94)
manifest={'version':1,'frameCount':len(metadata['frames']),'source':metadata['source'],'render':{k:metadata[k] for k in ['blender','samples','backend','colorManagement','resolution','transparent']},'delivery':{'format':'RGBA WebP','quality':90,'method':4,'exactAlpha':True},'variants':{},'frames':metadata['frames']}
for name,spec in variants.items():
    folder=assets/name;folder.mkdir(exist_ok=True);files={};urls=[];total=0;bounds=[]
    for f in metadata['frames']:
        im=Image.open(source/f'{f["frame"]:03}.png').convert('RGBA');box=im.getchannel('A').getbbox();bounds.append(box)
        assert box[0]>=spec['crop'][0] and box[2]<=spec['crop'][2] and box[1]>0 and box[3]<im.height,'Product would be cropped'
        im=im.crop(spec['crop']).resize((spec['width'],spec['height']),Image.Resampling.LANCZOS)
        digest=hashlib.sha256(im.tobytes()).hexdigest()[:16]
        file=folder/f'{digest}.webp'
        if digest not in files:
            if not file.exists():im.save(file,'WEBP',quality=90,method=4,exact=True)
            files[digest]={'bytes':file.stat().st_size,'frame':f['frame']};total+=file.stat().st_size
        urls.append(f'/assets/exploded-cycles/{name}/{digest}.webp')
    poster=assets/f'poster-{name}.webp';poster.write_bytes((folder/Path(urls[0]).name).read_bytes())
    manifest['variants'][name]={**spec,'urls':urls,'poster':f'/assets/exploded-cycles/poster-{name}.webp','uniqueFrames':len(files),'totalBytes':total,'files':files}
    # Compare true RGBA edge compositing against an opaque same-background alternative.
    edge=Image.open(source/'000.png').convert('RGBA').crop(spec['crop']).resize((spec['width'],spec['height']),Image.Resampling.LANCZOS)
    bg=Image.new('RGBA',edge.size,'#14191e');bg.alpha_composite(edge);opaque=qa/f'opaque-evaluation-{name}.webp';bg.convert('RGB').save(opaque,quality=90,method=4)
    spec['opaquePosterBytes']=opaque.stat().st_size;spec['transparentPosterBytes']=poster.stat().st_size
    transparent=Image.open(poster).convert('RGBA');transparent_bg=Image.new('RGBA',edge.size,'#14191e');transparent_bg.alpha_composite(transparent)
    encoded_opaque=Image.open(opaque).convert('RGB');edge_mask=edge.getchannel('A').point(lambda a:255 if 0<a<255 else 0)
    spec['alphaRetainedExactly']=ImageChops.difference(edge.getchannel('A'),transparent.getchannel('A')).getbbox() is None
    spec['transparentEdgeMeanRgbError']=ImageStat.Stat(ImageChops.difference(bg.convert('RGB'),transparent_bg.convert('RGB')),edge_mask).mean
    spec['opaqueEdgeMeanRgbError']=ImageStat.Stat(ImageChops.difference(bg.convert('RGB'),encoded_opaque),edge_mask).mean
    spec['opaqueCornerRgb']=encoded_opaque.getpixel((0,0));spec['siteBackgroundRgb']=[20,25,30]
    zoom=Image.new('RGB',(1500,440),'#14191e');zd=ImageDraw.Draw(zoom)
    crop=tuple(round(v) for v in [edge.width*.3,edge.height*.14,edge.width*.72,edge.height*.46])
    for j,(label,im) in enumerate([('SOURCE RGBA / CSS BACKGROUND',bg),('TRANSPARENT WEBP / CSS BACKGROUND',transparent_bg),('OPAQUE SAME-BACKGROUND WEBP',encoded_opaque)]):
        tile=im.crop(crop).convert('RGB');tile.thumbnail((495,395));zoom.paste(tile,(j*500,40));zd.text((j*500+6,10),label,font=font,fill='white')
    zoom.save(qa/f'edge-comparison-{name}.jpg',quality=98)
manifest['compositingEvaluation']={'choice':'Transparent RGBA WebP, exact CSS #14191e underneath','reason':'No rectangular background boundary; preserve source antialiasing and physical transmission','variants':variants}
(assets/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
(qa/'asset-report.json').write_text(json.dumps({'frameCount':manifest['frameCount'],'variants':{k:{p:v[p] for p in ['width','height','uniqueFrames','totalBytes','limit']} for k,v in manifest['variants'].items()},'compositing':manifest['compositingEvaluation'],'archivalBytes':sum(p.stat().st_size for p in source.glob('*.png'))},indent=2))
print(json.dumps({'frameCount':manifest['frameCount'],'variants':{k:(v['uniqueFrames'],v['totalBytes']) for k,v in manifest['variants'].items()},'heroComparison':comparison}))
