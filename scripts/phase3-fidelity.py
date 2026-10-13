from pathlib import Path
from PIL import Image,ImageDraw,ImageChops,ImageStat
import json
root=Path('D:/VYREN');site=root/'06_WEBSITE';qa=site/'qa/phase3';stats=[]
sheet=Image.new('RGB',(1200,4*450),'#14191e');draw=ImageDraw.Draw(sheet)
for row,index in enumerate([0,66,12,24]):
    png=root/f'04_RENDER_OUTPUT/Phase3_Studio/production/{index:03}.png';webp=site/f'public/assets/studio-cycles/desktop/{index:03}.webp'
    source=Image.open(png).convert('RGBA');packed=Image.open(webp).convert('RGBA');background=Image.new('RGBA',source.size,'#14191e')
    a=Image.alpha_composite(background,source).convert('RGB');b=Image.alpha_composite(background,packed).convert('RGB')
    delta=ImageChops.difference(a,b);mask=source.getchannel('A').point(lambda v:255 if v>20 else 0)
    whole=ImageStat.Stat(delta).mean;product=ImageStat.Stat(delta,mask).mean
    stats.append({'frame':index,'wholeImageMeanChannelDifference':sum(whole)/3,'productMaskMeanChannelDifference':sum(product)/3,'alphaMeanDifference':ImageStat.Stat(ImageChops.difference(source.getchannel('A'),packed.getchannel('A'))).mean[0],'browserBytes':webp.stat().st_size,'meaning':'Compression difference in 0–255 channels; not a realism score'})
    for col,im in enumerate([a,b]):im.thumbnail((600,420));sheet.paste(im,(col*600,row*450+25))
    draw.text((15,row*450+5),f'Frame {index:03}: archival PNG / browser WebP',fill='#b49a7a')
sheet.save(qa/'source-webp-comparison.jpg',quality=95);(qa/'compression-fidelity.json').write_text(json.dumps(stats,indent=2));print(json.dumps(stats,indent=2))
