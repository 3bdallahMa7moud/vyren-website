from pathlib import Path
from PIL import Image
import re,json
root=Path(__file__).resolve().parents[1];results=[]
for i in range(72):
    im=Image.open(root/f'public/assets/studio-cycles/desktop/{i:03}.webp').convert('RGBA');w,h=im.size
    mask=im.getchannel('A').point(lambda x:1 if x>16 else 0).tobytes();parent=[];runs=[];previous=[]
    def find(i):
        while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
        return i
    for y in range(h):
        current=[]
        for m in re.finditer(b'\x01+',mask[y*w:(y+1)*w]):
            l,r=m.span();index=len(parent);parent.append(index);runs.append((l,r,y));current.append((l,r,index))
            for pl,pr,pi in previous:
                if pl<r and pr>l:parent[find(index)]=find(pi)
        previous=current
    groups={}
    for index,(l,r,y) in enumerate(runs):
        key=find(index);g=groups.setdefault(key,{'area':0,'bbox':[l,y,r,y+1]});g['area']+=r-l;g['bbox']=[min(g['bbox'][0],l),min(g['bbox'][1],y),max(g['bbox'][2],r),max(g['bbox'][3],y+1)]
    components=sorted(groups.values(),key=lambda g:-g['area']);results.append({'frame':i,'componentsAbove24Pixels':[c for c in components if c['area']>24],'smallNoisePixels':sum(c['area'] for c in components if c['area']<=24)})
out={'resolution':[1600,1200],'alphaThreshold':16,'connectivity':4,'ignoreAreaAtMost':24,'frames':results,'disconnectedFrames':[r['frame'] for r in results if len(r['componentsAbove24Pixels'])>1]}
(root/'qa/phase3-1/full-resolution-alpha-scan.json').write_text(json.dumps(out,indent=2));print({'disconnectedFrames':out['disconnectedFrames'],'frames':72})
