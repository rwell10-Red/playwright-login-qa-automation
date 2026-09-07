# Login Page — Requirements, Acceptance Criteria, and RTM
## Role: Product Owner / Business Analyst
## Project: Login Page QA Project
## Version: 1.0
## Date: September 2, 2026

---

## Document Purpose

This document serves as the single source of truth for what the Login Page must do, how success is defined for each requirement, and how every requirement maps to the test cases that verify it. It is authored from the perspective of the Product Owner and Business Analyst before any testing begins.

This document feeds directly into:
- TestRail (test cases are written from acceptance criteria)
- Jira (requirements become Jira tickets; each gets a PROJ- ID)
- The Requirements Traceability Matrix at the bottom of this document

---

## Project Context

**Product:** Web Application — Login Page
**Stakeholders:** Product Owner, Development Team, QA Team, Security Team, UX Designer
**Goal:** Allow registered users to securely authenticate into the application. The login page must handle valid credentials, invalid inputs, security threats, account states, and session management correctly across all devices.

---

## Part 1: Functional Requirements

Functional requirements describe what the system must do. Each requirement has a unique ID that will be used in Jira and the RTM.

---

### REQ-001 — Valid Login and Redirect

**Jira Ticket:** PROJ-5
**Priority:** High
**Source:** Business need — core authentication flow

**Requirement Statement:**
The system shall authenticate a registered user when a valid email address and correct password are submitted, and shall redirect the user to the application dashboard.

**Business Reason:**
This is the primary function of the login page. Without this working correctly, no user can access the application.

**Assumptions:**
- The user account is active and not locked
- The email and password match a record in the authentication database
- The user has not exceeded failed login attempts

---

### REQ-002 — Invalid Credentials Error Handling

**Jira Ticket:** PROJ-6
**Priority:** High
**Source:** Security requirement + UX requirement

**Requirement Statement:**
The system shall display a generic error message when an incorrect email, incorrect password, or unregistered email is submitted. The error message shall not reveal which specific field is incorrect.

**Business Reason:**
Revealing which field is wrong (e.g., "email not found") helps attackers enumerate valid accounts. A generic message prevents this.

**Assumptions:**
- The error message reads: "Invalid email or password. Please try again."
- No distinction is made between wrong email and wrong password in the error message

---

### REQ-003 — Empty Field Validation

**Jira Ticket:** PROJ-7
**Priority:** High
**Source:** UX requirement + form validation standard

**Requirement Statement:**
The system shall validate that both the email and password fields are populated before submitting the login form. If either or both fields are empty, field-level error messages shall be displayed and no authentication request shall be sent to the server.

**Business Reason:**
Prevents unnecessary API calls and provides clear feedback to the user about what is required.

**Assumptions:**
- Validation is triggered on form submit attempt
- Field-level messages read: "Email is required" and "Password is required"
- Fields with only whitespace are treated as empty

---

### REQ-004 — Security: Input Sanitization

**Jira Ticket:** PROJ-8
**Priority:** High
**Source:** Security requirement — OWASP Top 10

**Requirement Statement:**
The system shall sanitize all input entered into the email and password fields to prevent SQL injection and Cross-Site Scripting (XSS) attacks. Malicious input shall be rejected, and the system shall return a standard error response without executing any injected code.

**Business Reason:**
SQL injection and XSS are the most common web application attacks (OWASP Top 10). The login page is a high-value attack target and must be hardened.

**Assumptions:**
- Input is sanitized on both the client side (basic) and server side (primary defense)
- No script tags, SQL commands, or special character sequences are executed
- The server returns a standard 401 Unauthorized response for malicious input

---

### REQ-005 — Account Lockout After Failed Attempts

**Jira Ticket:** PROJ-9
**Priority:** High
**Source:** Security requirement — brute force protection

**Requirement Statement:**
The system shall lock a user account after 5 consecutive failed login attempts within a 15-minute window. A locked account shall not authenticate even with correct credentials until unlocked. The user shall be shown a lockout message and directed to reset their password or contact support.

**Business Reason:**
Prevents brute force attacks where an attacker repeatedly guesses passwords.

**Assumptions:**
- The lockout counter resets after 15 minutes of no failed attempts
- The lockout message reads: "Your account has been locked due to too many failed attempts. Please reset your password or contact support."
- Account unlock can be done via password reset or by an admin
- The failed attempt counter is tracked server-side, not client-side

---

### REQ-006 — Forgot Password / Password Reset Flow

**Jira Ticket:** PROJ-10
**Priority:** Medium
**Source:** Business requirement — user self-service

**Requirement Statement:**
The system shall provide a "Forgot Password?" link on the login page that initiates a self-service password reset flow. The flow shall: accept a registered email address, send a password reset email to that address within 2 minutes, provide a single-use reset link that expires after 60 minutes, and allow the user to set a new password that meets complexity requirements.

**Business Reason:**
Users forget passwords. A self-service reset reduces support tickets and improves user experience.

**Assumptions:**
- The reset link is cryptographically signed and single-use
- If the submitted email is not registered, the system shows a neutral message: "If this email is registered, you will receive a reset link." (prevents email enumeration)
- New password must meet complexity: minimum 8 characters, at least one uppercase, one number, one special character
- Expired or already-used reset links return: "This reset link has expired or already been used."

---

### REQ-007 — Remember Me (Persistent Session)

**Jira Ticket:** PROJ-11
**Priority:** Medium
**Source:** UX requirement — convenience feature

**Requirement Statement:**
The system shall provide a "Remember Me" checkbox on the login page. When selected and login is successful, the system shall store a persistent authentication token that maintains the user's logged-in state for 30 days, or until the user explicitly logs out.

**Business Reason:**
Improves user experience for users who regularly access the application from personal devices.

**Assumptions:**
- When "Remember Me" is not selected, the session is a standard browser session (expires on browser close)
- The persistent token is stored in an HttpOnly, Secure cookie
- The 30-day period resets on each subsequent login with "Remember Me" checked
- Remember Me does not apply to shared/public device scenarios — that is a user responsibility

---

### REQ-008 — Session Timeout for Inactive Sessions

**Jira Ticket:** PROJ-12
**Priority:** High
**Source:** Security requirement

**Requirement Statement:**
The system shall automatically invalidate a user's session after 30 consecutive minutes of inactivity. Upon session expiration, the user shall be redirected to the login page with a notification message. Any protected resources shall be inaccessible without re-authentication.

**Business Reason:**
Prevents unauthorized access if a user leaves their session open on an unattended device.

**Assumptions:**
- "Inactivity" means no user interactions (clicks, keystrokes, API calls) for 30 minutes
- The session expiry message reads: "Your session has expired due to inactivity. Please log in again."
- Any unsaved work or in-progress actions at timeout are the user's responsibility
- The 30-minute timer resets on any user activity

---

### REQ-009 — Multi-Tab Session Consistency

**Jira Ticket:** PROJ-13
**Priority:** Medium
**Source:** Technical requirement — session state management

**Requirement Statement:**
The system shall maintain consistent session state across multiple browser tabs within the same browser instance. When a user logs out in one tab, all other open tabs shall reflect the logged-out state and shall not allow access to protected resources without re-authentication.

**Business Reason:**
Users frequently work in multiple tabs. Inconsistent session state creates security vulnerabilities and confusing user experiences.

**Assumptions:**
- Session state is managed via a shared authentication token (e.g., session cookie or localStorage token)
- Logout in one tab invalidates the server-side session token
- Other tabs attempting protected resource access receive a 401 response and redirect to login
- Opening multiple tabs while logged in is not treated as a security violation — only inconsistent logout behavior is

---

### REQ-010 — Mobile Responsive Design

**Jira Ticket:** PROJ-14
**Priority:** Medium
**Source:** UX requirement — multi-device support

**Requirement Statement:**
The login page shall be fully usable on mobile devices with screen widths from 320px to 428px. All interactive elements shall be accessible without horizontal scrolling. Touch targets (buttons, input fields) shall meet WCAG 2.1 minimum size requirements of 44x44 CSS pixels. The login flow shall complete successfully on a mobile browser.

**Business Reason:**
A significant portion of users access the application from mobile devices. An unusable mobile login page blocks those users entirely.

**Assumptions:**
- Testing covers portrait orientation as the primary mode
- "Fully usable" means all fields, labels, buttons, and error messages are visible and interactable
- No content is clipped or hidden on a 375px viewport (iPhone standard)
- Mobile browsers tested: Chrome for Android, Safari for iOS

---

## Part 2: Non-Functional Requirements

Non-functional requirements describe how well the system must perform its functions.

| ID | Requirement | Priority | Jira Ticket |
|---|---|---|---|
| NFR-001 | Login page shall load in under 2 seconds on a standard broadband connection | Medium | TBD |
| NFR-002 | The login page shall be WCAG 2.1 Level AA accessible | Medium | TBD |
| NFR-003 | The system shall support at least 1,000 concurrent login requests without degradation | Low | TBD |
| NFR-004 | All authentication tokens shall be transmitted over HTTPS only | High | TBD |
| NFR-005 | Passwords shall never be stored in plain text — bcrypt hashing required | High | TBD |

---

## Part 3: Acceptance Criteria

Acceptance Criteria are written in Gherkin format (Given / When / Then). These are the exact conditions that must be true for a requirement to be considered "done." They become the direct source of Expected Results in every test case.

---

### AC-001 — Valid Login (REQ-001)

```gherkin
Feature: User Login

  Scenario: Successful login with valid credentials
    Given I am a registered user with an active account
    And I am on the login page
    When I enter my registered email address "user@example.com"
    And I enter my correct password "Password123!"
    And I click the "Login" button
    Then I should be redirected to the application dashboard
    And I should see a welcome message containing my name
    And my session should be established
```

---

### AC-002 — Invalid Credentials (REQ-002)

```gherkin
  Scenario: Login attempt with incorrect password
    Given I am on the login page
    When I enter a registered email address
    And I enter an incorrect password
    And I click the "Login" button
    Then I should remain on the login page
    And I should see the message "Invalid email or password. Please try again."
    And the password field should be cleared
    And no session should be established

  Scenario: Login attempt with unregistered email
    Given I am on the login page
    When I enter an email address that is not registered
    And I enter any password
    And I click the "Login" button
    Then I should see the same message "Invalid email or password. Please try again."
    And the response should not reveal whether the email exists
```

---

### AC-003 — Empty Fields (REQ-003)

```gherkin
  Scenario: Submit login form with both fields empty
    Given I am on the login page
    When I click the "Login" button without entering any data
    Then I should see "Email is required" below the email field
    And I should see "Password is required" below the password field
    And no authentication request should be sent to the server

  Scenario: Submit login form with only email entered
    Given I am on the login page
    When I enter a valid email address
    And I leave the password field empty
    And I click the "Login" button
    Then I should see "Password is required" below the password field
    And no authentication request should be sent to the server
```

---

### AC-004 — Input Sanitization (REQ-004)

```gherkin
  Scenario: SQL injection attempt in login fields
    Given I am on the login page
    When I enter "'; DROP TABLE users;--" in the email field
    And I enter any value in the password field
    And I click the "Login" button
    Then no SQL command should be executed
    And I should see the standard error message "Invalid email or password. Please try again."
    And the database should remain intact

  Scenario: XSS attempt in login fields
    Given I am on the login page
    When I enter "<script>alert('xss')</script>" in the password field
    And I click the "Login" button
    Then no script should execute in the browser
    And I should see the standard error message
```

---

### AC-005 — Account Lockout (REQ-005)

```gherkin
  Scenario: Account locked after 5 failed attempts
    Given I am a registered user with an active unlocked account
    And I am on the login page
    When I enter my correct email and an incorrect password 5 times consecutively
    Then my account should be locked
    And I should see "Your account has been locked due to too many failed attempts. Please reset your password or contact support."
    And subsequent login attempts with my correct password should be rejected
    And the lockout should persist until the account is unlocked
```

---

### AC-006 — Forgot Password (REQ-006)

```gherkin
  Scenario: Initiate password reset with registered email
    Given I am on the login page
    When I click the "Forgot Password?" link
    And I enter my registered email address
    And I click "Send Reset Link"
    Then I should see "If this email is registered, you will receive a reset link."
    And a password reset email should arrive within 2 minutes
    And the reset link in the email should be valid and single-use
    And the reset link should expire after 60 minutes

  Scenario: Complete password reset and log in with new password
    Given I have received a valid password reset link
    When I click the reset link
    And I enter a new password that meets complexity requirements
    And I confirm the new password
    And I submit the form
    Then my password should be updated
    And I should be able to log in with my new password
    And the reset link should no longer be valid
```

---

### AC-007 — Remember Me (REQ-007)

```gherkin
  Scenario: Login with Remember Me checked
    Given I am on the login page
    When I enter valid credentials
    And I check the "Remember Me" checkbox
    And I click the "Login" button
    Then I should be redirected to the dashboard
    And a persistent authentication cookie should be set with 30-day expiry
    And when I close and reopen the browser and navigate to the app
    Then I should still be logged in without re-entering credentials

  Scenario: Login without Remember Me checked
    Given I am on the login page
    When I enter valid credentials
    And I do NOT check the "Remember Me" checkbox
    And I click the "Login" button
    Then a session cookie (non-persistent) should be set
    And when I close and reopen the browser
    Then I should be prompted to log in again
```

---

### AC-008 — Session Timeout (REQ-008)

```gherkin
  Scenario: Session expires after 30 minutes of inactivity
    Given I am logged into the application
    When I have not performed any action for 30 consecutive minutes
    And I attempt to navigate to a protected page or perform an action
    Then my session should be invalidated
    And I should be redirected to the login page
    And I should see "Your session has expired due to inactivity. Please log in again."
    And I should not be able to access any protected resource without logging in again
```

---

### AC-009 — Multi-Tab Session Consistency (REQ-009)

```gherkin
  Scenario: Logout in one tab reflects in all tabs
    Given I am logged in and have the application open in Tab 1 and Tab 2
    When I log out in Tab 1
    And I switch to Tab 2
    And I attempt to access a protected resource
    Then I should be redirected to the login page in Tab 2
    And I should not be able to access protected data without re-authenticating
```

---

### AC-010 — Mobile Responsive (REQ-010)

```gherkin
  Scenario: Login page is usable on a mobile device
    Given I open the login page on a mobile device with a 375px wide screen
    Then the email field should be fully visible and tappable
    And the password field should be fully visible and tappable
    And the "Login" button should be fully visible and tappable
    And no horizontal scrolling should be required
    And all touch targets should be at least 44x44 CSS pixels
    When I enter valid credentials and tap "Login"
    Then I should be redirected to the dashboard successfully
```

---

## Part 4: Requirements Traceability Matrix (RTM)

The RTM links every requirement to its Jira ticket, acceptance criteria, test case, and current execution status. This is the master coverage document.

| Req ID | Jira Ticket | Requirement Summary | Acceptance Criteria | Test Case ID | Test Case Title | Priority | Execution Status | Defect ID |
|---|---|---|---|---|---|---|---|---|
| REQ-001 | PROJ-5 | Valid login redirects to dashboard | AC-001 | TC_LOGIN_001 | Valid Login (Happy Path) | High | Not Run | — |
| REQ-002 | PROJ-6 | Invalid credentials show generic error | AC-002 | TC_LOGIN_002 | Invalid Password | High | Not Run | — |
| REQ-003 | PROJ-7 | Empty fields trigger validation messages | AC-003 | TC_LOGIN_003 | Empty Fields Submission | High | Not Run | — |
| REQ-004 | PROJ-8 | SQL injection and XSS inputs are sanitized | AC-004 | TC_LOGIN_004 | Special Characters / Security | Medium | Not Run | — |
| REQ-005 | PROJ-9 | Account locks after 5 failed attempts | AC-005 | TC_LOGIN_005 | Account Lockout | High | Not Run | — |
| REQ-006 | PROJ-10 | Password reset email sent within 2 minutes | AC-006 | TC_LOGIN_006 | Forgot Password Flow | Medium | Not Run | — |
| REQ-007 | PROJ-11 | Remember Me persists session 30 days | AC-007 | TC_LOGIN_007 | Remember Me Functionality | Medium | Not Run | — |
| REQ-008 | PROJ-12 | Session expires after 30 min inactivity | AC-008 | TC_LOGIN_008 | Session Timeout | High | Not Run | — |
| REQ-009 | PROJ-13 | Logout in one tab affects all tabs | AC-009 | TC_LOGIN_009 | Multiple Browser Tabs | Medium | Not Run | — |
| REQ-010 | PROJ-14 | Login page usable on 375px mobile screen | AC-010 | TC_LOGIN_010 | Mobile Responsiveness | Medium | Not Run | — |
| NFR-001 | TBD | Page loads under 2 seconds | — | TC_PERF_001 | Performance Load Test | Medium | Not Run | — |
| NFR-002 | TBD | WCAG 2.1 Level AA accessible | — | TC_A11Y_001 | Accessibility Audit | Medium | Not Run | — |
| NFR-004 | TBD | HTTPS only for auth tokens | — | TC_SEC_001 | HTTPS Token Transmission | High | Not Run | — |
| NFR-005 | TBD | Passwords hashed with bcrypt | — | TC_SEC_002 | Password Storage Audit | High | Not Run | — |

---

## Part 5: Definition of Done

A requirement is considered "Done" when ALL of the following are true:

- [ ] The requirement is implemented by the development team
- [ ] All linked acceptance criteria are met
- [ ] The linked test case(s) have been executed and passed
- [ ] Any defects raised against this requirement are in "Closed" status
- [ ] The RTM shows "Pass" for all linked test cases
- [ ] QA Lead has signed off on the test execution results
- [ ] Product Owner has confirmed the acceptance criteria are satisfied

---

## Document Sign-Off

| Role | Name | Status | Date |
|---|---|---|---|
| Product Owner | [Product Owner Name] | Pending Approval | — |
| Business Analyst | [BA Name] | Pending Approval | — |
| QA Lead | [QA Lead Name] | Pending Review | — |
| Tech Lead | [Tech Lead Name] | Pending Review | — |
