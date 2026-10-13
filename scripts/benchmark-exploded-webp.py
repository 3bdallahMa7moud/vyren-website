from pathlib import Path
from PIL import Image,ImageChops,ImageStat
from concurrent.futures import ThreadPoolExecutor
import time,json

site=Path(__file__).resolve().parents[1];qa=site/'qa/exploded-cycles/encoding-evaluation';qa.mkdir(exist_ok=True)
source=Image.open(site.parent/'04_RENDER_OUTPUT/Exploded_Scroll/production/000.png').convert('RGBA')
def encode(method):
    output=qa/f'method-{method}.webp';start=time.perf_counter();source.copy().save(output,'WEBP',quality=90,method=method,exact=True)
    duration=time.perf_counter()-start;decoded=Image.open(output).convert('RGBA')
    a=Image.new('RGBA',source.size,'#14191e');a.alpha_composite(source)
    b=Image.new('RGBA',source.size,'#14191e');b.alpha_composite(decoded)
    return {'method':method,'quality':90,'seconds':duration,'bytes':output.stat().st_size,'meanCompositedRgbError':ImageStat.Stat(ImageChops.difference(a.convert('RGB'),b.convert('RGB'))).mean,'alphaUnchanged':ImageChops.difference(source.getchannel('A'),decoded.getchannel('A')).getbbox() is None}
with ThreadPoolExecutor(max_workers=2) as pool:report=list(pool.map(encode,[4,6]))
(qa/'report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
