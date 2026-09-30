# Issue 09 — Playwright: Mobile Tests Fail on Desktop (page.tap)

## What Happened
When the full 25-test suite ran, 3 tests failed consistently — locally, in UI Mode,
and in the CI pipeline. All 3 were mobile test variants:
- TC_LOGIN_010b — Mobile login end-to-end
- TC_LOGIN_010c — Mobile validation errors
- TC_LOGIN_010d — Forgot password on mobile

## Error Message
```
page.tap: The page does not support tap. Use hasTouch context option to enable
touch support.
```

## Root Cause
These tests use `page.tap()`, which simulates a finger tap and requires touch
support (`hasTouch: true`). The tests were running under the `chromium-desktop`
project, which is desktop Chrome with NO touch support.

The mobile test file (`tc_login_010_mobile.spec.js`) was running under BOTH
projects because only the `mobile-chrome` project had a `testMatch` restriction —
the `chromium-desktop` project had no restriction, so it also picked up the mobile
file and failed on `page.tap()`.

## How It Was Diagnosed
- Playwright UI Mode showed the exact failing action (`Tap` on `#email`, line 54)
  with a screenshot of the desktop viewport.
- The error context file stated: "The page does not support tap."
- Confirmed the config: mobile-chrome had `testMatch`, chromium-desktop did not.

## Solution (Option A)
Add `testIgnore` to the chromium-desktop project so it does NOT run the mobile
file:
```javascript
{
  name: 'chromium-desktop',
  use: { ...devices['Desktop Chrome'] },
  testIgnore: '**/tc_login_010_mobile.spec.js',   // added
}
```
Now:
- chromium-desktop runs only login.spec.js (desktop tests)
- mobile-chrome runs only tc_login_010_mobile.spec.js (touch works)

This one fix resolves THREE things at once:
1. The 3 page.tap failures (mobile tests only run where touch is supported)
2. The duplicate-section error (Issue 07 — mobile file appears once)
3. The file-overwrite problem (Issue 08 — single run, single report)

## Lesson Learned
- `page.tap()` needs a project with `hasTouch: true` (a mobile device profile).
- Desktop projects have no touch support — mobile-specific tests must be scoped to
  mobile projects only.
- Use `testMatch` and `testIgnore` to control which spec files run under which
  project. A missing restriction causes a spec to run everywhere.
- One well-placed config fix can resolve multiple downstream symptoms when they
  share a root cause.

## Factual Verification (Official / Authoritative Sources)

Confirmed that `page.tap()` requires touch support enabled at the browser-context
level, which desktop device profiles do not provide:

- Playwright official docs, [Touchscreen class](https://playwright.dev/docs/next/api/class-touchscreen):
  touchscreen methods can only be used in browser contexts initialized with
  `hasTouch` set to true. (Content rephrased for compliance with licensing.)
- Playwright official docs, [Emulation](https://playwright.dev/java/docs/emulation):
  Playwright emulates real devices including whether the device `hasTouch` enabled.
  (Content rephrased for compliance.)
- Robot Framework Browser docs ([Touch, permissions and location](https://robotframework-browser.org/docs/mobile/touch/)):
  tap requires hasTouch on the context; a mobile device descriptor sets hasTouch,
  but the Desktop profiles and a bare viewport do not. (Content rephrased for compliance.)

Conclusion: `page.tap()` must run under a project using a mobile device descriptor
(e.g. `devices['Pixel 5']`, which sets `hasTouch: true`). Scoping the mobile spec
to the mobile-chrome project via `testIgnore` on the desktop project is the correct,
documented approach.

## Factual Verification for the testIgnore / testMatch Approach

- Playwright official docs, [Test projects](https://playwright.dev/docs/test-projects):
  a project is a logical group of tests running with the same configuration, used
  to run tests on different browsers/devices, and you can run all projects or a
  specific one. (Content rephrased for compliance.)
- StackOverflow ([run a particular test file](https://stackoverflow.com/questions/70460773/how-to-run-particular-file-with-playwright)):
  shows using `testMatch` within a dedicated project to scope files to that project
  without changing global config. (Content rephrased for compliance.)

Conclusion: using `testMatch`/`testIgnore` per project to scope which spec files
run under which project is the documented, intended mechanism.
