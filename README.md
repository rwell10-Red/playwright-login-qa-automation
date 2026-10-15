# Playwright Login QA Automation

[![Playwright Tests](https://github.com/rwell10-Red/playwright-login-qa-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/rwell10-Red/playwright-login-qa-automation/actions/workflows/playwright.yml)

End-to-end QA automation for a login page, built the way a real Agile QA team works:
requirements traced to acceptance criteria, automated with Playwright, run in CI on
every push, and reported into a test-management tool.

**Tooling:** Playwright · JavaScript · Flask (app under test) · GitHub Actions (CI/CD)
· JUnit XML reporting · TestRail (results via `trcli`) · Jira (requirements/defects)

---

## Why this project

Most login-test demos stop at "I wrote some Selenium." This one shows the **full QA
lifecycle** a team actually uses:

```
User story → Requirements (REQ/NFR) → Acceptance Criteria (Gherkin) →
Test Cases (TC_LOGIN_###) → Playwright automation → CI run → TestRail results
```

- **Requirements & traceability:** see [`requirements-acceptance-rtm.md`](requirements-acceptance-rtm.md)
  — 10 functional requirements, Gherkin acceptance criteria, and a full RTM mapping
  each requirement → Jira ticket → TestRail case → test → status.
- **Sprint report:** see [`sprint-review.md`](sprint-review.md) — the Sprint 1 review
  (goal, planned vs. delivered, metrics, defect log).

---

## What is automated

- **App under test:** a Flask login web app (`login_app/`) — login, invalid
  credentials, empty-field validation, input sanitization, account lockout,
  forgot-password, remember-me, session timeout, multi-tab, mobile responsive.
- **Tests:** Playwright specs in `tests/`, run across **two projects**:
  - `chromium-desktop` (desktop Chrome)
  - `mobile-chrome` (Pixel 5, touch enabled)
- **Reporting:** Playwright emits JUnit XML, which CI pushes to TestRail via `trcli`.

---

## Tech stack

| Area | Tool |
|------|------|
| Test automation | Playwright |
| Language | JavaScript (Node.js) |
| App under test | Flask (Python) |
| CI/CD | GitHub Actions |
| Test reporting | JUnit XML → TestRail (`trcli`) |
| Requirements / defects | Jira |

---

## How to run locally

Prerequisites: **Node.js 18+**, **Python 3.10+**.

```bash
# 1. Install test dependencies
npm install
npx playwright install

# 2. Start the Flask app under test (in a separate terminal)
pip install -r requirements.txt
python login_app/app.py        # serves http://127.0.0.1:5000

# 3. Run the Playwright tests
npx playwright test                      # all projects
npx playwright test --project=chromium-desktop
npx playwright show-report               # open the HTML report
```

---

## CI/CD

The GitHub Actions workflow (`.github/workflows/playwright.yml`, "Playwright Login
Page Tests") runs on every push:

1. Starts the Flask app
2. Runs the Playwright suite across both browser projects
3. Produces a JUnit XML report
4. Pushes results to TestRail via `trcli` (credentials stored as GitHub Secrets —
   never committed)

---

## Repository layout

| Path | Purpose |
|------|---------|
| `login_app/` | Flask login application under test |
| `tests/` | Playwright test specs |
| `playwright.config.js` | Projects, reporters, base URL |
| `requirements-acceptance-rtm.md` | Requirements, Gherkin AC, and the RTM |
| `sprint-review.md` | Sprint 1 review and metrics |
| `.github/workflows/playwright.yml` | CI pipeline |

---

## What this project demonstrates

- **QA process:** requirements → acceptance criteria → test cases → traceability (RTM)
- **Automation:** cross-browser + mobile Playwright testing
- **CI/CD:** automated test runs on every push, results reported to TestRail
- **Tooling fluency:** Playwright, GitHub Actions, TestRail, Jira
