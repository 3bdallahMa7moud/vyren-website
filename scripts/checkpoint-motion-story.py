from pathlib import Path
import hashlib, shutil, json
root=Path('D:/VYREN'); web=root/'06_WEBSITE'; dst=root/'08_BACKUPS/WEBSITE_MOTION_STORY_ENTRY_20261011'
dst.mkdir(parents=True,exist_ok=True)
for folder in ['src']:
    shutil.copytree(web/folder,dst/folder,dirs_exist_ok=True)
paths=[root/'02_BLENDER/Projects/VYREN_NOCTIS_01_MASTER.blend',root/'05_WEB_EXPORT/GLB/vyren_noctis_01.glb']+list((web/'public/assets').rglob('*'))
manifest={str(p.relative_to(root)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.is_file()}
(dst/'protected-assets.json').write_text(json.dumps(manifest,indent=2))
print('Checkpoint:',dst,'Protected:',len(manifest))
