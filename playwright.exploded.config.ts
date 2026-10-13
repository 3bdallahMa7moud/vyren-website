import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './qa',
  testMatch: ['**/exploded-cycles/tests/*.spec.ts', '**/experience.spec.ts', '**/phase2.spec.ts'],
  timeout: 180000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'qa/exploded-cycles/test-results/results.json' }]],
  outputDir: 'qa/exploded-cycles/test-results',
  webServer: { command: 'npm run start -- --port 3001', url: 'http://127.0.0.1:3001', reuseExistingServer: true, timeout: 120000 },
  use: { baseURL: 'http://127.0.0.1:3001', channel: 'msedge', headless: true, viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
});
