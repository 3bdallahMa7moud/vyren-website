from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json, math, hashlib

website=Path(__file__).resolve().parents[1]
root=website.parent
shots=website/'qa/screenshots'
comparison=website/'qa/comparisons'
comparison.mkdir(exist_ok=True,parents=True)
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',17)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',13)
names=['02-hero-revealed','03-typography','04-case-macro','05-movement','08-assembly-full','10-materials','11-viewer-front','14-details','15-finale']
sheet=Image.new('RGB',(1500,1180),'#080a0d'); draw=ImageDraw.Draw(sheet)
for i,name in enumerate(names):
 im=Image.open(shots/f'{name}.png').convert('RGB'); im.thumbnail((484,336),Image.Resampling.LANCZOS)
 x=12+(i%3)*496; y=12+(i//3)*392
 sheet.paste(im,(x,y));draw.text((x,y+346),name,fill='#f1eee8',font=small)
sheet.save(website/'qa/scene-contact.jpg',quality=94)
metrics=[]
for name in ['hero','front','rear','movement','strap','crown']:
 source=root/f'04_RENDER_OUTPUT/Comparison_Final/Controlled/after/{name}.png'
 reference=Image.open(source).convert('RGB')
 browser=Image.open(shots/f'fidelity-{name}.png').convert('RGB')
 if browser.size[0]/browser.size[1] != reference.size[0]/reference.size[1]:
  # Fractional CSS canvas sizing may introduce one-pixel rounding only.
  ratio_delta=abs(browser.width/browser.height-reference.width/reference.height)
  if ratio_delta>.005: raise ValueError(f'Wrong comparison aspect: {name}, {browser.size}, {reference.size}')
 browser=browser.resize(reference.size,Image.Resampling.LANCZOS)
 # This metric is an image difference, not a realism score or radiometric calibration.
 pixels_a=list(reference.getdata());pixels_b=list(browser.getdata())
 mae=sum(sum(abs(a[k]-b[k]) for k in range(3)) for a,b in zip(pixels_a,pixels_b))/(3*len(pixels_a))
 metrics.append({'view':name,'reference':str(source),'browser':str(shots/f'fidelity-{name}.png'),'comparisonResolution':reference.size,'meanAbsoluteRgbDifference_0to255':round(mae,3),'interpretation':'Composition-matched RGB image difference, including background and lighting; not percentage fidelity.'})
 w,h=reference.size; target_w=650; target_h=round(h*target_w/w)
 contact=Image.new('RGB',(target_w*2+30,target_h+62),'#080a0d'); d=ImageDraw.Draw(contact)
 d.text((10,10),f'{name.upper()} / BLENDER CYCLES',font=font,fill='#f1eee8');d.text((target_w+20,10),'THREE.JS / ACTUAL WEBSITE',font=font,fill='#f1eee8')
 contact.paste(reference.resize((target_w,target_h),Image.Resampling.LANCZOS),(10,48));contact.paste(browser.resize((target_w,target_h),Image.Resampling.LANCZOS),(target_w+20,48))
 contact.save(comparison/f'{name}.jpg',quality=95)
(website/'qa/reports/fidelity-metrics.json').write_text(json.dumps(metrics,indent=2))
manifest=json.loads((website/'qa/asset-manifest.json').read_text())
protected=[]
for item in manifest['sources']:
 p=Path(item['path']); actual=hashlib.sha256(p.read_bytes()).hexdigest()
 protected.append({'path':str(p),'unchanged':actual==item['sha256'],'sha256':actual})
if not all(p['unchanged'] for p in protected): raise ValueError('Protected source changed')
(website/'qa/reports/source-preservation.json').write_text(json.dumps(protected,indent=2))
print(json.dumps({'comparisons':len(metrics),'protectedSourcesUnchanged':len(protected),'imageDifference':metrics}))
