// =============================================================================
// TC_LOGIN_010 — Mobile Responsiveness
// Requirement: REQ-010 | Jira: PROJ-110
// Technique:   Non-functional / UI testing
//
// Runs under the 'mobile-chrome' Playwright project (Pixel 5 viewport).
// Viewport: 393 x 851 px — simulates an Android phone in portrait mode.
// =============================================================================

const { test, expect } = require('@playwright/test');

test('TC_LOGIN_010 — Login page is fully visible on mobile viewport', async ({ page }) => {
  await page.goto('/login');

  // Expected: email field visible without horizontal scrolling
  const emailField = page.locator('#email');
  await expect(emailField).toBeVisible();

  // Expected: password field visible
  const passwordField = page.locator('#password');
  await expect(passwordField).toBeVisible();

  // Expected: login button visible
  const loginBtn = page.locator('#login-btn');
  await expect(loginBtn).toBeVisible();

  // Expected: remember me checkbox visible
  const rememberMe = page.locator('#remember_me');
  await expect(rememberMe).toBeVisible();

  // Expected: forgot password link visible
  const forgotLink = page.locator('#forgot-password-link');
  await expect(forgotLink).toBeVisible();

  // Expected: no horizontal scroll — page width equals viewport width
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize().width;
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance

  // Expected: touch targets meet WCAG 2.1 minimum 44x44 CSS pixels
  const emailBox   = await emailField.boundingBox();
  const passwordBox = await passwordField.boundingBox();
  const loginBox   = await loginBtn.boundingBox();

  expect(emailBox.height).toBeGreaterThanOrEqual(44);
  expect(passwordBox.height).toBeGreaterThanOrEqual(44);
  expect(loginBox.height).toBeGreaterThanOrEqual(44);
});

test('TC_LOGIN_010b — Mobile login completes successfully end-to-end', async ({ page }) => {
  await page.goto('/login');

  // Tap email field and type (simulates on-screen keyboard)
  await page.tap('#email');
  await page.fill('#email', 'user@example.com');

  // Tap password field and type
  await page.tap('#password');
  await page.fill('#password', 'Password123!');

  // Tap login button
  await page.tap('#login-btn');

  // Expected: redirected to dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Expected: welcome message visible on mobile
  await expect(page.locator('#welcome-heading')).toBeVisible();
  await expect(page.locator('#welcome-heading')).toContainText('Welcome');

  // Expected: no horizontal scroll on dashboard either
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize().width;
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5);

  // Clean up
  await page.tap('#logout-btn');
  await expect(page).toHaveURL(/\/login/);
});

test('TC_LOGIN_010c — Mobile validation errors are visible without scrolling', async ({ page }) => {
  await page.goto('/login');

  // Submit empty form on mobile
  await page.tap('#login-btn');

  // Expected: validation errors visible in viewport
  const emailError = page.locator('#email-error');
  await expect(emailError).toBeVisible();
  await expect(emailError).toContainText('Email is required');

  const passwordError = page.locator('#password-error');
  await expect(passwordError).toBeVisible();
  await expect(passwordError).toContainText('Password is required');

  // Expected: still no horizontal scroll even with errors showing
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize().width;
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
});

test('TC_LOGIN_010d — Forgot password page is usable on mobile', async ({ page }) => {
  await page.goto('/forgot-password');

  const emailField = page.locator('#email');
  const submitBtn  = page.locator('#send-reset-btn');

  await expect(emailField).toBeVisible();
  await expect(submitBtn).toBeVisible();

  // Touch target check
  const emailBox  = await emailField.boundingBox();
  const submitBox = await submitBtn.boundingBox();

  expect(emailBox.height).toBeGreaterThanOrEqual(44);
  expect(submitBox.height).toBeGreaterThanOrEqual(44);

  // Complete the flow on mobile
  await page.tap('#email');
  await page.fill('#email', 'user@example.com');
  await page.tap('#send-reset-btn');

  // Expected: neutral confirmation message visible
  await expect(page.locator('#reset-confirmation')).toBeVisible();
});
