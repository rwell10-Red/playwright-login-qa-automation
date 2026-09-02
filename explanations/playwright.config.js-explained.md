# playwright.config.js — Line by Line Explanation

**File location:** `playwright.config.js` (project root)
**Purpose:** The central configuration file for Playwright. Controls everything about how tests run — which browsers to use, what the base URL is, how long to wait, what to capture on failure, and how to report results. Playwright reads this file automatically when you run `npx playwright test`.

---

```javascript
// @ts-check
```
**Line 1** — A TypeScript type-checking comment for JavaScript files.
- Even though this is a `.js` file, VS Code can use TypeScript's type checker on it when this comment is present
- Enables autocomplete and type hints for the `defineConfig` options in your editor
- Has no effect at runtime — purely a developer experience improvement

---

```javascript
const { defineConfig, devices } = require('@playwright/test');
```
**Line 2** — Imports two things from the Playwright test package.
- `defineConfig` — a function that wraps the config object. Provides TypeScript type checking and validation of config options. Using it is optional but recommended — it catches typos in config keys.
- `devices` — a dictionary of pre-configured device profiles (viewport sizes, user agents). Used to simulate phones and tablets. Example: `devices['Pixel 5']` contains the exact viewport and user agent for a Google Pixel 5 phone.

---

```javascript
module.exports = defineConfig({
```
**Line 4** — Exports the configuration object using Node.js CommonJS syntax. `module.exports` makes this object available to Playwright when it reads the file. Everything inside `defineConfig({...})` is the configuration.

---

```javascript
  testDir: './tests',
```
**Line 6** — Tells Playwright where to find test files.
- `'./tests'` — the `tests/` folder relative to this config file
- Playwright scans this folder for files matching `**/*.spec.js` (any `.spec.js` file in any subfolder)
- Both `login.spec.js` and `tc_login_010_mobile.spec.js` are in this folder

---

```javascript
  fullyParallel: false,
```
**Line 9** — Disables running tests in parallel within a file.
- `false` — tests run one after another in the order they are written
- Set to `false` here because our tests share the Flask server and database state. If tests ran in parallel, TC_LOGIN_005b (which locks `reset@example.com`) could run at the same time as another test using that account, causing conflicts.
- `true` would make tests faster but requires each test to be completely independent with no shared state

---

```javascript
  forbidOnly: !!process.env.CI,
```
**Line 12** — Prevents accidentally committing `test.only()` to CI.
- `test.only()` is a Playwright feature that makes only that one test run — useful for debugging locally
- If a developer forgets to remove `test.only()` before pushing code, CI would only run that one test and all others would be skipped — giving a false green result
- `process.env.CI` — checks if the `CI` environment variable is set (GitHub Actions and most CI systems set this automatically)
- `!!` converts the value to `true`/`false`: if `CI` is set → `true` (forbid .only) | if not set → `false` (allow .only locally)

---

```javascript
  retries: process.env.CI ? 1 : 0,
```
**Line 15** — Sets how many times a failing test is retried before being marked as failed.
- `process.env.CI ? 1 : 0` — ternary expression: if running in CI, retry once; if running locally, no retries
- CI environments can have network delays or timing issues that cause occasional flaky failures. One retry catches those without hiding real bugs.
- Locally: no retries so failures show immediately without waiting for retries

---

```javascript
  workers: 1,
```
**Line 18** — Sets the number of parallel worker processes to 1.
- One worker means one test runs at a time across all files
- Critical for this project because all tests share the same Flask server and SQLite database
- If two workers ran simultaneously, both might try to log in with `user@example.com` at the same time, causing race conditions
- In projects with isolated test environments, more workers speed up execution significantly

---

```javascript
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
```
**Lines 21–24** — Configures how test results are reported. Two reporters run simultaneously.

**`['list']`** — Prints a live list of each test and its result to the terminal as tests run:
```
✓ TC_LOGIN_001 — Valid login redirects to dashboard (1.2s)
✓ TC_LOGIN_002 — Invalid password shows generic error (0.8s)
✗ TC_LOGIN_005 — Account locks after 5 failed login attempts (2.1s)
```

**`['html', { outputFolder: 'playwright-report', open: 'never' }]`** — Generates a full HTML report after the run completes.
- `outputFolder: 'playwright-report'` — saves the report in a `playwright-report/` folder
- `open: 'never'` — does not automatically open the report in a browser. You open it manually with `npx playwright show-report` or `npm run test:report`.

---

```javascript
  use: {
```
**Line 26** — The `use` block contains settings applied to ALL tests across ALL projects unless overridden.

---

```javascript
    baseURL: 'http://127.0.0.1:5000',
```
**Line 28** — The base URL for all navigation calls.
- `127.0.0.1` is the loopback address (same as `localhost`) — your own machine
- Port `5000` is where Flask runs
- Because of this setting, `page.goto('/login')` in tests automatically becomes `page.goto('http://127.0.0.1:5000/login')` — you never need to write the full URL in tests

---

```javascript
    screenshot: 'only-on-failure',
```
**Line 31** — Captures a screenshot of the browser when a test fails.
- `'only-on-failure'` — no screenshots on passing tests (keeps the report clean)
- Screenshots are saved in the `playwright-report/` folder and embedded in the HTML report
- When TC_LOGIN_005 fails, you get a screenshot showing exactly what the browser displayed — invaluable for debugging

---

```javascript
    video: 'retain-on-failure',
```
**Line 32** — Records a video of the browser session when a test fails.
- `'retain-on-failure'` — records every test but only saves the video file if the test fails
- You can watch the exact sequence of actions that led to the failure
- Videos are embedded in the HTML report alongside screenshots

---

```javascript
    trace: 'on-first-retry',
```
**Line 35** — Captures a Playwright trace (detailed execution log) on the first retry.
- A trace records every action, network request, console log, and DOM snapshot
- Viewable in Playwright's trace viewer: `npx playwright show-trace trace.zip`
- `'on-first-retry'` — only captured when a test is retried (which only happens in CI with `retries: 1`)
- Traces are the most detailed debugging tool — like a DVR for your test

---

```javascript
    actionTimeout: 10000,
```
**Line 38** — Maximum time (in milliseconds) to wait for a single action to complete.
- `10000` = 10 seconds per action
- Actions include: `page.fill()`, `page.click()`, `page.goto()`, `expect().toBeVisible()`
- Flask starts quickly locally so 10 seconds is generous — prevents tests from hanging forever if the server is slow to respond

---

```javascript
  projects: [
```
**Line 41** — The `projects` array defines multiple browser/device configurations. Each project runs the tests independently with its own browser settings.

---

```javascript
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
```
**Lines 43–46** — The primary desktop test project.
- `name: 'chromium-desktop'` — the project name shown in test output and reports
- `devices['Desktop Chrome']` — a pre-built Playwright profile with:
  - Viewport: 1280 × 720 pixels
  - User agent: Chrome desktop browser string
  - No touch events
- `...devices['Desktop Chrome']` — the `...` spread operator copies all properties from the device profile into the `use` object
- Runs ALL test files: `login.spec.js` + `tc_login_010_mobile.spec.js`

---

```javascript
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/tc_login_010_mobile.spec.js',
    },
```
**Lines 48–52** — The mobile test project. **TC_LOGIN_010.**
- `name: 'mobile-chrome'` — project name in reports
- `devices['Pixel 5']` — Google Pixel 5 device profile with:
  - Viewport: 393 × 851 pixels (portrait)
  - User agent: Android Chrome mobile string
  - Touch events enabled (so `page.tap()` works)
  - `deviceScaleFactor: 2.75` — high-DPI screen simulation
- `testMatch: '**/tc_login_010_mobile.spec.js'` — restricts this project to ONLY run the mobile test file. Without this, it would run all tests at mobile size, which is not necessary — we only need mobile-specific tests in mobile mode.

---

```javascript
  timeout: 30000,
```
**Line 55** — Maximum time in milliseconds for a single test to complete.
- `30000` = 30 seconds per test
- If a test takes longer than 30 seconds, Playwright marks it as timed out and failed
- 30 seconds is generous for these login tests — most complete in 1–3 seconds

---

```javascript
  expect: { timeout: 5000 },
```
**Lines 58–60** — Maximum time for assertion checks to pass.
- `5000` = 5 seconds per `expect()` assertion
- Playwright's `expect()` automatically retries assertions until they pass or timeout
- Example: `expect(page.locator('#welcome-heading')).toBeVisible()` — if the element is not visible yet, Playwright retries every 100ms for up to 5 seconds before failing
- This handles cases where the page takes a moment to load after a redirect

---

## How the Two Projects Produce 25 Tests

```
chromium-desktop project:
  login.spec.js            → 17 tests
  tc_login_010_mobile.spec.js → 4 tests  (no testMatch restriction, runs all files)
  Subtotal: 21 tests

mobile-chrome project:
  tc_login_010_mobile.spec.js → 4 tests  (testMatch restricts to this file only)
  Subtotal: 4 tests

Total: 21 + 4 = 25 tests
```

The 4 mobile tests run twice — once on a desktop Chromium viewport and once on a Pixel 5 mobile viewport. This ensures the mobile tests pass on both screen sizes.
