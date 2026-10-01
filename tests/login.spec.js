// =============================================================================
// Login Page — Playwright Test Suite
// Test Cases: TC_LOGIN_001 through TC_LOGIN_009
// App URL:    http://127.0.0.1:5000
//
// Prerequisites:
//   1. Flask app must be running:  python login_app/app.py
//   2. Run tests:                  npx playwright test
//   3. View HTML report:           npx playwright show-report
//
// Test Accounts (seeded by database.py):
//   user@example.com   / Password123!  — active account
//   locked@example.com / Password123!  — pre-locked account
//   reset@example.com  / Password123!  — account for reset flow
// =============================================================================

const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Navigate to login page and wait for it to be ready.
 */
async function goToLogin(page) {
  await page.goto('/login');
  await expect(page.locator('#login-form')).toBeVisible();
}

/**
 * Fill and submit the login form.
 */
async function submitLogin(page, email, password, rememberMe = false) {
  await page.fill('#email', email);
  await page.fill('#password', password);
  if (rememberMe) {
    await page.check('#remember_me');
  }
  await page.click('#login-btn');
}

/**
 * Reset the test user's failed_attempts and is_locked state via the
 * Flask reset endpoint so TC_LOGIN_005 does not pollute other tests.
 */
async function resetUserLockout(page) {
  await page.goto('/test/reset-lockout');
}

// ---------------------------------------------------------------------------
// TC_LOGIN_001 — Valid Login (Happy Path)
// Requirement: REQ-001 | Jira: PROJ-101
// Technique:   Happy path / Positive testing
// ---------------------------------------------------------------------------
test('TC_LOGIN_001 — Valid login redirects to dashboard', async ({ page }) => {
  await goToLogin(page);

  // Enter valid credentials
  await submitLogin(page, 'user@example.com', 'Password123!');

  // Expected: redirected to /dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Expected: welcome message contains user's name
  await expect(page.locator('#welcome-heading')).toBeVisible();
  await expect(page.locator('#welcome-heading')).toContainText('Welcome');

  // Expected: welcome section is present
  await expect(page.locator('#welcome-section')).toBeVisible();

  // Clean up — log out for next test
  await page.click('#logout-btn');
  await expect(page).toHaveURL(/\/login/);
});

// ---------------------------------------------------------------------------
// TC_LOGIN_002 — Invalid Password
// Requirement: REQ-002 | Jira: PROJ-102
// Technique:   Negative testing
// ---------------------------------------------------------------------------
test('TC_LOGIN_002 — Invalid password shows generic error', async ({ page }) => {
  await goToLogin(page);

  await submitLogin(page, 'user@example.com', 'WrongPassword99');

  // Expected: remain on login page
  await expect(page).toHaveURL(/\/login/);

  // Expected: generic error message — does NOT reveal which field is wrong
  const errorMsg = page.locator('#error-message');
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toContainText('Invalid email or password');

  // Expected: error does NOT say "password incorrect" or "email not found"
  await expect(errorMsg).not.toContainText('password incorrect');
  await expect(errorMsg).not.toContainText('email not found');
  await expect(errorMsg).not.toContainText('no account');
});

// ---------------------------------------------------------------------------
// TC_LOGIN_003 — Empty Fields Submission
// Requirement: REQ-003 | Jira: PROJ-103
// Technique:   Boundary / Validation testing
// ---------------------------------------------------------------------------
test('TC_LOGIN_003 — Empty fields show field-level validation errors', async ({ page }) => {
  await goToLogin(page);

  // Submit with both fields empty
  await page.click('#login-btn');

  // Expected: remain on login page
  await expect(page).toHaveURL(/\/login/);

  // Expected: email field error
  const emailError = page.locator('#email-error');
  await expect(emailError).toBeVisible();
  await expect(emailError).toContainText('Email is required');

  // Expected: password field error
  const passwordError = page.locator('#password-error');
  await expect(passwordError).toBeVisible();
  await expect(passwordError).toContainText('Password is required');
});

test('TC_LOGIN_003b — Only email entered — password error shown', async ({ page }) => {
  await goToLogin(page);

  await page.fill('#email', 'user@example.com');
  // Leave password empty
  await page.click('#login-btn');

  await expect(page).toHaveURL(/\/login/);

  const passwordError = page.locator('#password-error');
  await expect(passwordError).toBeVisible();
  await expect(passwordError).toContainText('Password is required');
});

// ---------------------------------------------------------------------------
// TC_LOGIN_004 — Special Characters / Security (SQL Injection + XSS)
// Requirement: REQ-004 | Jira: PROJ-104
// Technique:   Security testing (OWASP — SQLi, XSS)
// ---------------------------------------------------------------------------
test('TC_LOGIN_004 — SQL injection input is sanitized', async ({ page }) => {
  await goToLogin(page);

  await submitLogin(page, "'; DROP TABLE users;--", 'anything');

  // Expected: remain on login page — no crash, no redirect to dashboard
  await expect(page).toHaveURL(/\/login/);

  // Expected: standard invalid credentials error
  await expect(page.locator('#error-message')).toBeVisible();
  await expect(page.locator('#error-message')).toContainText('Invalid email or password');
});

test('TC_LOGIN_004b — XSS input in password field is not executed', async ({ page }) => {
  await goToLogin(page);

  // Listen for any dialog (alert) — XSS would trigger this
  let dialogFired = false;
  page.on('dialog', async (dialog) => {
    dialogFired = true;
    await dialog.dismiss();
  });

  await submitLogin(page, 'user@example.com', '<script>alert("xss")</script>');

  // Expected: no script executed, no alert dialog
  expect(dialogFired).toBe(false);

  // Expected: remain on login page with standard error
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('#error-message')).toBeVisible();
});

// ---------------------------------------------------------------------------
// TC_LOGIN_005 — Account Lockout After 5 Failed Attempts
// Requirement: REQ-005 | Jira: PROJ-105
// Technique:   State-based / Security testing
// ---------------------------------------------------------------------------
test('TC_LOGIN_005 — Account locks after 5 failed login attempts', async ({ page }) => {
  // Use the pre-locked test account to avoid side effects on user@example.com
  await goToLogin(page);

  await submitLogin(page, 'locked@example.com', 'Password123!');

  // Expected: lockout message shown
  const lockoutMsg = page.locator('#lockout-message');
  await expect(lockoutMsg).toBeVisible();
  await expect(lockoutMsg).toContainText('Account Locked');

  // Expected: still on login page — NOT redirected to dashboard
  await expect(page).toHaveURL(/\/login/);

  // Expected: login form is not shown (replaced by lockout panel)
  await expect(page.locator('#login-form')).not.toBeVisible();
});

test('TC_LOGIN_005b — Fresh account locks after 5 consecutive wrong passwords', async ({ page }) => {
  // Attempt login 5 times with wrong password for reset@example.com
  // Note: this test modifies reset@example.com state.
  // The seed data will re-create it on next app restart.
  for (let attempt = 1; attempt <= 5; attempt++) {
    await goToLogin(page);
    await submitLogin(page, 'reset@example.com', `WrongPass${attempt}`);
  }

  // On the 5th failure the account should now be locked
  // Try once more with correct password — should still be blocked
  await goToLogin(page);
  await submitLogin(page, 'reset@example.com', 'Password123!');

  await expect(page.locator('#lockout-message')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

// ---------------------------------------------------------------------------
// TC_LOGIN_006 — Forgot Password Flow
// Requirement: REQ-006 | Jira: PROJ-106
// Technique:   Workflow / Integration testing
// ---------------------------------------------------------------------------
test('TC_LOGIN_006 — Forgot password link navigates to reset page', async ({ page }) => {
  await goToLogin(page);

  // Click the forgot password link
  await page.click('#forgot-password-link');

  // Expected: navigated to forgot-password page
  await expect(page).toHaveURL(/\/forgot-password/);
  await expect(page.locator('#forgot-password-form')).toBeVisible();
});

test('TC_LOGIN_006b — Submit registered email shows neutral confirmation', async ({ page }) => {
  await page.goto('/forgot-password');

  await page.fill('#email', 'user@example.com');
  await page.click('#send-reset-btn');

  // Expected: neutral message shown (does not confirm if email exists)
  const confirmation = page.locator('#reset-confirmation');
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText('If this email is registered');
});

test('TC_LOGIN_006c — Submit unregistered email shows same neutral message', async ({ page }) => {
  await page.goto('/forgot-password');

  await page.fill('#email', 'notregistered@example.com');
  await page.click('#send-reset-btn');

  // Expected: SAME neutral message — prevents email enumeration
  const confirmation = page.locator('#reset-confirmation');
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText('If this email is registered');
});

// ---------------------------------------------------------------------------
// TC_LOGIN_007 — Remember Me Functionality
// Requirement: REQ-007 | Jira: PROJ-107
// Technique:   Functional / Persistence testing
// ---------------------------------------------------------------------------
test('TC_LOGIN_007 — Remember Me sets a persistent cookie', async ({ page }) => {
  await goToLogin(page);

  // Login with Remember Me checked
  await submitLogin(page, 'user@example.com', 'Password123!', true);
  await expect(page).toHaveURL(/\/dashboard/);

  // Check that a remember_token cookie exists with a future expiry
  const cookies = await page.context().cookies();
  const rememberCookie = cookies.find(
    c => c.name === 'remember_token' || c.name.includes('remember')
  );

  // Expected: a persistent remember cookie is set
  expect(rememberCookie).toBeDefined();

  // Expected: cookie has an expiry date (not a session cookie)
  // Session cookies have expires = -1; persistent cookies have a positive timestamp
  expect(rememberCookie.expires).toBeGreaterThan(0);

  // Clean up
  await page.click('#logout-btn');
});

test('TC_LOGIN_007b — Without Remember Me, session cookie only', async ({ page }) => {
  await goToLogin(page);

  // Login WITHOUT Remember Me
  await submitLogin(page, 'user@example.com', 'Password123!', false);
  await expect(page).toHaveURL(/\/dashboard/);

  const cookies = await page.context().cookies();

  // The remember_token cookie should NOT be present
  const rememberCookie = cookies.find(
    c => c.name === 'remember_token' || c.name.includes('remember')
  );
  expect(rememberCookie).toBeUndefined();

  // Clean up
  await page.click('#logout-btn');
});

// ---------------------------------------------------------------------------
// TC_LOGIN_008 — Session Timeout
// Requirement: REQ-008 | Jira: PROJ-108
// Technique:   Non-functional / State testing
//
// NOTE: We cannot wait 30 minutes in a test. Instead we:
//   1. Log in and verify the session works
//   2. Manually expire the session cookie
//   3. Attempt to access a protected page
//   4. Assert redirect to login with session-expired message
// ---------------------------------------------------------------------------
test('TC_LOGIN_008 — Expired session redirects to login page', async ({ page }) => {
  // Step 1: Log in
  await goToLogin(page);
  await submitLogin(page, 'user@example.com', 'Password123!');
  await expect(page).toHaveURL(/\/dashboard/);

  // Step 2: Simulate session expiry by deleting the session cookie
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  if (sessionCookie) {
    await page.context().clearCookies();
  }

  // Step 3: Attempt to access a protected page
  await page.goto('/dashboard');

  // Expected: redirected to login page
  await expect(page).toHaveURL(/\/login/);

  // Expected: login page is shown (form or flash message visible)
  await expect(page.locator('#login-form')).toBeVisible();
});

test('TC_LOGIN_008b — Session API returns unauthenticated after cookie cleared', async ({ page }) => {
  // Log in
  await goToLogin(page);
  await submitLogin(page, 'user@example.com', 'Password123!');
  await expect(page).toHaveURL(/\/dashboard/);

  // Verify session is active
  let response = await page.goto('/api/session-status');
  let body = await response.json();
  expect(body.authenticated).toBe(true);

  // Clear cookies to simulate timeout
  await page.context().clearCookies();

  // Verify session is now inactive
  response = await page.goto('/api/session-status');
  body = await response.json();
  expect(body.authenticated).toBe(false);
});

// ---------------------------------------------------------------------------
// TC_LOGIN_009 — Multiple Browser Tabs
// Requirement: REQ-009 | Jira: PROJ-109
// Technique:   Concurrency / State testing
// ---------------------------------------------------------------------------
test('TC_LOGIN_009 — Logout in one tab blocks access in another tab', async ({ browser }) => {
  // Create a browser context (shared cookies across tabs — same as real browser)
  const context = await browser.newContext();

  const tab1 = await context.newPage();
  const tab2 = await context.newPage();

  // Tab 1: Log in
  await tab1.goto('/login');
  await tab1.fill('#email', 'user@example.com');
  await tab1.fill('#password', 'Password123!');
  await tab1.click('#login-btn');
  await expect(tab1).toHaveURL(/\/dashboard/);

  // Tab 2: Verify the shared session gives access to dashboard
  await tab2.goto('/dashboard');
  await expect(tab2).toHaveURL(/\/dashboard/);
  await expect(tab2.locator('#welcome-section')).toBeVisible();

  // Tab 1: Log out
  await tab1.click('#logout-btn');
  await expect(tab1).toHaveURL(/\/login/);

  // Tab 2: Attempt to access a protected page after Tab 1 logged out
  await tab2.goto('/dashboard');

  // Expected: Tab 2 is now redirected to login — session is invalidated
  await expect(tab2).toHaveURL(/\/login/);
  await expect(tab2.locator('#login-form')).toBeVisible();

  await context.close();
});

test('TC_LOGIN_009b — Both tabs active while logged in share the same session', async ({ browser }) => {
  const context = await browser.newContext();
  const tab1 = await context.newPage();
  const tab2 = await context.newPage();

  // Log in on Tab 1
  await tab1.goto('/login');
  await tab1.fill('#email', 'user@example.com');
  await tab1.fill('#password', 'Password123!');
  await tab1.click('#login-btn');
  await expect(tab1).toHaveURL(/\/dashboard/);

  // Tab 2 should reflect the logged-in state immediately
  await tab2.goto('/dashboard');
  await expect(tab2).toHaveURL(/\/dashboard/);
  await expect(tab2.locator('#welcome-heading')).toContainText('Welcome');

  await context.close();
});
test('TC_LOGIN_PRACTICE — Forgot password link navigates and confirms message', async ({ page }) => {

    // ARRANGE — get to the starting point
    await page.goto('/login');

    // ACT — user actions
    await page.click('#forgot-password-link');    // click forgot password link
    await page.fill('#email', 'user@example.com');       // fill email field
    await page.click('#send-reset-btn');        // click send reset button

    // ASSERT — verify what should have happened
    await expect(page).toHaveURL(/\/forgot-password/);              // check the URL
    await expect(page.locator('#reset-confirmation')).toBeVisible();  // check the message exists
    await expect(page.locator('#reset-confirmation')).toContainText('If this email is registered'); // check the message text

});
