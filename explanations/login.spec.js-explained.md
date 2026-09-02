# login.spec.js — Line by Line Explanation

**File location:** `tests/login.spec.js`
**Purpose:** The main Playwright test file covering TC_LOGIN_001 through TC_LOGIN_009. Contains 17 individual tests organized by test case. Each test opens a real browser, interacts with the Flask app, and asserts that behavior matches the expected results defined in the requirements.

---

## File Header

```javascript
const { test, expect } = require('@playwright/test');
```
**Line 17** — Imports the two core Playwright testing tools.
- `test` — the function used to define a test case. Works like: `test('name', async ({ page }) => { ... })`
- `expect` — the assertion library. Used to verify that conditions are true. Works like: `expect(value).toBe(true)` or `expect(locator).toBeVisible()`
- `require('@playwright/test')` — CommonJS import from the locally installed `@playwright/test` package

---

## Shared Helper Functions

These three functions are defined at the top and reused across multiple tests to avoid repeating the same code.

---

```javascript
async function goToLogin(page) {
  await page.goto('/login');
  await expect(page.locator('#login-form')).toBeVisible();
}
```
**Lines 23–26** — Navigation helper.
- `async function` — must be async because browser operations take time and use `await`
- `page.goto('/login')` — navigates the browser to `http://127.0.0.1:5000/login` (baseURL from config)
- `await expect(page.locator('#login-form')).toBeVisible()` — waits for the login form to be visible before returning. This prevents tests from failing because they try to fill fields before the page has finished loading.
- Called at the start of almost every test

---

```javascript
async function submitLogin(page, email, password, rememberMe = false) {
  await page.fill('#email', email);
  await page.fill('#password', password);
  if (rememberMe) {
    await page.check('#remember_me');
  }
  await page.click('#login-btn');
}
```
**Lines 31–38** — Form submission helper.
- `rememberMe = false` — default parameter value. If not passed, Remember Me is not checked.
- `page.fill('#email', email)` — finds the element with `id="email"` and types the value into it (clears existing content first)
- `page.fill('#password', password)` — same for the password field
- `page.check('#remember_me')` — checks the checkbox (only if `rememberMe` is `true`)
- `page.click('#login-btn')` — clicks the login button and submits the form
- Using `#id` selectors is reliable because IDs are unique on a page and do not change with styling

---

```javascript
async function resetUserLockout(page) {
  await page.goto('/test/reset-lockout');
}
```
**Lines 43–45** — Lockout reset helper.
- Navigates to the Flask test helper endpoint that resets `user@example.com` and `reset@example.com`'s failed attempt counters
- Called between tests that modify lockout state to prevent test pollution
- Note: defined but the tests use `page.goto('/test/reset-lockout')` inline instead — the function is available if needed in future tests

---

## TC_LOGIN_001 — Valid Login

```javascript
test('TC_LOGIN_001 — Valid login redirects to dashboard', async ({ page }) => {
```
**Line 51** — Defines the test. The `async ({ page })` pattern is Playwright's fixture injection — Playwright creates a fresh browser page for each test and passes it as `page`.

---

```javascript
  await goToLogin(page);
  await submitLogin(page, 'user@example.com', 'Password123!');
```
**Lines 53–56** — Navigation and form submission using the helper functions.

---

```javascript
  await expect(page).toHaveURL(/\/dashboard/);
```
**Line 59** — Asserts the browser URL changed to `/dashboard`.
- `/\/dashboard/` — a JavaScript regular expression. The `\` escapes the `/` character in the pattern.
- Playwright retries this assertion for up to 5 seconds (from `expect.timeout` in config) — gives the Flask redirect time to complete.

---

```javascript
  await expect(page.locator('#welcome-heading')).toBeVisible();
  await expect(page.locator('#welcome-heading')).toContainText('Welcome');
  await expect(page.locator('#welcome-section')).toBeVisible();
```
**Lines 62–65** — Three assertions on the dashboard.
- `page.locator('#welcome-heading')` — finds the element with `id="welcome-heading"` in the DOM
- `.toBeVisible()` — asserts the element exists AND is visible (not hidden with CSS)
- `.toContainText('Welcome')` — asserts the element's text contains "Welcome" (partial match — works for "Welcome, Test User!")

---

```javascript
  await page.click('#logout-btn');
  await expect(page).toHaveURL(/\/login/);
```
**Lines 68–69** — Cleanup: logs out after the test so the session does not affect the next test.

---

## TC_LOGIN_002 — Invalid Password

```javascript
  const errorMsg = page.locator('#error-message');
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toContainText('Invalid email or password');
  await expect(errorMsg).not.toContainText('password incorrect');
  await expect(errorMsg).not.toContainText('email not found');
  await expect(errorMsg).not.toContainText('no account');
```
**Lines 84–92** — Assertions for the generic error message.
- `page.locator('#error-message')` — stored in a variable to avoid repeating the selector
- `.not.toContainText(...)` — negative assertion. Verifies the message does NOT contain these phrases. This tests the security requirement — the error must never reveal which field is wrong (REQ-002).

---

## TC_LOGIN_003 — Empty Fields

```javascript
  await page.click('#login-btn');
  await expect(page).toHaveURL(/\/login/);
  const emailError = page.locator('#email-error');
  await expect(emailError).toBeVisible();
  await expect(emailError).toContainText('Email is required');
  const passwordError = page.locator('#password-error');
  await expect(passwordError).toBeVisible();
  await expect(passwordError).toContainText('Password is required');
```
**Lines 109–120** — Empty form submission test.
- Clicks the button WITHOUT filling any fields
- Asserts the page stays on `/login` (no redirect)
- Asserts both field-level error messages appear
- These assertions match exactly what `login.html` renders when `errors.email` and `errors.password` are set

---

## TC_LOGIN_004 — Security Tests

```javascript
  await submitLogin(page, "'; DROP TABLE users;--", 'anything');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('#error-message')).toBeVisible();
  await expect(page.locator('#error-message')).toContainText('Invalid email or password');
```
**Lines 148–153** — SQL injection test.
- The string `'; DROP TABLE users;--` is the classic SQL injection attack. In raw SQL, this would close the current query and execute `DROP TABLE users`.
- SQLAlchemy's ORM uses parameterized queries, so this input is treated as a literal string — not SQL.
- Asserts the app stays on login and shows a standard error (no crash, no data loss).

---

```javascript
  let dialogFired = false;
  page.on('dialog', async (dialog) => {
    dialogFired = true;
    await dialog.dismiss();
  });
  await submitLogin(page, 'user@example.com', '<script>alert("xss")</script>');
  expect(dialogFired).toBe(false);
```
**Lines 163–173** — XSS test.
- `page.on('dialog', ...)` — registers a listener for browser dialog events (alert, confirm, prompt). XSS attacks using `alert()` would trigger this.
- `dialogFired = false` — starts as false
- If XSS executed, `alert("xss")` would fire a dialog, set `dialogFired = true`, and the test would fail
- `expect(dialogFired).toBe(false)` — confirms no dialog appeared — XSS was blocked
- Note: this is a synchronous `expect()` (no `await`) because `dialogFired` is a local variable, not a Playwright locator

---

## TC_LOGIN_005 — Account Lockout

```javascript
  await submitLogin(page, 'locked@example.com', 'Password123!');
  const lockoutMsg = page.locator('#lockout-message');
  await expect(lockoutMsg).toBeVisible();
  await expect(lockoutMsg).toContainText('Account Locked');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('#login-form')).not.toBeVisible();
```
**Lines 193–200** — Pre-locked account test.
- Uses `locked@example.com` which was seeded with `is_locked: True`
- `expect(page.locator('#login-form')).not.toBeVisible()` — the form should be completely replaced by the lockout panel when locked

---

```javascript
  for (let attempt = 1; attempt <= 5; attempt++) {
    await goToLogin(page);
    await submitLogin(page, 'reset@example.com', `WrongPass${attempt}`);
  }
```
**Lines 208–211** — Progressive lockout test using a JavaScript `for` loop.
- Loops 5 times, each time submitting a wrong password
- `WrongPass${attempt}` — template literal creating: WrongPass1, WrongPass2, etc.
- After 5 failures, the account is locked
- Then attempts with the correct password to confirm it is still blocked

---

## TC_LOGIN_006 — Forgot Password

```javascript
  await page.click('#forgot-password-link');
  await expect(page).toHaveURL(/\/forgot-password/);
  await expect(page.locator('#forgot-password-form')).toBeVisible();
```
**Lines 229–233** — Tests the link navigation. Confirms clicking the link takes you to the right page and the form is there.

---

```javascript
  const confirmation = page.locator('#reset-confirmation');
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText('If this email is registered');
```
**Lines 240–243** — Neutral message assertion. Tests that the exact phrase "If this email is registered" appears — the full message is "If this email is registered, you will receive a password reset link shortly."

---

## TC_LOGIN_007 — Remember Me

```javascript
  const cookies = await page.context().cookies();
  const rememberCookie = cookies.find(
    c => c.name === 'remember_token' || c.name.includes('remember')
  );
  expect(rememberCookie).toBeDefined();
  expect(rememberCookie.expires).toBeGreaterThan(0);
```
**Lines 275–284** — Cookie assertions.
- `page.context().cookies()` — retrieves all cookies for the current browser context
- `.find(c => ...)` — JavaScript array method that returns the first cookie matching the condition
- `c.name === 'remember_token' || c.name.includes('remember')` — checks for Flask-Login's remember me cookie by name
- `.toBeDefined()` — asserts the cookie was found (not undefined)
- `.toBeGreaterThan(0)` — cookie's expiry timestamp is a Unix timestamp. Session cookies have `-1`. Persistent cookies have a future timestamp like `1787827200`. Greater than 0 confirms it is persistent.

---

```javascript
  const rememberCookie = cookies.find(
    c => c.name === 'remember_token' || c.name.includes('remember')
  );
  expect(rememberCookie).toBeUndefined();
```
**TC_LOGIN_007b** — When Remember Me is NOT checked, asserts no remember cookie exists. `toBeUndefined()` is the inverse of `toBeDefined()`.

---

## TC_LOGIN_008 — Session Timeout

```javascript
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  if (sessionCookie) {
    await page.context().clearCookies();
  }
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
```
**Lines 332–341** — Session expiry simulation.
- `page.context().clearCookies()` — deletes ALL cookies for the browser context, including the session cookie
- Without the session cookie, Flask-Login does not recognize the user as authenticated
- Navigating to `/dashboard` then triggers the `@login_required` redirect
- This simulates session timeout without waiting 30 real minutes

---

```javascript
  let response = await page.goto('/api/session-status');
  let body = await response.json();
  expect(body.authenticated).toBe(true);
  await page.context().clearCookies();
  response = await page.goto('/api/session-status');
  body = await response.json();
  expect(body.authenticated).toBe(false);
```
**TC_LOGIN_008b** — API-level session verification.
- `page.goto()` returns a response object for non-HTML pages
- `response.json()` — parses the JSON body
- Tests the session is active (true) before clearing cookies, then inactive (false) after
- More precise than checking URL redirects — directly verifies what the server thinks about the session state

---

## TC_LOGIN_009 — Multiple Browser Tabs

```javascript
test('TC_LOGIN_009 ...', async ({ browser }) => {
  const context = await browser.newContext();
  const tab1 = await context.newPage();
  const tab2 = await context.newPage();
```
**Lines 366–371** — Multi-tab test setup.
- `{ browser }` — this test receives the `browser` fixture instead of `page`. The `browser` fixture gives lower-level control.
- `browser.newContext()` — creates a new browser context (a fresh browser profile with its own cookies, storage, and state — like a browser window)
- `context.newPage()` — creates a new tab within that context. Both `tab1` and `tab2` share the same cookies because they are in the same context. This matches how real browser tabs work.

---

```javascript
  await tab1.goto('/login');
  await tab1.fill('#email', 'user@example.com');
  await tab1.fill('#password', 'Password123!');
  await tab1.click('#login-btn');
  await expect(tab1).toHaveURL(/\/dashboard/);
```
**Lines 373–377** — Tab 1 logs in. Notice all Playwright actions are called on `tab1` specifically — not on `page`. Each tab is its own page object.

---

```javascript
  await tab2.goto('/dashboard');
  await expect(tab2).toHaveURL(/\/dashboard/);
  await expect(tab2.locator('#welcome-section')).toBeVisible();
```
**Lines 380–382** — Tab 2 accesses the dashboard without logging in separately. This works because `tab1` and `tab2` share the same cookie jar (same browser context), so the session from Tab 1's login is available to Tab 2.

---

```javascript
  await tab1.click('#logout-btn');
  await expect(tab1).toHaveURL(/\/login/);
  await tab2.goto('/dashboard');
  await expect(tab2).toHaveURL(/\/login/);
```
**Lines 385–390** — After Tab 1 logs out, Tab 2 can no longer access the dashboard. `logout_user()` in Flask invalidates the server-side session. Even though Tab 2 still has the session cookie in memory, the server rejects it.

---

```javascript
  await context.close();
```
**Line 393** — Closes the browser context and all its tabs. Important cleanup step — without this, the browser context would persist between tests.

---

## Key Playwright Concepts Used in This File

| Concept | Syntax | What It Does |
|---|---|---|
| Locator | `page.locator('#id')` | Finds an element by CSS selector |
| Fill | `page.fill('#id', 'value')` | Types text into an input field |
| Click | `page.click('#id')` | Clicks an element |
| Check | `page.check('#id')` | Checks a checkbox |
| Navigate | `page.goto('/path')` | Opens a URL in the browser |
| URL assertion | `expect(page).toHaveURL(/pattern/)` | Asserts current URL matches a regex |
| Visible assertion | `expect(locator).toBeVisible()` | Asserts element is visible |
| Text assertion | `expect(locator).toContainText('text')` | Asserts element contains text |
| Negative assertion | `expect(locator).not.toBeVisible()` | Asserts element is NOT visible |
| Cookie access | `page.context().cookies()` | Gets all cookies for the context |
| Cookie clear | `page.context().clearCookies()` | Deletes all cookies |
| New context | `browser.newContext()` | Creates isolated browser profile |
| New page | `context.newPage()` | Opens a new tab in the context |
