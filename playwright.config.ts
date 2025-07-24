import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tmp/screenshots/test-results',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false, // Sequential to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for isolation
  reporter: [['html', { outputFolder: './tmp/screenshots/playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'on', // Always take screenshots
    video: 'on', // Always capture video
    headless: true, // Always run headless by default
    // Video settings will be configured per test
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Override to ensure headless
        headless: true,
        // Unique browser context for isolation
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
    },
  ],
  webServer: {
    command: 'npm start',
    port: 5173,
    reuseExistingServer: true, // Use existing server
    // Add timeout for server startup
    timeout: 60 * 1000,
  },
})