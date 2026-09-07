# Playwright Test Writing — Pattern, Syntax, and Process

---

## What Playwright Is

Playwright is a test execution engine — it controls a real browser programmatically.
It does not write tests on its own. The SDET or QA Automation Engineer writes the
test scripts. Playwright executes them.

The relationship:
  Playwright = the tool (like Microsoft Word)
  Test scripts = the work product (like the document you write)
  SDET = the person who writes them

---

## The Universal Test Pattern — AAA

Every Playwright test — and every automated test in any framework — follows the
same four-part structure called AAA: Arrange, Act, Assert, Cleanup.

```
1. ARRANGE   — set up the starting state
               navigate to the page, create conditions needed

2. ACT       — perform the user action
               fill fields, click buttons, submit forms

3. ASSERT    — verify the outcome
               check URL, text, visibility, cookies

4. CLEANUP   — reset state for the next test
               logout, clear cookies, reset database
```

If you remember nothing else about writing tests, remember AAA.
Every test you will ever write fits into these four parts.

---

## The Skeleton — What Every Test Looks Like

```javascript
test('description of what this test checks', async ({ page }) => {

    // 1. ARRANGE
    await page.goto('/login');

    // 2. ACT
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'Password123!');
    await page.click('#login-btn');

    // 3. ASSERT
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('#welcome-heading')).toBeVisible();

    // 4. CLEANUP
    await page.click('#logout-btn');

});
```

---

## Every Part of the Syntax Explained

### The test() function

```javascript
test('TC_LOGIN_001 — Valid login redirects to dashboard', async ({ page }) => {
```

- `test`             — the function that defines one test case
- The quoted string  — the test name. Appears in terminal output and HTML report.
                       Always include the test case ID so results map to TestRail.
- `async`            — the function is asynchronous. Browser actions take time.
                       async/await makes the code wait for each action to finish
                       before moving to the next line.
- `{ page }`         — Playwright's fixture injection. Playwright creates a fresh
                       browser page for each test automatically and passes it in.
                       You never create the page manually.

---

### await

```javascript
await page.goto('/login');
```

`await` appears before every browser action. It tells JavaScript:
"Wait for this to finish completely before running the next line."

Without await, all actions would fire simultaneously — the test would try to
click the login button before the page even loaded. Every browser command
in Playwright must be awaited.

---

### page.goto()

```javascript
await page.goto('/login');
```

Opens a URL in the browser.
- `/login` becomes `http://127.0.0.1:5000/login` automatically
  because baseURL is set in playwright.config.js
- Always the first line of the ARRANGE section
- Playwright waits for the page to finish loading before continuing

---

### page.fill()

```javascript
await page.fill('#email', 'user@example.com');
```

Finds an input field and types a value into it.
- First argument  — the CSS selector to find the element
- Second argument — the value to type
- Clears any existing content before typing
- Works on: text inputs, email inputs, password inputs, textareas

---

### page.click()

```javascript
await page.click('#login-btn');
```

Finds an element and clicks it.
- Works on: buttons, links, checkboxes, radio buttons, any clickable element
- Playwright automatically scrolls the element into view before clicking
- Playwright waits for the element to be visible and enabled before clicking

---

### page.check()

```javascript
await page.check('#remember_me');
```

Checks a checkbox. Use this instead of page.click() for checkboxes —
it ensures the box ends up checked regardless of its current state.

---

### page.tap()

```javascript
await page.tap('#login-btn');
```

Same as click but fires touch events instead of mouse events.
Used for mobile viewport tests (TC_LOGIN_010).
Simulates a finger tap on a touchscreen.

---

### expect() — The Assertion Library

Assertions are how you verify things worked correctly.
They are the ASSERT part of AAA.

If an assertion fails the test stops immediately and is marked as FAILED.
If all assertions pass the test is marked as PASSED.

Playwright retries assertions automatically for up to 5 seconds
(configured in playwright.config.js as expect.timeout: 5000).
This handles cases where the page takes a moment to update after an action.

---

### expect(page).toHaveURL()

```javascript
await expect(page).toHaveURL(/\/dashboard/);
```

Asserts the browser's current URL matches a pattern.
- `/\/dashboard/` is a JavaScript regular expression
- The `\` before `/` escapes the slash character inside the regex
- Matches any URL containing `/dashboard`:
  http://127.0.0.1:5000/dashboard → PASS
  http://127.0.0.1:5000/login    → FAIL

---

### expect(locator).toBeVisible()

```javascript
await expect(page.locator('#welcome-heading')).toBeVisible();
```

Asserts an element exists in the DOM AND is visible on screen.
Fails if the element:
  - Does not exist in the HTML
  - Has CSS: display: none
  - Has CSS: visibility: hidden
  - Has zero width or height

`page.locator('#welcome-heading')` finds the element with id="welcome-heading".

---

### expect(locator).toContainText()

```javascript
await expect(page.locator('#error-message')).toContainText('Invalid email or password');
```

Asserts the element's text contains the given string.
Partial match — does not need to be the full text.
"Invalid email or password. Please try again." contains "Invalid email or password" → PASS

---

### expect(locator).not.toBeVisible()

```javascript
await expect(page.locator('#login-form')).not.toBeVisible();
```

Negative assertion — asserts the element is NOT visible.
Add .not before any assertion to invert it.
Used in TC_LOGIN_005 to confirm the login form is hidden when the lockout panel shows.

---

### expect(locator).not.toContainText()

```javascript
await expect(page.locator('#error-message')).not.toContainText('password incorrect');
```

Asserts the element does NOT contain this text.
Used in TC_LOGIN_002 to verify the error message does not reveal which field is wrong.

---

## CSS Selectors — How to Find Elements

The selector is how Playwright finds an element on the page.
Always look at the HTML source to find the right selector.

### How to find a selector using Chrome DevTools

1. Open the Flask app at http://127.0.0.1:5000/login
2. Right-click the element you want to target
3. Click Inspect
4. Look at the HTML highlighted in DevTools
5. Find the id, name, or class attribute

Example — right-clicking the email field shows:
  <input type="email" id="email" name="email" ...>
  The id="email" gives you the selector: #email

### Selector types ranked by reliability

```javascript
'#email'                    // ID selector        — BEST. IDs are unique per page.
'[name="email"]'            // attribute selector — good fallback when no ID
'.field-error'              // class selector     — use when no ID or name exists
'button[type="submit"]'     // element + attribute — specific element type
'text=Log in'               // text selector      — finds by visible text
```

Always prefer #id selectors. That is why every interactive element in the
login app templates has an explicit id attribute — they were built for testing.

### All element IDs in the login app

Login page:
  #email                 — email input field
  #password              — password input field
  #remember_me           — remember me checkbox
  #login-btn             — login submit button
  #forgot-password-link  — forgot password link
  #error-message         — generic error banner
  #email-error           — email field validation error
  #password-error        — password field validation error
  #lockout-message       — account locked panel
  #login-form            — the entire login form

Dashboard:
  #welcome-heading       — "Welcome, Test User!" heading
  #welcome-section       — the welcome card container
  #logout-btn            — logout button
  #nav-user-name         — username in the navbar

Forgot password page:
  #email                 — email input
  #send-reset-btn        — send reset link button
  #forgot-password-form  — the form element
  #reset-confirmation    — neutral confirmation message
  #back-to-login         — back to login link

Reset password page:
  #password              — new password input
  #confirm_password      — confirm password input
  #reset-submit-btn      — update password button
  #reset-password-form   — the form element
  #error-message         — error banner

---

## The 6 Commands Used 90% of the Time

| Command | What It Does |
|---|---|
| page.goto('/path') | Navigate to a URL |
| page.fill('#id', 'value') | Type into an input field |
| page.click('#id') | Click an element |
| page.check('#id') | Check a checkbox |
| expect(page).toHaveURL(/pattern/) | Assert the current URL |
| expect(page.locator('#id')).toBeVisible() | Assert element is visible |

Master these six and you can write 80% of all login page tests.

---

## The 4 Questions — Mental Process for Any New Test

Before writing a single line of code, answer these four questions:

```
1. Where does the test start?
   → This becomes your page.goto() line

2. What does the user do?
   → These become your page.fill(), page.click(), page.check() lines

3. What should have happened?
   → These become your expect() assertion lines

4. What needs to be cleaned up?
   → This becomes your logout or cookie clear at the end
```

---

## Writing a Test From Scratch — Step by Step Example

Test case to write: TC_LOGIN_002 — Invalid password shows generic error

### Step 1 — Read the test case requirements
```
Preconditions: User account exists
Steps:         Enter valid email, wrong password, click Login
Expected:      Error message "Invalid email or password" appears
               Page stays on /login
               Error does not reveal which field is wrong
```

### Step 2 — Answer the 4 questions

```
Where does it start?    → /login page
What does the user do?  → fill email, fill wrong password, click login
What should happen?     → stay on /login, error message visible, correct text
Cleanup needed?         → No — test ended on the login page already
```

### Step 3 — Write the ARRANGE

```javascript
await page.goto('/login');
```

### Step 4 — Write the ACT

```javascript
await page.fill('#email', 'user@example.com');
await page.fill('#password', 'WrongPassword99');
await page.click('#login-btn');
```

### Step 5 — Write the ASSERT

```javascript
await expect(page).toHaveURL(/\/login/);
await expect(page.locator('#error-message')).toBeVisible();
await expect(page.locator('#error-message')).toContainText('Invalid email or password');
await expect(page.locator('#error-message')).not.toContainText('password incorrect');
await expect(page.locator('#error-message')).not.toContainText('email not found');
```

### Step 6 — Put it all together

```javascript
test('TC_LOGIN_002 — Invalid password shows generic error', async ({ page }) => {

    // Arrange
    await page.goto('/login');

    // Act
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'WrongPassword99');
    await page.click('#login-btn');

    // Assert
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toContainText('Invalid email or password');
    await expect(page.locator('#error-message')).not.toContainText('password incorrect');
    await expect(page.locator('#error-message')).not.toContainText('email not found');

});
```

That is the complete test. Same pattern used for every test in login.spec.js.

---

## Special Patterns for Advanced Test Cases

### Checking cookies (TC_LOGIN_007 — Remember Me)

```javascript
// Get all cookies for the current browser session
const cookies = await page.context().cookies();

// Find a specific cookie by name
const rememberCookie = cookies.find(c => c.name.includes('remember'));

// Assert the cookie exists
expect(rememberCookie).toBeDefined();

// Assert it has a future expiry (persistent, not session-only)
expect(rememberCookie.expires).toBeGreaterThan(0);
```

### Clearing cookies to simulate session expiry (TC_LOGIN_008)

```javascript
// Delete all cookies — simulates browser closing or session timeout
await page.context().clearCookies();

// Now try to access a protected page
await page.goto('/dashboard');

// Should redirect to login because session is gone
await expect(page).toHaveURL(/\/login/);
```

### Multi-tab testing (TC_LOGIN_009)

```javascript
// Use browser fixture instead of page fixture
test('multi-tab test', async ({ browser }) => {

    // Create one browser context (shared cookies = same browser window)
    const context = await browser.newContext();

    // Open two tabs in the same context
    const tab1 = await context.newPage();
    const tab2 = await context.newPage();

    // Actions on tab1
    await tab1.goto('/login');
    await tab1.fill('#email', 'user@example.com');
    await tab1.fill('#password', 'Password123!');
    await tab1.click('#login-btn');

    // Actions on tab2 (shares the session from tab1)
    await tab2.goto('/dashboard');
    await expect(tab2).toHaveURL(/\/dashboard/);

    // Always close the context when done
    await context.close();

});
```

### Detecting JavaScript dialogs — XSS test (TC_LOGIN_004)

```javascript
// Listen for any alert/confirm/prompt dialog
let dialogFired = false;
page.on('dialog', async (dialog) => {
    dialogFired = true;
    await dialog.dismiss();
});

// Perform the action that might trigger a dialog
await page.fill('#password', '<script>alert("xss")</script>');
await page.click('#login-btn');

// Assert no dialog appeared — XSS was blocked
expect(dialogFired).toBe(false);
```

### Measuring element dimensions — WCAG check (TC_LOGIN_010)

```javascript
// Get the size and position of an element
const loginBtn = page.locator('#login-btn');
const box = await loginBtn.boundingBox();
// box = { x: 0, y: 0, width: 380, height: 48 }

// Assert minimum touch target size
expect(box.height).toBeGreaterThanOrEqual(44);
expect(box.width).toBeGreaterThanOrEqual(44);
```

### Checking for horizontal scroll — mobile layout (TC_LOGIN_010)

```javascript
// Run JavaScript inside the browser and return the result
const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
const viewportWidth = page.viewportSize().width;

// Assert content does not overflow the viewport
expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
```

### Reading a JSON API response (TC_LOGIN_008)

```javascript
// Navigate to a JSON endpoint
const response = await page.goto('/api/session-status');

// Parse the JSON body
const body = await response.json();
// body = { "authenticated": true }

// Assert on the value
expect(body.authenticated).toBe(true);
```

---

## Practice Exercise

Try writing this test yourself using the pattern above.
Open tests/login.spec.js and add it at the bottom.

```
Test: Forgot password link is visible and navigates correctly

Preconditions: User is on the login page
Steps:         Click the forgot password link
Expected:      Browser navigates to /forgot-password
               The forgot password form is visible
```

Answer these 4 questions first without looking at existing tests:
  1. Where does it start?
  2. What does the user do?
  3. What should happen?
  4. Cleanup needed?

Then write the code. Compare your answer to TC_LOGIN_006 in login.spec.js.

---

## How Test Writing Connects to the Full QA Process

```
QA Tester writes test case in TestRail
  (Title, Steps, Expected Result)
          ↓
SDET translates that test case into Playwright code
  (same steps, same expected result — now automated)
          ↓
Playwright executes the code against the Flask app
  (opens browser, performs steps, checks assertions)
          ↓
Result reported in HTML report + TestRail + Jira
  (Pass → ticket moves to Done)
  (Fail → bug raised in Jira, defect lifecycle begins)
```

The test case written in TestRail and the Playwright test script
are the same test — one is the manual written version,
one is the automated code version. They verify the same thing.
