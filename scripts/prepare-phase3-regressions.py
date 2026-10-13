"""Keep old evidence unchanged; adapt only the explicit Studio/Free 3D entry step."""
from pathlib import Path
out=Path('qa/phase3/tests');out.mkdir(parents=True,exist_ok=True)
src=Path('qa/tests/experience.spec.ts').read_text()
src=src.replace("const qaRoot = process.env.VYREN_QA_ROOT || 'qa';","const qaRoot = 'qa/phase3/legacy';")
src=src.replace("async function ready(page: Page) { await page.waitForFunction", "async function ready(page: Page) { if(await page.getByRole('button',{name:'Studio',exact:true}).getAttribute('aria-pressed')==='true'){await page.getByRole('button',{name:'Free 3D',exact:true}).click();} await page.waitForFunction")
src=src.replace("null, { timeout: 90000 }); }\nasync function sequenceReady", "null, { timeout: 90000 }); await page.getByRole('button',{name:'front view',exact:true}).click();await page.waitForTimeout(1200); }\nasync function sequenceReady")
src=src.replace("await scene(page,'experience',.5); await page.waitForFunction(() => document.documentElement.dataset.studio === 'error');","await scene(page,'experience',.5); await page.getByRole('button',{name:'Free 3D',exact:true}).click(); await page.waitForFunction(() => document.documentElement.dataset.studio === 'error');")
(out/'legacy-experience.spec.ts').write_text(src)
src=Path('qa/exploded-cycles/tests/sequence.spec.ts').read_text().replace("const output=path.resolve('qa/exploded-cycles/sequence-tests');","const output=path.resolve('qa/phase3/legacy-exploded');")
src=src.replace("await page.waitForFunction(()=>document.documentElement.dataset.studio==='error');","await page.getByRole('button',{name:'Free 3D',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.studio==='error');")
(out/'legacy-sequence.spec.ts').write_text(src)
src=Path('qa/phase2-cinematic/tests/phase2.spec.ts').read_text()
src=src.replace("async function ready(page:Page){await page.waitForFunction", "async function ready(page:Page){if(await page.getByRole('button',{name:'Studio',exact:true}).getAttribute('aria-pressed')==='true')await page.getByRole('button',{name:'Free 3D',exact:true}).click();await page.waitForFunction")
# Hero lighting now has its own new tests; omit the retired camera-orbit asset contract.
src=src[:src.index("test('authentic Hero orbit")]
src=src.replace("expect((await page.evaluate(()=>window.__VYREN_MOTION!())).triggers).toBe(0)","expect((await page.evaluate(()=>window.__VYREN_MOTION!())).triggers).toBe(0)")
src=src.replace("const output=path.resolve(process.env.VYREN_QA_ROOT?`${process.env.VYREN_QA_ROOT}/stress`:'qa/phase2-cinematic/stress');","const output=path.resolve('qa/phase3/legacy-motion');")
(out/'legacy-motion.spec.ts').write_text(src)
src=Path('qa/section-seven-fixes/tests/viewer.spec.ts').read_text().replace("const out='qa/section-seven-fixes';","const out='qa/phase3/legacy-viewer';fs.mkdirSync(out,{recursive:true});")
src=src.replace("async function open(page:Page){await page.goto('/#experience');await ready(page);}","async function open(page:Page){await page.goto('/#experience');await page.getByRole('button',{name:'Free 3D',exact:true}).click();await ready(page);await page.getByRole('button',{name:'front view',exact:true}).click();await page.waitForTimeout(1200);}")
src=src.replace("await page.goto('/#experience');", "await page.goto('/#experience');await page.getByRole('button',{name:'Free 3D',exact:true}).click();")
src=src.replace("await page.getByRole('button',{name:'Free 3D',exact:true}).click();await page.getByRole('button',{name:'Free 3D',exact:true}).click();await ready(page);", "await page.getByRole('button',{name:'Free 3D',exact:true}).click();await align(page);await ready(page);")
# The poster now intentionally shows a Cycles photograph. Its difference from
# live WebGL is reviewed visually, rather than asserting the retired identical
# WebGL-poster pixels. All context/keyboard/framing/low-power/retry tests remain.
src=src[:src.index("test('mobile poster matches")]
(out/'legacy-viewer.spec.ts').write_text(src)
print('Prepared four existing regression suites; original tests/evidence preserved.')
