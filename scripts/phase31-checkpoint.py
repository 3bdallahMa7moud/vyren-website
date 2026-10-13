from pathlib import Path
import shutil,hashlib,json
root=Path('D:/VYREN');site=root/'06_WEBSITE';out=root/'08_BACKUPS/WEBSITE_PHASE3_1_ENTRY_20261011'
assert not out.exists(),'Checkpoint already exists; preserve it.'
out.mkdir(parents=True)
for name in ['src','public','scripts']:
    shutil.copytree(site/name,out/name)
for p in site.iterdir():
    if p.is_file() and (p.suffix in ['.json','.ts','.md','.mjs'] or p.name=='.gitignore'):shutil.copy2(p,out/p.name)
shutil.copytree(site/'qa/phase3/tests',out/'phase3-tests')
copied=[]
for p in out.rglob('*'):
    if p.is_file():
        rel=p.relative_to(out);src=site/rel if rel.parts[0]!='phase3-tests' else site/'qa/phase3/tests'/Path(*rel.parts[1:]);a=hashlib.sha256(p.read_bytes()).hexdigest();b=hashlib.sha256(src.read_bytes()).hexdigest();assert a==b;copied.append({'path':str(rel),'sha256':a})
protected=[]
for p in [root/'02_BLENDER/Projects/VYREN_NOCTIS_01_MASTER.blend',root/'05_WEB_EXPORT/GLB/vyren_noctis_01.glb',root/'05_WEB_EXPORT/assembly_transforms.json',*list((site/'public').rglob('*'))]:
    if p.is_file():protected.append({'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'verified-checkpoint.json').write_text(json.dumps({'verifiedCopiedFiles':len(copied),'files':copied,'protectedOriginalAssets':protected},indent=2),encoding='utf-8')
(site/'qa/phase3-1').mkdir(parents=True,exist_ok=True)
(site/'qa/phase3-1/checkpoint.json').write_text(json.dumps({'path':str(out),'verifiedCopiedFiles':len(copied),'protectedAssets':len(protected)},indent=2),encoding='utf-8')
print({'checkpoint':str(out),'copiedVerified':len(copied),'protectedAssets':len(protected)})
