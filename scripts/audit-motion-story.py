from pathlib import Path
from PIL import Image
import hashlib, json
root=Path('D:/VYREN');web=root/'06_WEBSITE';asset=web/'public/assets/motion-story-v1';out=web/'qa/motion-story';out.mkdir(parents=True,exist_ok=True)
protected=json.loads((root/'08_BACKUPS/WEBSITE_MOTION_STORY_ENTRY_20261011/protected-assets.json').read_text())
changed=[name for name,digest in protected.items() if not (root/name).exists() or hashlib.sha256((root/name).read_bytes()).hexdigest()!=digest]
assert not changed,changed
manifest=json.loads((asset/'provenance.json').read_text());renders=manifest['renderSource']['renders']
assert manifest['renderSource']['sourceSha256']==protected['02_BLENDER/Projects/VYREN_NOCTIS_01_MASTER.blend']
assert manifest['renderSource']['savedBlend'] is False
assert len(renders)==102
assert len(manifest['webp'])==212
frames=[]
for kind,count in manifest['counts'].items():
    hashes=[]
    for variant,width in [('desktop',1440),('mobile',800)]:
        for i in range(count):
            f=asset/variant/f'{kind}-{i:03}.webp'
            with Image.open(f) as image:
                assert image.size==(width,width*3//4),(f,image.size)
                assert image.mode in ['RGB','RGBA'],(f,image.mode)
                image.load()
            hashes.append(hashlib.sha256(f.read_bytes()).hexdigest())
    assert len(set(hashes))==count*2
    frames.append({'kind':kind,'framesPerVariant':count,'allUnique':True})
angles=[r['balanceDegrees'] for r in renders if r['kind']=='movement']
assert min(angles)<-60 and max(angles)>60
report={'protectedFiles':len(protected),'protectedFilesChanged':changed,'originalBlendAndGlbUnchanged':True,'cycles':{k:manifest['renderSource'][k] for k in ['engine','backend','blender','samples','resolution']},'frames':frames,'totalWebpBytes':sum(f['bytes'] for f in manifest['webp']),'webpFiles':len(manifest['webp']),'passed':True}
(out/'asset-audit.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
