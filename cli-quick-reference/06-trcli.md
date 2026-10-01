# trcli — TestRail CLI

trcli (TestRail CLI) reads test result files and pushes them into TestRail
automatically. It is how the CI pipeline records results without manual entry.

---

## Install
```bash
pip install trcli
```
trcli is a Python package, installed via pip.

---

## The parse_junit Command
```bash
trcli -y \
  -h "https://rockwell.testrail.io" \
  -u "email@example.com" \
  -k "API_TOKEN" \
  --project "Login Page QA — Week 1 Practical" \
  --project-id 2 \
  parse_junit \
  --title "Automated Playwright Run - GitHub Actions" \
  --case-matcher name \
  --file "junit-reports/junit-results.xml"
```

### Global options (before parse_junit)
| Flag | Meaning |
|------|---------|
| `-y` | Auto-confirm all prompts (needed in CI — no human to answer) |
| `-h` | TestRail host URL |
| `-u` | TestRail username (email) |
| `-k` | TestRail API token (the "key") |
| `--project` | Project NAME (trcli matches by name, not just ID) |
| `--project-id` | Project numeric ID (disambiguator) |

### parse_junit options (after the command)
| Flag | Meaning |
|------|---------|
| `parse_junit` | The subcommand: read a JUnit XML file |
| `--title` | Name of the test run created in TestRail |
| `--case-matcher name` | Match tests to cases by TITLE (avoids needing the automation_id field) |
| `--file` | Path to the JUnit XML report |

---

## Key Lessons From This Project

1. **Use `--project` (name), not just `--project-id`.** trcli errored with
   "Please specify the project name using the --project argument" when only the ID
   was given.

2. **`--case-matcher name`** matches tests to TestRail cases by their title. This
   avoids trcli's default requirement for a special `automation_id` custom field
   (which TestRail stored under a mismatched system name).

3. **In CI, credentials come from GitHub Secrets**, injected as
   `${{ secrets.TESTRAIL_API_KEY }}` — never hardcoded.

4. **The input file must exist when trcli runs.** An earlier failure was caused by
   Playwright cleaning the folder containing the XML. Writing reports to a folder
   Playwright does not clean (junit-reports/) fixed it.

---

## Successful Output Looks Like
```
Parsing JUnit report.
Processed N test cases in section ...
Checking project. Done.
Adding test cases: N/N, Done.
Creating test run. Test run: .../index.php?/runs/view/14
Submitted N test results in X secs.
```
"Submitted N test results" and a runs/view link = success.

---

## Note on PATH
After `pip install trcli`, the trcli.exe was not on PATH initially. It was added to
the user PATH so `trcli` works from any new terminal. In CI this is not an issue
because pip installs it fresh each run.
