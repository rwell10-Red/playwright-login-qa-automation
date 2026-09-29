// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directory where test files live
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: false,

  // Fail the build on CI if test.only is accidentally left in source
  forbidOnly: !!process.env.CI,

  // No retries locally — 1 retry in CI
  retries: process.env.CI ? 1 : 0,

  // One worker so Flask session state stays predictable between tests
  workers: 1,

  // Reporter: show results in terminal + generate HTML report
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // JUnit output file. The default name can be overridden per run using
    // the PLAYWRIGHT_JUNIT_OUTPUT_NAME environment variable. In CI we run
    // each project separately and give each its own XML file, so every
    // project's results are recorded (full traceability) without producing
    // duplicate sections in a single combined file.
    ['junit', {
      outputFile: process.env.PLAYWRIGHT_JUNIT_OUTPUT_NAME || 'test-results/junit-results.xml',
    }],
  ],

  use: {
    // Base URL — Flask dev server
    baseURL: 'http://127.0.0.1:5000',

    // Capture screenshot and video only on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Trace on first retry for debugging
    trace: 'on-first-retry',

    // Generous timeout for local server cold starts
    actionTimeout: 10000,
  },

  projects: [
    {
      // Primary: Chromium desktop (all 10 test cases)
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // TC_LOGIN_010: Mobile viewport test
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      // Only run the mobile test file in this project
      testMatch: '**/tc_login_010_mobile.spec.js',
    },
  ],

  // Timeout per test: 30 seconds
  timeout: 30000,

  // Expect timeout: 5 seconds for assertions
  expect: { timeout: 5000 },
});
