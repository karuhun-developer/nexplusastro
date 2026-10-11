import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4322',
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    launchOptions: process.env['BROWSER_PATH']
      ? { executablePath: process.env['BROWSER_PATH'] }
      : {},
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --port 4322',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env['CI'],
  },
});
