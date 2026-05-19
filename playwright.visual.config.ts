import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: 'tests/visual/{testFilePath}-snapshots/{arg}{ext}',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'on-failure' }], ['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'on-first-retry',
  },
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      threshold: 0.02,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run playground:serve',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
