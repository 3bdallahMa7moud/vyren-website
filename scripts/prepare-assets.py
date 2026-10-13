"""Prepare website derivatives only; every original stays untouched."""
from pathlib import Path
from PIL import Image
import hashlib, json, shutil

website = Path(__file__).resolve().parents[1]
root = website.parent
out = website / 'public' / 'assets'
out.mkdir(parents=True, exist_ok=True)
qa = website / 'qa'
qa.mkdir(exist_ok=True)
images = {
 'hero': 'Hero/vyren_hero_transparent.png', 'hero-dark': 'Hero/vyren_hero_dark.png',
 'alternative': 'Hero/vyren_hero_alternative.png', 'front': 'Views/vyren_front.png',
 'rear': 'Views/vyren_rear.png', 'case': 'Macro/vyren_case_detail.png',
 'crown': 'Macro/vyren_crown_detail.png', 'dial': 'Macro/vyren_dial_macro.png',
 'movement': 'Macro/vyren_movement_macro.png', 'strap': 'Macro/vyren_strap_connection.png',
 'rear-macro': 'Macro/vyren_rear_macro.png', 'exploded': 'Exploded_View/vyren_exploded.png',
}
manifest = {'sources': [], 'media': []}
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
for name, relative in images.items():
 source = root / '04_RENDER_OUTPUT' / relative
 if not source.exists() and name == 'exploded':
  source = next((root / '04_RENDER_OUTPUT' / 'Exploded_View').glob('*.png'))
 manifest['sources'].append({'path': str(source), 'sha256': sha(source), 'bytes': source.stat().st_size})
 im = Image.open(source)
 for width in [800,1600]:
  derivative = im.copy()
  derivative.thumbnail((width, round(width * im.height / im.width)), Image.Resampling.LANCZOS)
  destination = out / f'{name}-{width}.webp'
  derivative.save(destination, 'WEBP', quality=90, method=6, exact=True)
  manifest['media'].append({'path': str(destination.relative_to(website)), 'bytes': destination.stat().st_size, 'dimensions': derivative.size})
for source_relative, destination in [('05_WEB_EXPORT/GLB/vyren_noctis_01.glb','vyren-noctis-01.glb'), ('05_WEB_EXPORT/assembly_transforms.json','assembly.json')]:
 source = root / source_relative
 shutil.copy2(source, out / destination)
 manifest['sources'].append({'path': str(source), 'sha256': sha(source), 'bytes': source.stat().st_size})
for name in ['VYREN_NOCTIS_01_MASTER.blend','VYREN_NOCTIS_01_WEB.blend']:
 source = root / '02_BLENDER' / 'Projects' / name
 manifest['sources'].append({'path': str(source), 'sha256': sha(source), 'bytes': source.stat().st_size})
lights = json.loads((root / '04_RENDER_OUTPUT/Comparison_Final/Controlled/after/settings.json').read_text())['hero']['lights']
(out / 'studio.json').write_text(json.dumps(lights, separators=(',',':')))
(qa / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps({'image_derivatives': len(manifest['media']), 'webp_bytes': sum(m['bytes'] for m in manifest['media']), 'protected_source_hashes': len(manifest['sources'])}))
