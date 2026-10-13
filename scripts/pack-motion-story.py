"""Pack authentic read-only Cycles renders; never replace existing site assets."""
from pathlib import Path
from PIL import Image
import hashlib, json, argparse, time

p=argparse.ArgumentParser();p.add_argument('--watch',action='store_true');a=p.parse_args()
root=Path('D:/VYREN');src=root/'04_RENDER_OUTPUT/Motion_Story_v1/production';dst=root/'06_WEBSITE/public/assets/motion-story-v1'
for variant in ['desktop','mobile']:(dst/variant).mkdir(parents=True,exist_ok=True)
counts={'movement':48,'sapphire':18,'anthracite':18,'rubber':18}
def pack():
    done=0
    for kind,count in counts.items():
        for i in range(count):
            name=f'{kind}-{i:03}';source=src/f'{name}.png'
            if not source.exists():continue
            if all((dst/variant/f'{name}.webp').exists() for variant in ['desktop','mobile']) and (i!=0 or all((dst/f'{kind}-poster-{width}.webp').exists() for width in [800,1600])):
                done+=1;continue
            try:
                with Image.open(source) as image:
                    image.load()
                    for variant,width,quality in [('desktop',1440,85),('mobile',800,81)]:
                        target=dst/variant/f'{name}.webp'
                        if not target.exists():image.resize((width,round(width*image.height/image.width)),Image.Resampling.LANCZOS).save(target,'WEBP',quality=quality,method=6)
                    if i==0:
                        for width in [800,1600]:
                            target=dst/f'{kind}-poster-{width}.webp'
                            if not target.exists():image.resize((width,round(width*image.height/image.width)),Image.Resampling.LANCZOS).save(target,'WEBP',quality=85,method=6)
                    done+=1
            except (OSError,ValueError):pass # A render can still be writing its PNG.
    return done
while True:
    done=pack();print('STORY_PACKED',done,'/',sum(counts.values()),flush=True)
    if done==sum(counts.values()) or not a.watch:break
    time.sleep(15)
if done==sum(counts.values()):
    manifest={'renderSource':json.loads((src/'render.json').read_text()),'counts':counts,'webp':[{ 'file':str(f.relative_to(dst)).replace('\\','/'),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted(dst.rglob('*.webp'))]}
    (dst/'provenance.json').write_text(json.dumps(manifest,indent=2))
    print('STORY_BYTES',sum(f['bytes'] for f in manifest['webp']),flush=True)
