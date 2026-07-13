import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e',
  timeout: 15000,
  retries: 1,
  use: {
    headless: true,
  },
});
