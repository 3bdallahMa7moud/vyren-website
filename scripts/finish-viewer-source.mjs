import fs from 'node:fs';
const cssPath='src/app/globals.css';
const css=fs.readFileSync(cssPath,'utf8');
const start=css.indexOf('  .viewer { padding:55px');
const end=css.indexOf('\n',start);
if(start<0||end<0) throw new Error('Mobile viewer rules not found');
fs.writeFileSync(cssPath,css.slice(0,start)+`  .viewer { padding:55px var(--gutter) 40px; }.viewer-heading { margin-bottom:28px; gap:32px; }.viewer-heading h2 { font-size:clamp(61px,15vw,95px); }.viewer-heading p { position:static; font-size:11px; }.viewer-body { height:clamp(460px,67svh,580px); margin:0 -24px; }.viewer-coordinate { top:24px; left:24px; font-size:10px; }.viewer-coordinate span { font-size:9px; }.viewer-footer { flex-direction:column; gap:10px; padding:14px 24px; min-height:106px; }.viewer-instruction { font-size:11px; text-align:center; }.interaction-button { font-size:11px; white-space:nowrap; gap:25px; }.viewer-controls { padding:12px 0 14px; flex-wrap:wrap; gap:8px; }.preset-controls { justify-content:space-between; gap:8px; width:100%; }.viewer-controls button { font-size:11px; gap:6px; }.utility-controls { width:100%; justify-content:flex-end; }.utility-controls button { font-size:20px; }.utility-controls .quality-control { margin-left:auto; font-size:11px; }.viewer-note { font-size:11px; line-height:1.8; }
`+css.slice(end+1));
// Updated label is a stable toggle whose pressed state always means low power.
const testPath='qa/tests/experience.spec.ts';
fs.writeFileSync(testPath,fs.readFileSync(testPath,'utf8').replace("name: 'Studio mode'","name: 'Low power'"));
