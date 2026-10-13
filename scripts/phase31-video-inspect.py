from pathlib import Path
import subprocess,json
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1];out=root/'qa/phase3-1/recording';ffmpeg=root/'qa/phase2-cinematic/runtime/ffmpeg-1013/ffmpeg-win64.exe'
times=[2.2,7,12.5,15.5,18.5,20.8,21.1,22,22.5,23.5,24.8,26.8,27.4,28.3,30,32]
sheet=Image.new('RGB',(1440,4*275),'#0d1218');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
    p=out/f'check-{t}.png';r=subprocess.run([str(ffmpeg),'-ss',str(t),'-i',str(out/'studio-polish-session.webm'),'-vf','scale=360:-1','-frames:v','1','-y',str(p)],capture_output=True);assert r.returncode==0
    sheet.paste(Image.open(p).convert('RGB'),((i%4)*360,(i//4)*275));draw.text(((i%4)*360+8,(i//4)*275+251),f'{t:.1f}s',fill='#ddd5c7')
sheet.save(out/'inspection-contact.jpg',quality=95)
(out/'inspection.json').write_text(json.dumps({'sampleTimes':times,'encodedFps':25,'videoDurationSeconds':33.24,'resolution':[1440,1000],'source':'Actual Playwright recording, unedited video','review':'Sampled rotation, presets, both transitions, fast switching, macro and fullscreen; temporal sampling cannot prove absence of every subframe glitch.'},indent=2))
