from pathlib import Path
import json,hashlib,datetime
site=Path.cwd();qa=site/'qa/phase3';root=site.parent
stats=json.loads((qa/'test-results/results.json').read_text(encoding='utf-8'))['stats']
assert stats['expected']==50 and stats['unexpected']==0 and stats['flaky']==0 and stats['skipped']==0,stats
hashes=json.loads((root/'08_BACKUPS/WEBSITE_PHASE3_ENTRY_20261011/protected-hashes.json').read_text(encoding='utf-8-sig'))
assert all(hashlib.sha256(Path(i['Path']).read_bytes()).hexdigest().upper()==i['Hash'] for i in hashes)
counts={name:len(list((site/'public/assets/studio-cycles'/name).glob('*.webp'))) for name in ['desktop','mobile']}
assert counts=={'desktop':72,'mobile':72},counts
for name in ['typecheck','lint']:
    log=(qa/f'{name}.log').read_text(encoding='utf-8-sig')
    assert ('tsc --noEmit' if name=='typecheck' else 'eslint src next.config.ts') in log
    assert 'error TS' not in log and 'error  ' not in log
assert 'Compiled successfully' in (qa/'build.log').read_text(encoding='utf-8-sig')
evidence={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'productionUrl':'http://127.0.0.1:3001','typecheck':{'passed':True,'log':'qa/phase3/typecheck.log'},'lint':{'passed':True,'log':'qa/phase3/lint.log'},'build':{'passed':True,'log':'qa/phase3/build.log'},'browserTests':stats,'viewportWidths':[360,390,768,1280,1440,1920],'additionalLandscape':[844,390],'studioFrameCounts':counts,'preservedOriginalFiles':len(hashes),'allOriginalHashesUnchanged':True,'visualInspection':'Actual Edge screenshots and the 40.56-second production browser recording inspected; source PNG/WebP and Hero/Studio comparisons inspected.','testedPlatform':'Installed desktop Edge 155.0.4283.45 on Windows; headless Playwright and CDP touch/network emulation','untestedPlatforms':['Physical phone hardware','Safari','Firefox'],'deferredOptionalFeature':'Second Studio lighting sequence','performance':'qa/phase3/performance.json','recording':'qa/phase3/recordings/phase3-journey.webm','modifiedFiles':'qa/phase3/modified-files.json'}
(qa/'verification.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(evidence,ensure_ascii=False,indent=2))
