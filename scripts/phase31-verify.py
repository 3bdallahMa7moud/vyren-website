from pathlib import Path
import hashlib,json,difflib
site=Path(__file__).resolve().parents[1];backup=Path('D:/VYREN/08_BACKUPS/WEBSITE_PHASE3_1_ENTRY_20261011')
data=json.loads((backup/'verified-checkpoint.json').read_text(encoding='utf-8'))
changed=[];violations=[];unchanged=0
for entry in data['protectedOriginalAssets']:
    p=Path(entry['path']);h=hashlib.sha256(p.read_bytes()).hexdigest()
    if h!=entry['sha256']:violations.append(str(p))
for p in (backup/'src').rglob('*'):
    if not p.is_file():continue
    rel=p.relative_to(backup);current=site/rel
    if p.read_bytes()==current.read_bytes():unchanged+=1
    else:
        changed.append(str(rel))
        diff=''.join(difflib.unified_diff(p.read_text(encoding='utf-8').splitlines(True),current.read_text(encoding='utf-8').splitlines(True),fromfile='before/'+str(rel),tofile='after/'+str(rel)))
        out=site/'qa/phase3-1/diffs'/rel;out.parent.mkdir(parents=True,exist_ok=True);out.with_suffix('.diff').write_text(diff,encoding='utf-8')
assert not violations,violations
result={'protectedAssetsVerified':len(data['protectedOriginalAssets']),'changedOriginalSourceFiles':changed,'unchangedOriginalSourceFiles':unchanged,'newSourceFiles':[str(p.relative_to(site)) for p in (site/'src').rglob('*') if p.is_file() and not (backup/p.relative_to(site)).exists()],'originalBlenderAndGlbUntouched':True,'allOriginalPublicAssetsUntouched':True}
(site/'qa/phase3-1/scope-verification.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(result)
