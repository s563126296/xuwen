import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:5180',
    viewport: { width: 1920, height: 1080 },
    screenshot: 'on',
  },
  outputDir: 'test-results',
});
