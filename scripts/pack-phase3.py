from pathlib import Path
from PIL import Image
import json, argparse, shutil
p=argparse.ArgumentParser();p.add_argument('--studio',action='store_true');p.add_argument('--signatures',action='store_true');a=p.parse_args()
root=Path('D:/VYREN');source=root/'04_RENDER_OUTPUT/Phase3_Studio';public=root/'06_WEBSITE/public/assets';stats={}
def pack_sequence(folder,images,names,crop_mobile):
    out=public/folder
    for variant in ['desktop','mobile']:(out/variant).mkdir(parents=True,exist_ok=True)
    sizes={'desktop':0,'mobile':0}; records=[]
    for path,name in zip(images,names):
        im=Image.open(path).convert('RGBA');desktop=out/'desktop'/f'{name}.webp'
        if not desktop.exists():im.save(desktop,'WEBP',quality=92,method=4)
        mobile=im.crop(crop_mobile) if crop_mobile else im
        mobile.thumbnail((720,960) if crop_mobile else (900,675),Image.Resampling.LANCZOS)
        dest=out/'mobile'/f'{name}.webp'
        if not dest.exists():mobile.save(dest,'WEBP',quality=91,method=4)
        sizes['desktop']+=desktop.stat().st_size;sizes['mobile']+=dest.stat().st_size
        records.append({'name':name,'desktopBytes':desktop.stat().st_size,'mobileBytes':dest.stat().st_size})
    return {'sizes':sizes,'desktopResolution':[1600,1200],'mobileResolution':list(mobile.size),'mobileCrop':crop_mobile,'frames':records}
if a.studio:
    imgs=[source/'production'/f'{i:03}.png' for i in range(72)];assert all(p.exists() for p in imgs)
    bounds=[Image.open(p).getbbox() for p in imgs];left=min(b[0] for b in bounds);right=max(b[2] for b in bounds)
    width=max(900,right-left+64);width=min(1600,width);center=(left+right)/2
    crop=(max(0,int(center-width/2)),0,min(1600,int(center+width/2)),1200)
    stats['studio']=pack_sequence('studio-cycles',imgs,[f'{i:03}' for i in range(72)],crop)
    out=public/'studio-cycles'
    # Compact genuine Cycles contact atlas supplies immediate angles during an
    # uncached drag; high resolution current/neighbour frames refine it afterward.
    for variant,cell in [('desktop',(240,180)),('mobile',(120,160))]:
        atlas=Image.new('RGBA',(cell[0]*8,cell[1]*9))
        for i,path in enumerate(imgs):
            im=Image.open(path).convert('RGBA');im=im.crop(crop) if variant=='mobile' else im
            im.thumbnail(cell,Image.Resampling.LANCZOS);tile=Image.new('RGBA',cell);tile.paste(im,((cell[0]-im.width)//2,(cell[1]-im.height)//2));atlas.paste(tile,((i%8)*cell[0],(i//8)*cell[1]))
        atlas.save(out/f'atlas-{variant}.webp','WEBP',quality=85,method=4)
        stats['studio'][f'{variant}Atlas']={'bytes':(out/f'atlas-{variant}.webp').stat().st_size,'decodedBytes':atlas.width*atlas.height*4,'cell':cell}
    shutil.copy2(out/'desktop/000.webp',out/'poster-desktop.webp');shutil.copy2(out/'mobile/000.webp',out/'poster-mobile.webp')
    provenance=json.loads((source/'production/render.json').read_text());provenance['delivery']=stats['studio'];(out/'manifest.json').write_text(json.dumps(provenance,indent=2))
if a.signatures:
    for prefix,count in [('hero',4),('light',9),('final',12)]:
        imgs=[source/'signatures'/f'{prefix}-{i:02}.png' for i in range(count)]
        stats[prefix]=pack_sequence('phase3-signatures',imgs,[f'{prefix}-{i:03}' for i in range(count)],None)
    out=public/'phase3-signatures'
    for name in ['micro-balance','micro-spring','micro-bridge','dial-detail','strap-detail']:
        im=Image.open(source/'signatures'/f'{name}.png').convert('RGBA')
        for width in [800,1600]:
            copy=im.copy();copy.thumbnail((width,width),Image.Resampling.LANCZOS);copy.save(out/f'{name}-{width}.webp','WEBP',quality=94,method=4)
    shutil.copy2(out/'desktop/final-011.webp',out/'final-poster.webp')
    (out/'manifest.json').write_text(json.dumps({'source':str(source/'signatures/render.json'),'delivery':stats},indent=2))
    stats['macroBytes']=sum(p.stat().st_size for p in out.glob('*-*.webp'))
report=root/'06_WEBSITE/qa/phase3/media-sizes.json';existing=json.loads(report.read_text()) if report.exists() else {};existing.update(stats);report.write_text(json.dumps(existing,indent=2));print(json.dumps(stats,indent=2))
