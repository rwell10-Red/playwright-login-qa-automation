# Sprint Review — Sprint 1: Login Page QA
## Project: Login Page QA — Week 1 Practical
## Sprint Dates: September 2 – September 2026
## Prepared By: Andre Rockwell (QA Engineer / SDET)
## Version: 1.0

---

## 1. Sprint Goal

> Verify all 10 login page functional requirements pass automated and manual testing
> so the feature is ready for release, and deliver a fully automated CI/CD test
> pipeline that pushes results to TestRail on every code push.

**Goal Status: ACHIEVED ✓**

---

## 2. What Was Planned

| Item | Description |
|---|---|
| **App Under Test** | Flask login web application (Python) |
| **Test Cases** | 10 functional test cases (TC_LOGIN_001–010) using ISTQB techniques |
| **Automation** | 25 Playwright tests across 2 browser projects |
| **Requirements** | 10 functional (REQ-001–010) + 5 NFRs (deferred) |
| **Tools** | Jira, TestRail, Playwright, GitHub Actions, trcli |
| **Traceability** | RTM linking REQ → Jira → TestRail → Playwright |

---

## 3. What Was Delivered

### 3.1 — The Flask Login Application

A fully functional login web application built from scratch covering all test
scenarios:

| Feature | Implemented |
|---|---|
| Valid login with session creation | ✓ |
| Invalid credentials — generic error (no field enumeration) | ✓ |
| Empty field server-side validation | ✓ |
| SQL injection and XSS input sanitization | ✓ |
| Account lockout after 5 failed attempts | ✓ |
| Forgot password with single-use expiring token | ✓ |
| Remember Me — 30-day persistent cookie | ✓ |
| Session timeout after 30 minutes inactivity | ✓ |
| Multi-tab logout consistency | ✓ |
| Mobile responsive — WCAG 2.1 touch targets | ✓ |

**App URL:** http://127.0.0.1:5000/login (local development server)
**Stack:** Python, Flask, Flask-Login, Flask-SQLAlchemy, SQLite
**Test Accounts seeded:**
- `user@example.com` / `Password123!` — active account
- `locked@example.com` / `Password123!` — pre-locked account
- `reset@example.com` / `Password123!` — password reset flow

---

### 3.2 — Test Cases

10 test cases designed using ISTQB Black-Box and Experience-Based techniques:

| Test Case | Technique | Priority | Result |
|---|---|---|---|
| TC_LOGIN_001 — Valid Login | Happy path / Positive testing | High | Pass |
| TC_LOGIN_002 — Invalid Password | Negative testing | High | Pass |
| TC_LOGIN_003 — Empty Fields | Boundary / Validation testing | High | Pass |
| TC_LOGIN_004 — SQL Injection + XSS | Security testing (OWASP) | Medium | Pass |
| TC_LOGIN_005 — Account Lockout | State-based / Security testing | High | Pass |
| TC_LOGIN_006 — Forgot Password | Workflow / Integration testing | Medium | Pass |
| TC_LOGIN_007 — Remember Me | Functional / Persistence testing | Medium | Pass |
| TC_LOGIN_008 — Session Timeout | Non-functional / State testing | High | Pass |
| TC_LOGIN_009 — Multiple Browser Tabs | Concurrency / State testing | Medium | Pass |
| TC_LOGIN_010 — Mobile Responsive | Non-functional / UI testing | Medium | Pass |

---

### 3.3 — Playwright Automated Test Suite

| Metric | Value |
|---|---|
| Total automated tests | 25 |
| Desktop (chromium-desktop project) | 21 tests |
| Mobile (mobile-chrome — Pixel 5 viewport) | 4 tests |
| Final run result | 25/25 Passed (100%) |
| Test file — desktop | tests/login.spec.js |
| Test file — mobile | tests/tc_login_010_mobile.spec.js |
| Playwright version | 1.62.1 |

---

### 3.4 — Requirements Traceability

Full four-tool traceability achieved across every requirement:

| Req ID | Jira | TestRail | Test Case | Result |
|---|---|---|---|---|
| REQ-001 | PROJ-5 | C46 | TC_LOGIN_001 | **Pass** |
| REQ-002 | PROJ-6 | C47 | TC_LOGIN_002 | **Pass** |
| REQ-003 | PROJ-7 | C48 | TC_LOGIN_003 | **Pass** |
| REQ-004 | PROJ-8 | C49 | TC_LOGIN_004 | **Pass** |
| REQ-005 | PROJ-9 | C50 | TC_LOGIN_005 | **Pass** |
| REQ-006 | PROJ-10 | C51 | TC_LOGIN_006 | **Pass** |
| REQ-007 | PROJ-11 | C52 | TC_LOGIN_007 | **Pass** |
| REQ-008 | PROJ-12 | C53 | TC_LOGIN_008 | **Pass** |
| REQ-009 | PROJ-13 | C54 | TC_LOGIN_009 | **Pass** |
| REQ-010 | PROJ-14 | C55 | TC_LOGIN_010 | **Pass** |

**Requirement coverage: 10/10 (100%)**
**NFRs (NFR-001, 002, 004, 005): Deferred to future sprint**

---

### 3.5 — CI/CD Pipeline

A fully automated pipeline built and running on GitHub Actions:

```
git push to main
        ↓
GitHub Actions triggers (ubuntu-latest)
        ↓
Installs Python 3.11 + Flask dependencies
Installs Node.js 20 + Playwright + Chromium
        ↓
Starts Flask app at http://127.0.0.1:5000
        ↓
Runs 25 Playwright tests (chromium-desktop + mobile-chrome)
        ↓
Uploads HTML report + JUnit XML as downloadable artifacts
        ↓
trcli pushes results to TestRail automatically
        ↓
TestRail run created with all results — no manual entry required
```

**Repository:** https://github.com/rwell10-Red/login-page-qa-week1
**Workflow file:** .github/workflows/playwright.yml
**Pipeline status:** Green ✓ (as of final run)

---

### 3.6 — Tool Stack Configured

| Tool | Purpose | Status |
|---|---|---|
| **Jira** (Rockwell space) | Requirements, sprint management | ✓ Configured |
| **TestRail** (Login Page QA — Week 1 Practical) | Test case management | ✓ Configured |
| **TestRail-Jira Integration** | Defect push + reference linking | ✓ Connected |
| **GitHub** (rwell10-Red/login-page-qa-week1) | Code hosting + CI/CD | ✓ Active |
| **trcli** (v1.15.2) | Automated TestRail result push | ✓ Working |

---

## 4. Test Execution Results

### 4.1 — Final Playwright Run

| Metric | Value |
|---|---|
| Total tests run | 25 |
| Passed | 25 |
| Failed | 0 |
| Pass rate | 100% |
| Execution time | ~1m32s (CI) |
| Execution environment | GitHub Actions ubuntu-latest |

### 4.2 — TestRail Automated Runs

Three automated runs pushed to TestRail by the pipeline:

| Run | Date | Tests | Result |
|---|---|---|---|
| Automated Playwright Run - GitHub Actions | 10/1/2026 | 21 | 100% Pass |
| Automated Playwright Run - GitHub Actions | 10/1/2026 | 21 | 100% Pass |
| Automated Playwright Run - GitHub Actions | 9/30/2026 | 21 | 100% Pass |
| Playwright Run (mobile-chrome) - GitHub Actions | 9/29/2026 | 4 | 100% Pass |

---

## 5. Defects

### 5.1 — Defect Raised and Resolved

| ID | Title | Test Case | Severity | Status |
|---|---|---|---|---|
| DEF-001 | Mobile tests fail with page.tap not supported on desktop project | TC_LOGIN_010b/c/d | Medium | **Closed** |

**Root Cause:** `tc_login_010_mobile.spec.js` was configured to run under both the
`chromium-desktop` and `mobile-chrome` Playwright projects. The desktop project uses
`Desktop Chrome` which has `hasTouch: false` — so `page.tap()` failed.

**Fix Applied:** Added `testIgnore: '**/tc_login_010_mobile.spec.js'` to the
`chromium-desktop` project in `playwright.config.js`. Mobile spec now runs only
under `mobile-chrome` (Pixel 5, `hasTouch: true`).

**Impact of Fix:** Resolved 3 additional downstream issues simultaneously:
1. Duplicate section error in the JUnit XML (both projects producing same section)
2. JUnit file overwrite (second run cleaning test-results/)
3. Fully automated trcli push to TestRail (unblocked by the clean XML)

### 5.2 — Defect Summary

| Metric | Value |
|---|---|
| Total defects raised | 1 |
| Defects closed | 1 |
| Defects open | 0 |
| Defect closure rate | 100% |

---

## 6. Integration Issues Resolved (Pipeline Build Log)

During CI/CD pipeline setup, 10 integration obstacles were encountered, diagnosed,
and resolved. Each is documented with root cause, solution, and factual references
in the `fix/` folder.

| # | Issue | Resolution |
|---|---|---|
| 01 | Jira URL missing https:// | Added https:// prefix |
| 02 | TestRail-Jira OAuth trailing slash | Removed trailing slash from base URL |
| 03 | Jira Bug work type missing | Added via Space settings → Work types |
| 04 | trcli wrong argument (--project-id) | Changed to --project (name) |
| 05 | trcli automation_id field not configured | Created custom case field |
| 06 | automation_id system name mismatch | Discovered via API; used --case-matcher name |
| 07 | Duplicate sections in JUnit XML | Scoped each spec to one project (testIgnore) |
| 08 | JUnit file deleted by second run | Moved reports outside test-results/ |
| 09 | Mobile page.tap fails on desktop | testIgnore fix (DEF-001 root cause) |
| 10 | grep not recognized in PowerShell | Used Select-String / switched to Git Bash |

---

## 7. Documentation Delivered

All documents created and committed to the GitHub repository:

| Document | File | Purpose |
|---|---|---|
| Test Cases | qa-steps-1-4.md | 10 test cases, template, ISTQB techniques |
| Framework Guide | test-framework-recommendations.md | Tool comparisons, Playwright code examples |
| Project Steps | project-steps-full-picture.md | STLC alignment, full process |
| Requirements + RTM | requirements-acceptance-rtm.md | REQs, acceptance criteria, traceability |
| Playwright Pattern | playwright-test-pattern.md | Test writing guide, AAA pattern, commands |
| Fix Log | fix/ (10 files) | Every issue with root cause and solution |
| CLI Reference | cli-quick-reference/ (9 files) | Every command used, explained |
| Code Explanations | explanations/ (13 files) | Every code file explained line by line |
| Chat Log | chat.md | Full conversation and decision history |
| Sprint Review | sprint-review.md | This document |

---

## 8. Skills Demonstrated

### QA Process
- ISTQB test design techniques (Equivalence Partitioning, Boundary Value Analysis,
  State Transition Testing, Error Guessing, Security Testing)
- STLC (Requirements Analysis → Test Planning → Test Design → Execution → Closure)
- Defect Lifecycle (raised → diagnosed → fixed → verified → closed)
- RTM with four-tool traceability

### SDET / Automation
- Built a Flask web application specifically designed for testing
- Wrote 25 Playwright automated tests from scratch using the AAA pattern
- Configured multi-project test execution (desktop + mobile)
- Built a GitHub Actions CI/CD pipeline from scratch
- Integrated trcli to push results automatically to TestRail
- Debugged integration failures using REST API inspection (curl)
- Read CI/CD logs from the CLI (gh run view --log-failed)
- Applied official Playwright documentation to solve real problems

### Tools
- Jira (Spaces interface — team-managed project, sprint management)
- TestRail Enterprise (test cases, runs, custom fields, Jira integration)
- GitHub + GitHub Actions (repo, CI/CD, secrets management)
- Git (version control, branching, commit history)
- Playwright (automated browser testing, UI Mode, multi-project config)
- trcli (TestRail CLI — JUnit XML ingestion and result push)
- curl (REST API debugging)

---

## 9. What Is Not Done (Deferred to Future Sprint)

| Item | Reason Deferred |
|---|---|
| NFR-001 — Performance (load under 2s) | Requires Locust load test setup |
| NFR-002 — Accessibility (WCAG 2.1 AA) | Requires axe-core integration |
| NFR-004 — HTTPS only | Requires SSL configuration and security scan |
| NFR-005 — bcrypt hashing audit | Requires security code review process |
| Jira auto-ticket transition via API | Advanced CI/CD — Week 2 candidate |
| GitHub Actions CI/CD notification to Slack | Team communication enhancement |
| Practice test written by learner | Task 14 — hands-on exercise remaining |

---

## 10. Sprint Metrics Summary

| Metric | Value |
|---|---|
| Requirements planned | 10 functional + 5 NFR |
| Requirements completed | 10 / 10 functional (100%) |
| NFRs completed | 0 / 5 (deferred) |
| Test cases written | 10 |
| Automated tests written | 25 |
| Final pass rate | 100% (25/25) |
| Defects raised | 1 |
| Defects closed | 1 (100% closure) |
| CI/CD pipeline runs | 8 total (7 iterations, 1 final green) |
| Git commits | 12 |
| Documentation files | 40+ |
| Tools integrated | 5 (Jira, TestRail, GitHub Actions, Playwright, trcli) |

---

## 11. Sign-Off

| Role | Name | Status | Date |
|---|---|---|---|
| Product Owner | Andre Rockwell | Approved ✓ | September 2026 |
| QA Engineer / SDET | Andre Rockwell | Approved ✓ | September 2026 |

**Sprint 1 — Login Page QA is complete. The feature is verified, automated,
documented, and ready for release.**
