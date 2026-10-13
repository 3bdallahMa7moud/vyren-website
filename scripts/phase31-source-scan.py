from pathlib import Path
from PIL import Image,ImageDraw
import json
site=Path.cwd();qa=site/'qa/phase3-1';sheet=Image.new('RGB',(2400,6*175),'#14191e');d=ImageDraw.Draw(sheet);stats=[];union=None
for i in range(72):
    im=Image.open(site/f'public/assets/studio-cycles/desktop/{i:03}.webp').convert('RGBA');alpha=im.getchannel('A');box=alpha.point(lambda v:255 if v>16 else 0).getbbox();union=box if union is None else tuple([min(union[0],box[0]),min(union[1],box[1]),max(union[2],box[2]),max(union[3],box[3])])
    small=alpha.resize((320,240));pixels=small.load();seen=set();components=[]
    for y in range(240):
        for x in range(320):
            if pixels[x,y]<=24 or (x,y) in seen:continue
            stack=[(x,y)];seen.add((x,y));pts=[]
            while stack:
                xx,yy=stack.pop();pts.append((xx,yy))
                for nx,ny in [(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)]:
                    if 0<=nx<320 and 0<=ny<240 and (nx,ny) not in seen and pixels[nx,ny]>24:seen.add((nx,ny));stack.append((nx,ny))
            if len(pts)>3:components.append({'area':len(pts),'bbox':[min(p[0] for p in pts),min(p[1] for p in pts),max(p[0] for p in pts),max(p[1] for p in pts)]})
    stats.append({'frame':i,'alphaBounds':box,'components':sorted(components,key=lambda c:-c['area'])})
    bg=Image.new('RGBA',im.size,'#14191e');bg.alpha_composite(im);bg.thumbnail((200,150));sheet.paste(bg.convert('RGB'),((i%12)*200,(i//12)*175+20));d.text(((i%12)*200+7,(i//12)*175+3),f'{i:03} / {i*5} deg',fill='white')
sheet.save(qa/'all-72-source-frames.jpg',quality=95);(qa/'source-frame-scan.json').write_text(json.dumps({'alphaUnion':union,'frames':stats},indent=2),encoding='utf-8');print({'alphaUnion':union,'disconnectedFrames':[{ 'frame':s['frame'],'components':s['components']} for s in stats if len(s['components'])>1]})
