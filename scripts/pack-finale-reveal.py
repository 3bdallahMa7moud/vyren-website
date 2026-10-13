"""Versioned web derivatives of the read-only Cycles finale. Originals stay intact."""
from pathlib import Path
from PIL import Image
import hashlib, json

source = Path('D:/VYREN/04_RENDER_OUTPUT/Finale_Reveal_v1/production')
out = Path('D:/VYREN/06_WEBSITE/public/assets/finale-reveal-v1')
paths = [source / f'reveal-{i:03}.png' for i in range(72)]
assert all(p.exists() for p in paths), 'Finish all 72 renders before publishing the sequence'
bounds = []
for p in paths:
    with Image.open(p) as im:
        alpha = im.getchannel('A').point(lambda x: 255 if x > 4 else 0)
        bounds.append(alpha.getbbox())
left, top = min(b[0] for b in bounds), min(b[1] for b in bounds)
right, bottom = max(b[2] for b in bounds), max(b[3] for b in bounds)
pad = 36
with Image.open(paths[0]) as im:
    width, height = im.size
crop = (max(0, left - pad), max(0, top - pad), min(width, right + pad), min(height, bottom + pad))
for variant in ['desktop', 'mobile']:
    (out / variant).mkdir(parents=True, exist_ok=True)
for i, p in enumerate(paths):
    with Image.open(p) as im:
        im = im.crop(crop)
        for variant, width, quality in [('desktop', min(1100, im.width), 88), ('mobile', min(720, im.width), 84)]:
            resized = im.resize((width, round(width * im.height / im.width)), Image.Resampling.LANCZOS)
            resized.save(out / variant / f'reveal-{i:03}.webp', 'WEBP', quality=quality, method=4, exact=True)
        if i in [0, 71]:
            kind = 'rim' if i == 0 else 'complete'
            for width in [800, 1600]:
                im.resize((width, round(width * im.height / im.width)), Image.Resampling.LANCZOS).save(out / f'poster-{kind}-{width}.webp', 'WEBP', quality=88, method=4, exact=True)
manifest = {'renderSource': json.loads((source / 'render.json').read_text()), 'count': 72, 'crop': crop, 'aspect': [crop[2] - crop[0], crop[3] - crop[1]], 'alphaBounds': bounds, 'assets': [{'file': str(p.relative_to(out)).replace('\\', '/'), 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(out.rglob('*.webp'))]}
(out / 'provenance.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps({'frames': 72, 'assets': len(manifest['assets']), 'bytes': sum(a['bytes'] for a in manifest['assets']), 'crop': crop, 'aspect': manifest['aspect']}))
