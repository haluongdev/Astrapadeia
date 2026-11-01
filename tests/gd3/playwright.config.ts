import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  retries: 0,
  reporter: [['list'], ['html', {outputFolder: 'playwright-report-gd3', open: 'never'}], ['json', {outputFile: 'gd3-results.json'}]],
  use: { baseURL: 'http://localhost:3000', browserName: 'chromium', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
});
