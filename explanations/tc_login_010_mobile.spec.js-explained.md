# tc_login_010_mobile.spec.js — Line by Line Explanation

**File location:** `tests/tc_login_010_mobile.spec.js`
**Purpose:** The mobile responsiveness test file. Covers TC_LOGIN_010 across 4 tests. Runs under the `mobile-chrome` Playwright project (Pixel 5 viewport: 393×851px) AND under `chromium-desktop` (due to no `testMatch` restriction on desktop). Uses mobile-specific interactions like `page.tap()` and assertions for WCAG touch target sizes and no horizontal scrolling.

---

## File Header

```javascript
const { test, expect } = require('@playwright/test');
```
**Line 12** — Same import as `login.spec.js`. Imports `test` and `expect` from the Playwright test package.

---

## TC_LOGIN_010 — Login Page Visible on Mobile Viewport

```javascript
test('TC_LOGIN_010 — Login page is fully visible on mobile viewport', async ({ page }) => {
  await page.goto('/login');
```
**Lines 14–15** — Opens the login page. When this test runs under `mobile-chrome`, the browser viewport is already set to 393×851px (Pixel 5) by the project config. No additional viewport setup is needed in the test itself — the config handles it.

---

```javascript
  const emailField = page.locator('#email');
  await expect(emailField).toBeVisible();
  const passwordField = page.locator('#password');
  await expect(passwordField).toBeVisible();
  const loginBtn = page.locator('#login-btn');
  await expect(loginBtn).toBeVisible();
  const rememberMe = page.locator('#remember_me');
  await expect(rememberMe).toBeVisible();
  const forgotLink = page.locator('#forgot-password-link');
  await expect(forgotLink).toBeVisible();
```
**Lines 18–30** — Visibility assertions for every interactive element on the login page.
- Each element is stored in a named variable first — avoids calling `page.locator()` multiple times on the same element
- `toBeVisible()` checks that the element: exists in the DOM, is not hidden with `display: none` or `visibility: hidden`, and has non-zero dimensions
- Tests that none of these elements are clipped off-screen or hidden on mobile

---

```javascript
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize().width;
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
```
**Lines 33–35** — No horizontal scrolling assertion.
- `page.evaluate(() => ...)` — runs JavaScript code inside the browser (not in Node.js). Returns the result to Playwright.
- `document.body.scrollWidth` — the total scrollable width of the page content in pixels. If content overflows the viewport, this is larger than the viewport width.
- `page.viewportSize().width` — the current browser viewport width (393px for Pixel 5, 1280px for Desktop Chrome)
- `expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)` — asserts no horizontal overflow. The `+ 5` is a 5-pixel tolerance for sub-pixel rendering differences.
- If any element is wider than the viewport, `scrollWidth > viewportWidth` and this test fails

---

```javascript
  const emailBox   = await emailField.boundingBox();
  const passwordBox = await passwordField.boundingBox();
  const loginBox   = await loginBtn.boundingBox();

  expect(emailBox.height).toBeGreaterThanOrEqual(44);
  expect(passwordBox.height).toBeGreaterThanOrEqual(44);
  expect(loginBox.height).toBeGreaterThanOrEqual(44);
```
**Lines 38–45** — WCAG 2.1 touch target size assertions.
- `element.boundingBox()` — returns the element's size and position as an object: `{ x, y, width, height }`
- `height >= 44` — WCAG 2.1 Success Criterion 2.5.5 requires interactive controls to be at least 44×44 CSS pixels for touch accessibility
- The `min-height: 44px` CSS rule on inputs and buttons in `login.html` is what makes these assertions pass
- If a developer removed or changed that CSS rule, these tests would catch the regression

---

## TC_LOGIN_010b — Mobile Login End-to-End

```javascript
test('TC_LOGIN_010b — Mobile login completes successfully end-to-end', async ({ page }) => {
  await page.goto('/login');

  await page.tap('#email');
  await page.fill('#email', 'user@example.com');
  await page.tap('#password');
  await page.fill('#password', 'Password123!');
  await page.tap('#login-btn');
```
**Lines 52–61** — Mobile interaction using `page.tap()`.
- `page.tap('#email')` — simulates a finger tap on a touch screen. Different from `page.click()` — tap fires touch events (`touchstart`, `touchend`) that some mobile-specific behaviors depend on.
- `page.fill('#email', 'user@example.com')` — types into the field after tapping it (simulates keyboard input after tapping to focus)
- The tap → fill → tap → fill → tap sequence mirrors exactly what a real user does on a mobile device: tap the field to open the keyboard, type, tap next field, type, tap submit.

---

```javascript
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('#welcome-heading')).toBeVisible();
  await expect(page.locator('#welcome-heading')).toContainText('Welcome');
```
**Lines 64–66** — Dashboard assertions after mobile login.
- Same assertions as TC_LOGIN_001 — confirms the full authentication flow works on mobile, not just that the form looks right

---

```javascript
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize().width;
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
```
**Lines 69–71** — No horizontal scroll check on the dashboard page too.
- Tests both the login page AND the dashboard for horizontal overflow on mobile
- A responsive login page with a broken dashboard is still a mobile failure

---

```javascript
  await page.tap('#logout-btn');
  await expect(page).toHaveURL(/\/login/);
```
**Lines 74–75** — Cleanup using `tap()` on the logout button. Consistent with the mobile interaction pattern.

---

## TC_LOGIN_010c — Mobile Validation Errors Visible

```javascript
test('TC_LOGIN_010c — Mobile validation errors are visible without scrolling', async ({ page }) => {
  await page.goto('/login');
  await page.tap('#login-btn');
```
**Lines 81–84** — Submits the form empty on mobile by tapping the button.

---

```javascript
  const emailError = page.locator('#email-error');
  await expect(emailError).toBeVisible();
  await expect(emailError).toContainText('Email is required');

  const passwordError = page.locator('#password-error');
  await expect(passwordError).toBeVisible();
  await expect(passwordError).toContainText('Password is required');
```
**Lines 86–93** — Validation error assertions.
- Same assertions as TC_LOGIN_003 but executed on a mobile viewport
- Tests that error messages do not push the layout off-screen or get hidden on small screens

---

```javascript
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize().width;
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
```
**Lines 96–98** — No horizontal scroll even with error messages showing.
- Error messages add vertical height — the test confirms they do not also add horizontal width
- A layout that works without errors could still break when errors appear and add content

---

## TC_LOGIN_010d — Forgot Password Page Usable on Mobile

```javascript
test('TC_LOGIN_010d — Forgot password page is usable on mobile', async ({ page }) => {
  await page.goto('/forgot-password');

  const emailField = page.locator('#email');
  const submitBtn  = page.locator('#send-reset-btn');

  await expect(emailField).toBeVisible();
  await expect(submitBtn).toBeVisible();
```
**Lines 102–111** — Navigates directly to the forgot password page and checks element visibility.

---

```javascript
  const emailBox  = await emailField.boundingBox();
  const submitBox = await submitBtn.boundingBox();

  expect(emailBox.height).toBeGreaterThanOrEqual(44);
  expect(submitBox.height).toBeGreaterThanOrEqual(44);
```
**Lines 113–118** — WCAG touch target checks on the forgot password page.
- Same `boundingBox().height >= 44` pattern as TC_LOGIN_010
- Tests that the forgot password page also meets WCAG standards — not just the main login page

---

```javascript
  await page.tap('#email');
  await page.fill('#email', 'user@example.com');
  await page.tap('#send-reset-btn');
  await expect(page.locator('#reset-confirmation')).toBeVisible();
```
**Lines 121–124** — End-to-end forgot password flow on mobile.
- Taps to focus, fills the email field, taps submit
- Asserts the neutral confirmation message `#reset-confirmation` appears
- Confirms the full forgot password interaction works on a touch device, not just that it looks right

---

## Key Differences from login.spec.js

| Feature | login.spec.js | tc_login_010_mobile.spec.js |
|---|---|---|
| Viewport | Desktop (1280×720) | Mobile (393×851 on mobile-chrome project) |
| Click method | `page.click()` | `page.tap()` (touch events) |
| Scroll check | Not tested | `document.body.scrollWidth` assertion |
| Touch targets | Not tested | `boundingBox().height >= 44` assertion |
| Purpose | Functional behavior | Visual + touch accessibility |

---

## Why This File is Separate from login.spec.js

- Mobile tests need `page.tap()` instead of `page.click()` — different interaction model
- Mobile tests check scroll width and touch target sizes — assertions not relevant to desktop tests
- Separating the file allows `playwright.config.js` to run it under both the `chromium-desktop` project (without mobile config) AND the `mobile-chrome` project (with Pixel 5 viewport) using the `testMatch` setting
- Keeping mobile tests separate makes it easier to add more mobile-specific tests later without cluttering the desktop test file
