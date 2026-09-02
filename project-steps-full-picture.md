# Project Steps: The Full Picture
## How Everything Aligns from Start to Finish — Login Page QA Project

---

## Overview

This document shows the complete, ordered steps to execute a QA project for a Login Page. Every tool, framework, document, and technique is placed in the exact order it is used and explained in context. Nothing exists in isolation — every item connects to the one before and after it.

---

## The Full Picture (End-to-End Flow)

```
PHASE 1: Requirements
Business Requirements / User Stories
        ↓
Acceptance Criteria written by Product Owner
        ↓
RTM created — maps every requirement to test cases

PHASE 2: Test Planning
Test Plan written — scope, tools, timeline, risks

PHASE 3: Test Case Design
Test Cases designed using ISTQB techniques
Stored and managed in a Test Management Tool

PHASE 4: Environment Setup
Test environment, test data, and tools configured

PHASE 5: Test Execution
Tests run manually and/or automated via Playwright
Defects raised → Defect Lifecycle begins

PHASE 6: Test Closure
RTM updated with Pass/Fail status
Test Closure Report produced
Acceptance Criteria sign-off → Feature ships
```

---

## Step-by-Step Breakdown

---

### STEP 1 — Gather and Analyze Requirements
**STLC Phase: 1 — Requirement Analysis**

Before any testing begins, the QA team reads and analyzes what the feature is supposed to do.

**What happens:**
- Business Analyst or Product Manager writes requirements
- Product Owner writes Acceptance Criteria for each user story
- QA team reviews both and identifies what is testable
- Gaps or ambiguities are raised and resolved before testing starts

**Documents produced:**
- Business Requirements Document (BRD) or User Stories in Jira
- Acceptance Criteria (written per user story)
- Initial draft of the Requirements Traceability Matrix (RTM)

**Tools used:**
| Tool | Purpose |
|---|---|
| **Jira** | Store user stories and acceptance criteria |
| **Confluence** | Document BRD and project context |
| **Figma / Wireframes** | Understand visual and behavioral expectations |
| **Azure DevOps** | Alternative to Jira for requirements management |

**Login Page Example:**
- REQ-001: Valid credentials redirect to dashboard
- REQ-002: Invalid credentials show a generic error
- REQ-003: Empty fields trigger field-level validation
- REQ-004: SQL injection and XSS inputs are sanitized
- REQ-005: Account locks after 5 failed attempts
- REQ-006: Password reset email sent within 2 minutes
- REQ-007: Session expires after 30 minutes of inactivity

---

### STEP 2 — Write the Test Plan
**STLC Phase: 2 — Test Planning**

The Test Plan is the master document that governs the entire QA effort. It is written by the QA Lead before any test cases are created.

**What a Test Plan includes:**
- Scope: what is being tested (login page) and what is not (out of scope)
- Test objectives: what the testing needs to prove
- Test approach: manual, automated, or both
- Tools to be used: Playwright, TestRail, Jira
- Resources: who does what
- Timeline and milestones
- Entry and exit criteria (when testing starts and when it is done)
- Risks: what could go wrong and how to handle it

**Tools used:**
| Tool | Purpose |
|---|---|
| **Confluence** | Write and store the Test Plan document |
| **Jira** | Track test planning tasks as tickets |
| **TestRail / Zephyr** | Create the test plan structure inside the tool |

---

### STEP 3 — Design and Write Test Cases
**STLC Phase: 3 — Test Case Design and Development**

Test cases are designed using **ISTQB Black-Box Testing Techniques**. These are internationally recognized techniques taught in the ISTQB Foundation Level certification.

**ISTQB Testing Techniques Used:**

| Technique | Category | Login Page Application |
|---|---|---|
| **Equivalence Partitioning** | Black-Box | Valid email group vs. invalid email group |
| **Boundary Value Analysis** | Black-Box | Password at min/max character length |
| **Decision Table Testing** | Black-Box | All combinations of email/password valid/invalid |
| **State Transition Testing** | Black-Box | Account: Active → Locked → Unlocked |
| **Use Case Testing** | Black-Box | Full forgot-password workflow |
| **Error Guessing** | Experience-Based | SQL injection, XSS, blank spaces |
| **Security Testing** | Non-Functional (OWASP) | TC_LOGIN_004 — injection attacks |
| **Usability / Responsive Testing** | Non-Functional | TC_LOGIN_010 — mobile layout |

**Where these techniques come from:**
All Black-Box techniques originate from the **ISTQB (International Software Testing Qualifications Board)** Foundation Level Syllabus. ISTQB is the global standard certification body for software testing. The CTFL (Certified Tester Foundation Level) certification covers all of these techniques and is the most recognized QA certification worldwide.

**The 10 Test Cases and their techniques:**

| Test Case ID | Title | Technique |
|---|---|---|
| TC_LOGIN_001 | Valid Login | Happy Path / Positive Testing |
| TC_LOGIN_002 | Invalid Password | Negative Testing |
| TC_LOGIN_003 | Empty Fields | Boundary / Validation Testing |
| TC_LOGIN_004 | Special Characters | Security Testing (SQLi, XSS) |
| TC_LOGIN_005 | Account Lockout | State-Based / Security Testing |
| TC_LOGIN_006 | Forgot Password | Workflow / Integration Testing |
| TC_LOGIN_007 | Remember Me | Functional / Persistence Testing |
| TC_LOGIN_008 | Session Timeout | Non-Functional / State Testing |
| TC_LOGIN_009 | Multiple Browser Tabs | Concurrency / State Testing |
| TC_LOGIN_010 | Mobile Responsive | Non-Functional / UI Testing |

**Test Case ID Convention:**
- Created by the QA Lead or QA Engineer
- Format: `TC_[MODULE]_[NUMBER]` → `TC_LOGIN_001`
- In TestRail/Zephyr, IDs are auto-generated with a defined prefix
- IDs are used in bug reports, sprint planning, and RTM tracking

**How expected results are determined:**
1. Read the Acceptance Criteria — the "Then" clause becomes the expected result
2. Read requirements and wireframes
3. Apply industry standards (OWASP for security, WCAG for accessibility)
4. Ask developers or product owners when unclear
5. Reference previous working behavior for regression tests

**Tools used:**
| Tool | Purpose |
|---|---|
| **TestRail** | Write, store, and manage test cases; link to requirements |
| **Zephyr Scale** | Native Jira test case management |
| **Xray for Jira** | Native Jira test management with built-in RTM |
| **Azure DevOps Test Plans** | Microsoft-stack alternative |
| **Excel / Google Sheets** | Simple option for beginners |
| **XMind / Miro** | Mind-map scenarios before writing cases |

---

### STEP 4 — Build the Requirements Traceability Matrix (RTM)
**STLC Phase: 3 — Test Case Design (continues)**

The RTM maps every requirement to the test case(s) that verify it. It ensures no requirement is untested and provides proof of coverage.

**Sample RTM for Login Page:**

| Requirement ID | Requirement Description | Test Case(s) | Priority | Status |
|---|---|---|---|---|
| REQ-001 | Valid login redirects to dashboard | TC_LOGIN_001 | High | Pending |
| REQ-002 | Invalid credentials show generic error | TC_LOGIN_002 | High | Pending |
| REQ-003 | Empty fields trigger validation | TC_LOGIN_003 | High | Pending |
| REQ-004 | SQL injection and XSS blocked | TC_LOGIN_004 | Medium | Pending |
| REQ-005 | Account locks after 5 failed attempts | TC_LOGIN_005 | High | Pending |
| REQ-006 | Password reset email within 2 minutes | TC_LOGIN_006 | Medium | Pending |
| REQ-007 | Remember Me persists session | TC_LOGIN_007 | Medium | Pending |
| REQ-008 | Session expires after 30 min idle | TC_LOGIN_008 | High | Pending |
| REQ-009 | Multi-tab session handled correctly | TC_LOGIN_009 | Medium | Pending |
| REQ-010 | Login page is mobile responsive | TC_LOGIN_010 | Medium | Pending |

**Why the RTM matters:**
- Proves 100% requirement coverage to stakeholders
- Identifies requirements with no test cases (coverage gaps)
- Shows which requirements are passing or failing at any point
- Required in regulated industries (healthcare, finance, government)

**Tools that generate RTM automatically:**
- Xray for Jira (best — auto-generates from linked requirements)
- Zephyr Scale (built into Jira)
- TestRail (via requirement linking + coverage reports)
- Azure DevOps (via work item traceability)

---

### STEP 5 — Set Up the Test Environment
**STLC Phase: 4 — Test Environment Setup**

Before executing tests, the environment must be prepared.

**What this includes:**
- Staging server with the login page deployed
- Test user accounts created (valid accounts, locked accounts, expired accounts)
- Test database seeded with known data
- Playwright installed and configured
- Test management tool (TestRail/Zephyr) configured with test runs
- CI/CD pipeline set up (optional but recommended)

**Tools used:**
| Tool | Purpose |
|---|---|
| **Playwright** | Install and configure for browser automation |
| **Docker** | Spin up consistent test environments |
| **GitHub Actions / Jenkins** | Run Playwright tests in CI/CD pipeline |
| **TestRail / Zephyr** | Create a Test Run assigned to the team |

---

### STEP 6 — Execute Tests
**STLC Phase: 5 — Test Execution**

Tests are run against the live staging environment. Results are recorded. Defects are raised for any failures.

**Manual Execution:**
- QA Tester follows the test steps in TestRail/Zephyr
- Marks each test as Pass, Fail, or Blocked
- Attaches screenshots/videos as evidence

**Automated Execution (Playwright):**
```bash
npx playwright test --reporter=html
```
- Playwright runs all test scripts
- Results written to HTML/JUnit XML report
- CI pipeline can auto-run on every code push

**What the automated framework does:**
- Opens a real browser
- Fills in fields, clicks buttons, submits forms
- Asserts that outcomes match expected results
- Produces a pass/fail report in seconds
- No human interaction required

**What the test management tool does:**
- Tracks which test cases have been executed
- Records who ran them and when
- Shows overall pass/fail/blocked statistics
- Provides test coverage metrics
- Links failures to defects

**These two work together — not in place of each other.**

---

### STEP 7 — Manage Defects (Defect Lifecycle)
**STLC Phase: 5 — Test Execution (parallel process)**

Every time a test case fails, a defect is raised. The defect travels through its lifecycle until it is verified fixed and closed.

**Defect Lifecycle:**

```
New
  ↓
Assigned (to developer)
  ↓
In Progress (developer fixes it)
  ↓
Fixed (developer marks it done)
  ↓
Ready for Retest (QA re-runs the test case)
  ↓
Retest Pass → Closed
Retest Fail → Reopened → back to Assigned
```

**Defect connects back to test case:**
- Example: TC_LOGIN_005 fails → Defect raised: "Account not locked after 5 failed attempts"
- Defect is linked to TC_LOGIN_005 and REQ-005 in Jira
- Developer fixes → QA re-runs TC_LOGIN_005 → Pass → Defect Closed
- RTM updated: REQ-005 → TC_LOGIN_005 → Pass

**Tools used:**
| Tool | Purpose |
|---|---|
| **Jira** | Log, assign, and track defects through their lifecycle |
| **TestRail / Zephyr** | Link defects to specific test cases |
| **Slack / Teams** | Notify developers of new defects |

---

### STEP 8 — Update the RTM and Report
**STLC Phase: 6 — Test Closure**

After all tests are executed and defects are resolved, the RTM is updated to final status.

**Final RTM (example after execution):**

| Requirement ID | Test Case(s) | Status | Defect ID |
|---|---|---|---|
| REQ-001 | TC_LOGIN_001 | Pass | — |
| REQ-002 | TC_LOGIN_002 | Pass | — |
| REQ-003 | TC_LOGIN_003 | Pass | — |
| REQ-004 | TC_LOGIN_004 | Pass | — |
| REQ-005 | TC_LOGIN_005 | Pass (after fix) | DEF-042 (Closed) |
| REQ-006 | TC_LOGIN_006 | Pass | — |
| REQ-007 | TC_LOGIN_007 | Pass | — |
| REQ-008 | TC_LOGIN_008 | Pass | — |
| REQ-009 | TC_LOGIN_009 | Pass | — |
| REQ-010 | TC_LOGIN_010 | Pass | — |

---

### STEP 9 — Test Closure and Sign-Off
**STLC Phase: 6 — Test Closure**

**Test Closure Report includes:**
- Total test cases: 10
- Passed: 10 | Failed: 0 | Blocked: 0
- Defects raised: 1 | Defects closed: 1
- Test coverage: 100% of requirements traced
- Exit criteria met: Yes
- QA Lead sign-off: approved
- Product Owner sign-off on Acceptance Criteria: approved

**Feature ships to production.**

---

## Complete Tool Stack Summary

| Category | Tool Options | Phase Used |
|---|---|---|
| **Requirements Management** | Jira, Azure DevOps, Confluence | Phase 1 |
| **Test Planning** | Confluence, TestRail, Zephyr | Phase 2 |
| **Test Case Management** | TestRail, Zephyr Scale, Xray, Azure DevOps | Phase 3 |
| **RTM + Traceability** | Xray for Jira, Zephyr, TestRail, Azure DevOps | Phase 3–4 |
| **Test Execution (Manual)** | TestRail, Zephyr, Xray | Phase 5 |
| **Test Execution (Automated)** | Playwright, Cypress, Selenium | Phase 5 |
| **CI/CD Integration** | GitHub Actions, Jenkins, Azure Pipelines | Phase 5 |
| **Defect Management** | Jira, Azure DevOps | Phase 5–6 |
| **Test Reporting** | TestRail reports, Playwright HTML report, Allure | Phase 6 |

---

## STLC Alignment Summary

| STLC Phase | Activity | Key Output |
|---|---|---|
| 1. Requirement Analysis | Read requirements, acceptance criteria | RTM draft, testability analysis |
| 2. Test Planning | Write Test Plan | Test Plan document |
| 3. Test Case Design | Write 10 test cases using ISTQB techniques (expanded to 25 Playwright tests) | Test cases in TestRail/Zephyr |
| 4. Environment Setup | Configure staging, test data, Playwright | Ready-to-run environment |
| 5. Test Execution | Run tests manually + automated | Pass/Fail results, defects in Jira |
| 6. Test Closure | Update RTM, write report, get sign-off | Test Closure Report |

---

## ISTQB Certification Relevance

All testing techniques used in this project come from the **ISTQB Foundation Level (CTFL)** syllabus. Getting CTFL certified formally validates your knowledge of:
- Test design techniques (the methods used to write the 10 test cases)
- STLC phases (the structure that organized this project)
- Defect lifecycle (how bugs are tracked from found to fixed)
- Test planning and reporting
- Test management tools and automation concepts

ISTQB CTFL is the most recognized QA certification globally and is listed on most QA Tester and SDET job postings as a preferred or required qualification.
