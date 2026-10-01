# Playwright — Running Tests, UI Mode, Reports

Playwright is the test automation framework. It drives a real browser through code.
All Playwright commands run via `npx playwright`.

---

## npx playwright install
```bash
npx playwright install
npx playwright install --with-deps chromium
npx playwright install chromium
```
Downloads the browser binaries Playwright controls.
- (no args) — installs all browsers (Chromium, Firefox, WebKit)
- `chromium` — install only Chromium
- `--with-deps` — also install required system libraries (needed on CI Linux)

These are private automation browsers, separate from your everyday browser.

---

## npx playwright test
```bash
npx playwright test
```
Runs ALL tests headlessly (no visible browser). The primary command. Prints a live
list of pass/fail and a summary at the end.

---

## Running Specific Projects or Files
```bash
npx playwright test --project=chromium-desktop
npx playwright test --project=mobile-chrome
```
- `--project=NAME` — run only one configured project (browser/device configuration)

```bash
npx playwright test tests/login.spec.js
```
Run a single test file by path.

---

## npx playwright test --headed
```bash
npx playwright test --headed
```
Runs tests with a VISIBLE browser so you can watch each action happen. Useful to
see what the tests actually do.

---

## npx playwright test --ui
```bash
npx playwright test --ui
```
Opens UI Mode — a graphical interface with:
- A list of all tests on the left
- Click any test to run and inspect it
- Screenshots at every step (time-travel debugging)
- A timeline you can scrub through
- The exact failing action and error for failed tests

This is the best tool for understanding and debugging tests visually. Used in this
project to confirm the 3 mobile page.tap failures with screenshots.

---

## npx playwright test --list
```bash
npx playwright test --list
```
Lists all tests WITHOUT running them. Confirms the config is valid and shows how
many tests exist across which projects. This project showed 25 tests across two
projects.

---

## npx playwright show-report
```bash
npx playwright show-report
```
Opens the HTML report from the last run in your browser — every test result with
screenshots and videos of failures. This is the human-readable report.

---

## npm Scripts (shortcuts defined in package.json)
```bash
npm test                  # runs: playwright test
npm run test:desktop      # runs: playwright test --project=chromium-desktop
npm run test:mobile       # runs: playwright test --project=mobile-chrome
npm run test:headed       # runs: playwright test --headed
npm run test:report       # runs: playwright show-report
```
These are aliases so you type less. See the npm reference file for how scripts work.

---

## Key Concept — Two Terminals
Playwright tests need the Flask app running. Use two terminals:
```bash
# Terminal 1 — start the app, leave it running
python login_app/app.py

# Terminal 2 — run the tests against it
npx playwright test --headed
```
