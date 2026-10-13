from pathlib import Path
root=Path(__file__).resolve().parents[1];dest=root/'qa/phase3-1/tests';dest.mkdir(parents=True,exist_ok=True)
for p in (root/'qa/phase3/tests').glob('*.ts'):
    t=p.read_text(encoding='utf-8').replace('qa/phase3/','qa/phase3-1/legacy/')
    # Per-point source ray casting now correctly keeps the rear-visible crown.
    if p.name=='studio-hotspots.spec.ts':t=t.replace("name:'Inspect Crown',exact:true})).toBeHidden();", "name:'Inspect Dial',exact:true})).toBeHidden();await expect(page.getByRole('button',{name:'Inspect Crown',exact:true})).toBeVisible();")
    (dest/p.name).write_text(t,encoding='utf-8')
config=(root/'playwright.phase3.config.ts').read_text(encoding='utf-8').replace("'./qa/phase3/tests'","'./qa/phase3-1/tests'").replace('qa/phase3/test-results','qa/phase3-1/test-results')
(root/'playwright.phase31.config.ts').write_text(config,encoding='utf-8')
