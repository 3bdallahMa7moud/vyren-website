from pathlib import Path
from PIL import Image,ImageDraw
qa=Path('qa/phase3');after=qa/'after'
scenes=['watch','manifesto','craftsmanship','movement','assembly','materials','experience','details','moment']
for width in [1440,390]:
    cellw=560 if width==1440 else 300;cellh=410 if width==1440 else 680
    sheet=Image.new('RGB',(cellw*3,cellh*3),'#14191e');d=ImageDraw.Draw(sheet)
    for i,id in enumerate(scenes):
        p=after/(f'{id}-{width}.png' if id!='experience' else f'studio-shell-{width}.png')
        im=Image.open(p).convert('RGB');im.thumbnail((cellw,cellh-25));sheet.paste(im,((i%3)*cellw,(i//3)*cellh+25));d.text(((i%3)*cellw+10,(i//3)*cellh+5),f'{i+1:02} / {id}',fill='white')
    sheet.save(qa/f'all-scenes-{width}.jpg',quality=95)
# Normalize image bounds for camera/material comparison only; these are not UI screenshots.
sheet=Image.new('RGB',(1200,1000),'#14191e');d=ImageDraw.Draw(sheet)
for col,p in enumerate([Path('public/assets/hero-1600.webp'),Path('public/assets/studio-cycles/desktop/000.webp')]):
    im=Image.open(p).convert('RGBA');bounds=im.getchannel('A').getbbox();im=im.crop(bounds);im.thumbnail((560,880));sheet.paste(im,(col*600+(600-im.width)//2,70+(880-im.height)//2),im)
    d.text((col*600+20,25),['Established Hero / original camera','Studio frame 000 / same orientation, orbital framing'][col],fill='white')
sheet.save(qa/'hero-studio-continuity.jpg',quality=95)
