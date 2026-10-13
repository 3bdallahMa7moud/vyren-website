import { spawn } from 'node:child_process';
const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','--config','playwright.phase2.config.ts',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,VYREN_QA_ROOT:'qa/phase2-cinematic/regression'}});
child.on('exit',code=>{process.exitCode=code??1;});
