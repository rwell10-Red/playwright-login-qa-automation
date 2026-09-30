# Fix Log — Issues and Solutions

This folder documents every problem encountered while building the Login Page QA
project and the exact solution applied to each. It serves as a troubleshooting
reference and a record of the debugging process.

Each issue file follows the same format:
- What happened
- The error message
- Why it happened (root cause)
- How it was diagnosed
- The solution applied
- The lesson learned

## Index

| # | Issue | File |
|---|-------|------|
| 01 | Jira integration — invalid URL | 01-jira-invalid-url.md |
| 02 | Jira integration — OAuth window closed / trailing slash | 02-jira-oauth-trailing-slash.md |
| 03 | Jira — Bug work type missing | 03-jira-bug-work-type.md |
| 04 | trcli — wrong project argument | 04-trcli-project-argument.md |
| 05 | trcli — automation_id field not configured | 05-trcli-automation-id-field.md |
| 06 | trcli — automation_id system name mismatch | 06-trcli-automation-id-name-mismatch.md |
| 07 | trcli — duplicate sections in JUnit XML | 07-trcli-duplicate-sections.md |
| 08 | Playwright — JUnit file deleted by second run | 08-playwright-junit-file-overwrite.md |
| 09 | Playwright — mobile tests fail on desktop (page.tap) | 09-playwright-mobile-tap-desktop.md |
| 10 | Shell — grep not found in PowerShell | 10-shell-grep-powershell.md |

## Tools Involved
- Flask (login app under test)
- Playwright (test automation)
- Jira (project management + defects)
- TestRail (test case management)
- trcli (TestRail CLI — pushes results)
- GitHub Actions (CI/CD pipeline)
