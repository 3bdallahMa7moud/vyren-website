"""Audit the original assets and unrelated source against the rollback checkpoint."""
from pathlib import Path
import hashlib,json,re

site=Path(__file__).resolve().parents[1];qa=site/'qa/exploded-cycles'
checkpoint=json.loads((qa/'checkpoint.json').read_text());backup=Path(checkpoint['path'])
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
original_files=json.loads((backup/'verified-manifest.json').read_text())
backup_checks=[{'path':f['path'],'matches':digest(backup/'06_WEBSITE'/f['path'])==f['sha256']} for f in original_files]
protected=[{'path':f['path'],'matches':digest(Path(f['path']))==f['sha256'],'sha256':f['sha256']} for f in checkpoint['protectedSources']]
changed=[f['path'] for f in original_files if not (site/f['path']).exists() or digest(site/f['path'])!=f['sha256']]
allowed={'src/components/landing.tsx','src/components/motion.ts','src/app/globals.css','next.config.ts','package.json','qa/tests/experience.spec.ts','qa/phase2-cinematic/tests/phase2.spec.ts','next-env.d.ts','tsconfig.tsbuildinfo'}
unexpected=[p for p in changed if p.replace('\\','/') not in allowed]
before=(backup/'06_WEBSITE/src/components/landing.tsx').read_text();after=(site/'src/components/landing.tsx').read_text()
remove_assembly=lambda s:re.sub(r'function Assembly\(\) \{.*?(?=function Materials\(\))','',s,flags=re.S)
landing_preserved=remove_assembly(before)==remove_assembly(after).replace("import { AssemblySequence } from './assembly-sequence';\n",'')
before_css=(backup/'06_WEBSITE/src/app/globals.css').read_text();after_css=(site/'src/app/globals.css').read_text()
css_preserved=before_css==''.join(line for line in after_css.splitlines(keepends=True) if 'sequence-' not in line)
before_motion=(backup/'06_WEBSITE/src/components/motion.ts').read_text();after_motion=(site/'src/components/motion.ts').read_text()
before_motion=re.sub(r'      const assemblyStep =.*?(?=      const panels =)','',before_motion,flags=re.S)
after_motion=re.sub(r'      // One reversible playhead.*?(?=      const panels =)','',after_motion,flags=re.S)
after_motion=re.sub(r'    const isAssemblyReload =.*?\n','',after_motion)
after_motion=after_motion.replace('initialHash && location.hash === initialHash && !isAssemblyReload','initialHash && location.hash === initialHash')
motion_preserved=before_motion==after_motion
report={'rollback':str(backup),'backupFilesVerified':len(backup_checks),'backupChecks':backup_checks,'protectedSources':protected,'changedExistingFiles':changed,'unexpectedChanges':unexpected,'otherEightSectionsMarkupPreserved':landing_preserved,'otherSectionsCssPreserved':css_preserved,'otherSectionsMotionPreserved':motion_preserved,'originalPublicAssetsPreserved':all(f['path'] not in changed for f in original_files if f['path'].replace('\\','/').startswith('public/'))}
report['generatedCompilerFiles']=[p for p in changed if p in ['next-env.d.ts','tsconfig.tsbuildinfo']]
report['passed']=not unexpected and all(f['matches'] for f in protected+backup_checks) and all([landing_preserved,css_preserved,motion_preserved,report['originalPublicAssetsPreserved']])
(qa/'scope-audit.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k not in ['backupChecks','protectedSources']},indent=2))
assert report['passed'],'Unrelated source or protected asset changed; inspect the scope audit'
