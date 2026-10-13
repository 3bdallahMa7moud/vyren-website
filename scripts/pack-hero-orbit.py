from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json, hashlib
site=Path(__file__).resolve().parents[1];root=site/'qa/phase2-cinematic/hero-frames'
frames=[Image.open(root/f'{i:03}.png').convert('RGBA') for i in range(30)]
destination=site/'public/assets/hero-orbit.webp'
frames[0].save(destination,save_all=True,append_images=frames[1:],duration=40,loop=1,quality=84,method=4,allow_mixed=False,minimize_size=False)
data=json.loads((root/'render.json').read_text());data.update({'asset':str(destination),'assetBytes':destination.stat().st_size,'durationMs':1200,'animatedFrames':30,'maximumCameraOrbitDegrees':2.1,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'sourceUnmodified':True})
(site/'qa/phase2-cinematic/hero-orbit.json').write_text(json.dumps(data,indent=2))
sheet=Image.new('RGB',(1500,360),'#080a0d');d=ImageDraw.Draw(sheet)
for i,index in enumerate([0,7,14,22,29]):
    im=frames[index];im.thumbnail((300,290));sheet.paste(im,(i*300,20),im);d.text((i*300+12,320),f'Frame {index} / actual Cycles camera',fill='white')
sheet.save(site/'qa/phase2-cinematic/hero-orbit-contact.jpg',quality=94)
print(json.dumps({'assetBytes':destination.stat().st_size,'renderSeconds':sum(f['seconds'] for f in data['frames']),'backend':data['backend']}))
