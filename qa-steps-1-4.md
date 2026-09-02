# QA Steps 1–4: Test Case Design for a Login Page

---

## Step 1: Choose a Test Case Template

The standard test case template used in QA/SDET roles:

| Field | Description |
|---|---|
| **Test Case ID** | Unique identifier (e.g., TC_LOGIN_001) |
| **Test Title** | Short description of what's being tested |
| **Preconditions** | What must be true before the test runs |
| **Test Steps** | Numbered actions the tester performs |
| **Test Data** | Input values used |
| **Expected Result** | What should happen if the system works correctly |
| **Actual Result** | What actually happened (filled during execution) |
| **Status** | Pass / Fail / Blocked |
| **Priority** | High / Medium / Low |

This template works for manual testing, and maps directly to automated test frameworks like Selenium, Playwright, or Cypress.

---

## Step 2: Understand the Test Design Process

Before writing tests, think through these layers:

1. **Identify the feature** — Login Page
2. **List all behaviors** — what can a user do? What can go wrong?
3. **Apply test techniques:**
   - *Equivalence Partitioning* — group inputs into valid/invalid classes
   - *Boundary Value Analysis* — test at the edges (e.g., max password length)
   - *Negative Testing* — intentionally provide bad inputs
4. **Map to requirements** — each test case should trace back to a requirement
5. **Prioritize** — High priority = core happy path and security cases

---

## Step 3: The 10 Test Cases (25 Playwright Tests Total)

> **Note:** The 10 test cases below are the original QA design cases from the requirements.
> When implemented in Playwright, each case was expanded into sub-variants, producing
> 25 automated tests across 2 browser projects (21 desktop + 4 mobile).
> See `tests/login.spec.js` and `tests/tc_login_010_mobile.spec.js` for the full implementation.

---

### TC_LOGIN_001 — Valid Login (Happy Path)
**Priority:** High

**Preconditions:** User account exists and is active

**Test Steps:**
1. Navigate to the login page
2. Enter a valid registered email address
3. Enter the correct password
4. Click the "Login" button

**Test Data:** `user@example.com` / `Password123!`

**Expected Result:** User is redirected to the dashboard/home page and a welcome message is shown

---

### TC_LOGIN_002 — Invalid Password
**Priority:** High

**Preconditions:** User account exists

**Test Steps:**
1. Navigate to the login page
2. Enter a valid registered email address
3. Enter an incorrect password
4. Click the "Login" button

**Test Data:** `user@example.com` / `WrongPass99`

**Expected Result:** Login fails. Error message shown: *"Invalid email or password"* (generic — never reveal which field is wrong, for security)

---

### TC_LOGIN_003 — Empty Fields Submission
**Priority:** High

**Preconditions:** User is on the login page

**Test Steps:**
1. Leave both the email and password fields blank
2. Click the "Login" button

**Test Data:** (empty) / (empty)

**Expected Result:** Form validation triggers. Error messages appear on both fields: *"Email is required"* and *"Password is required"*. No API call is made.

---

### TC_LOGIN_004 — Special Characters in Fields
**Priority:** Medium

**Preconditions:** User is on the login page

**Test Steps:**
1. Enter special characters in the email field
2. Enter special characters in the password field
3. Click "Login"

**Test Data:** `'; DROP TABLE users;--` / `<script>alert(1)</script>`

**Expected Result:** Input is sanitized. No SQL injection or XSS executes. System returns a standard invalid credentials error. This tests security hardening.

---

### TC_LOGIN_005 — Account Lockout After Failed Attempts
**Priority:** High

**Preconditions:** Account exists and is unlocked

**Test Steps:**
1. Enter valid email with wrong password
2. Repeat step 1 five times (or per lockout policy)
3. Attempt login again with the correct password

**Test Data:** `user@example.com` / `WrongPass` (repeated)

**Expected Result:** After the threshold is reached, the account is locked. Message shown: *"Your account has been locked. Please reset your password or contact support."* Correct credentials no longer grant access until unlocked.

---

### TC_LOGIN_006 — Forgot Password Flow
**Priority:** Medium

**Preconditions:** User has a registered email

**Test Steps:**
1. Click the "Forgot Password?" link on the login page
2. Enter the registered email address
3. Submit the form
4. Check email inbox
5. Click the reset link
6. Enter and confirm a new password

**Test Data:** `user@example.com`

**Expected Result:** Password reset email is sent within 2 minutes. Reset link is valid, single-use, and expires after a defined time (e.g., 1 hour). User can log in with the new password.

---

### TC_LOGIN_007 — Remember Me Functionality
**Priority:** Medium

**Preconditions:** User is on the login page, using a supported browser

**Test Steps:**
1. Enter valid credentials
2. Check the "Remember Me" checkbox
3. Click "Login"
4. Close the browser completely
5. Reopen the browser and navigate to the app

**Test Data:** `user@example.com` / `Password123!`

**Expected Result:** User is still logged in (or credentials are pre-filled) without being prompted to log in again. A persistent cookie/token should be set with an appropriate expiry.

---

### TC_LOGIN_008 — Session Timeout
**Priority:** High

**Preconditions:** User is logged in

**Test Steps:**
1. Log in successfully
2. Leave the session idle for longer than the timeout period (e.g., 30 minutes)
3. Attempt to perform an action or navigate to a protected page

**Test Data:** Active session, no user interaction for timeout duration

**Expected Result:** Session is invalidated. User is redirected to the login page with a message: *"Your session has expired. Please log in again."* No protected data is accessible.

---

### TC_LOGIN_009 — Login Across Multiple Browser Tabs
**Priority:** Medium

**Preconditions:** User is on the login page

**Test Steps:**
1. Open the login page in Tab 1
2. Open the same login page in Tab 2
3. Log in successfully in Tab 1
4. Switch to Tab 2 and attempt to also submit the login form
5. Log out in Tab 1
6. Switch to Tab 2 and attempt to access a protected page

**Expected Result:**
- Login in Tab 1 succeeds
- Tab 2 reflects the authenticated state (or handles the duplicate gracefully)
- After logout in Tab 1, Tab 2 should not retain access to protected resources

---

### TC_LOGIN_010 — Mobile Responsiveness
**Priority:** Medium

**Preconditions:** Access to a mobile device or browser dev tools (responsive mode)

**Test Steps:**
1. Open the login page on a mobile browser (or simulate 375px viewport in DevTools)
2. Inspect the layout of the email field, password field, and login button
3. Tap each field and type using the on-screen keyboard
4. Submit the form with valid credentials

**Expected Result:**
- All elements are visible and usable without horizontal scrolling
- Touch targets (buttons, inputs) are large enough (min 44x44px per WCAG)
- The page is readable without zooming
- Login completes successfully on mobile

---

## Step 4: How to Organize These in Practice

Once written, store test cases in a tool like:

- **Spreadsheet** (Excel/Google Sheets) — best for beginners, easy to share
- **TestRail / Zephyr / Xray** — professional test management tools
- **Markdown / Notion** — great for dev teams using docs-as-code
- **Automated framework** (Playwright, Cypress, JUnit) — when you convert manual cases to code

Each test case ID (`TC_LOGIN_001`) lets you trace it in bug reports, sprint planning, and test runs.

---

## Quick Summary of Techniques Used

| Test Case | Technique |
|---|---|
| TC_LOGIN_001 | Happy path / positive testing |
| TC_LOGIN_002 | Negative testing |
| TC_LOGIN_003 | Boundary / validation testing |
| TC_LOGIN_004 | Security testing (SQLi, XSS) |
| TC_LOGIN_005 | State-based / security testing |
| TC_LOGIN_006 | Workflow / integration testing |
| TC_LOGIN_007 | Functional / persistence testing |
| TC_LOGIN_008 | Non-functional / state testing |
| TC_LOGIN_009 | Concurrency / state testing |
| TC_LOGIN_010 | Non-functional / UI testing |

---

## Who Creates the Test Case ID?

The **QA Lead or QA Engineer** creates and owns the Test Case ID. The naming convention is decided by the team and documented in the **Test Plan**.

Common conventions:
```
TC_[MODULE]_[NUMBER]     →  TC_LOGIN_001
[PROJECT_CODE]-TC-[NUMBER]  →  PROJ-TC-042
[FEATURE]-[PRIORITY]-[NUMBER]  →  LOGIN-HIGH-001
```

In tools like TestRail or Zephyr, the ID is auto-generated when you create a new test case. You define the prefix (e.g., `C` → `C1001`).

The ID is used to:
- Reference the test case in bug reports ("Bug found during TC_LOGIN_005")
- Link to requirements in the RTM
- Track pass/fail rates per test in reports

---

## How Would the QA Tester Know the Expected Results?

Expected results come from:

1. **Requirements / Acceptance Criteria** — the product manager or BA writes what should happen
2. **Design Specifications / Wireframes** — Figma or mockup files show UI behavior
3. **User Stories with Acceptance Criteria (Gherkin format)**
   ```
   Given I am a registered user
   When I enter valid credentials and click Login
   Then I should be redirected to my dashboard
   And I should see "Welcome, [Name]" in the header
   ```
   The *Then* clause = the expected result.
4. **Previous Behavior (Regression Testing)** — what it used to do correctly becomes the baseline
5. **Industry Standards** — e.g., OWASP standards dictate SQL injection must be blocked
6. **Asking Developers / Product Owners** — documented and added to the test case

---

## Test Case Template Options

### Option 1: Simple Table (Spreadsheet / Excel)
Best for beginners and small teams.
```
| ID | Title | Steps | Test Data | Expected Result | Status |
```

### Option 2: Detailed Template (TestRail Style)
Best for enterprise teams.
```
| ID | Module | Title | Priority | Preconditions |
| Steps | Test Data | Expected Result | Actual Result |
| Status | Assigned To | Linked Requirement | Notes |
```

### Option 3: Gherkin / BDD Style (Cucumber / Playwright)
Best for dev+QA collaboration.
```gherkin
Feature: Login Page

  Scenario: Valid login
    Given I am on the login page
    When I enter "user@example.com" and "Password123!"
    And I click the Login button
    Then I should be redirected to the dashboard
```

### Option 4: Exploratory Test Charter
Best for unscripted, investigative testing.
```
Charter: Explore the login page session handling
Target: Session timeout and multi-tab behavior
Time: 60 minutes
Notes: [tester documents findings as they go]
```

For this login page project, **Option 2 or 3** is the best fit.
