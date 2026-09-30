# Issue 08 — Playwright: JUnit File Deleted by Second Run

## What Happened
To fix the duplicate sections (Issue 07), the pipeline was changed to run each
project separately, each writing its own JUnit file, then push each to TestRail.
The mobile-chrome push SUCCEEDED (created TestRail run #14, submitted 4 results),
but the chromium-desktop push FAILED.

## Error Message
```
File not found: test-results/junit-chromium-desktop.xml
```

## Root Cause
Playwright DELETES its output directory (`test-results/`, the `outputDir`) at the
start of every run. The sequence was:
```
1. Desktop run  -> wrote test-results/junit-chromium-desktop.xml
2. Mobile run STARTS -> Playwright cleans test-results/ -> DELETES the desktop file
3. Mobile run   -> wrote test-results/junit-mobile-chrome.xml
4. Push desktop -> file is gone -> "File not found"
5. Push mobile  -> file exists -> success
```
The second test run erased the first run's report because both files lived in the
directory Playwright auto-cleans.

## How It Was Diagnosed
Read the full run log and saw both runs used test-results/, and that the second
run wiped the first. Confirmed by the log showing desktop ran 21 tests and wrote
its env var path, but the file was absent by push time.

## Reference (official / community)
- Playwright's `outputDir` is for test ARTIFACTS (screenshots, videos, traces) and
  is cleaned each run.
- Reporter output files should NOT be stored in `outputDir` for this reason.
- Related: Playwright issue #27895 documents non-HTML reports in
  `playwright-report/` being cleared by the HTML reporter.
- For combining multiple runs/shards, the official feature is the Blob reporter +
  `merge-reports` (see https://playwright.dev/docs/test-sharding).

## Solution
Superseded by Option A (Issue 07 final fix): with each spec running under exactly
one project, there is a single run and a single JUnit file — no second run to
overwrite it. If separate files were ever needed, they should be written OUTSIDE
`test-results/` (e.g. a dedicated `junit-reports/` folder Playwright does not clean).

## Lesson Learned
- Playwright cleans `outputDir` (`test-results/`) at the start of every run.
- Never write reporter output files (JUnit XML) into `outputDir`.
- Keep report files in a dedicated folder, or avoid multiple runs writing to the
  same location.
- For true multi-shard combining, use Blob reports + merge-reports (the official
  mechanism), not ad-hoc separate files.

## Factual Verification (Official / Authoritative Sources)

Confirmed that Playwright cleans `outputDir` at the start of each run:

- StackOverflow ([Pytest-playwright deletes output folder](https://stackoverflow.com/questions/70122057/pytest-playwright-deletes-output-folder)):
  "It's an expected behavior. The output directory is cleaned at the start of the
  tests." (Content rephrased for compliance with licensing.)
- The Simplified Guide ([Set Playwright output directory](https://www.simplified.guide/playwright/output-directory-set)):
  advises not to point `outputDir` at reports or curated evidence because
  Playwright cleans the directory before a run starts. (Content rephrased for compliance.)
- GitHub issue [microsoft/playwright#27895](https://github.com/microsoft/playwright/issues/27895):
  documents that non-HTML reports written into a reporter's output directory can
  be cleared by the HTML reporter. (Content rephrased for compliance.)

Conclusion: writing reporter output (JUnit XML) into `test-results/` (the
`outputDir`) is documented as unsafe. Report files belong in a separate folder.
