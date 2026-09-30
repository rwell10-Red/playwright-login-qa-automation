# Issue 07 — trcli: Duplicate Sections in JUnit XML

## What Happened
After switching to `--case-matcher name`, trcli got further — it authenticated,
found the project, and parsed results — but then rejected the upload.

## Error Message
```
Error: Section duplicates detected in test-results/junit-results.xml.
This will result to failure to upload all cases.
```

## Root Cause
The JUnit XML contained the section `tc_login_010_mobile.spec.js` TWICE. This
happened because the mobile test file runs under BOTH Playwright projects:
- chromium-desktop
- mobile-chrome

Both projects wrote into a single combined `junit-results.xml`, producing two
identical section names. trcli cannot map two sections with the same name.

Log evidence:
```
Processed 17 test cases in section login.spec.js.
Processed 4 test cases in section tc_login_010_mobile.spec.js.
Processed 4 test cases in section tc_login_010_mobile.spec.js.   ← duplicate
```

## How It Was Diagnosed
Read the trcli output in the failed step log. The two identical "Processed 4 test
cases in section tc_login_010_mobile.spec.js" lines made the duplication obvious.

## Solution Attempts
1. `includeProjectInTestName: true` in the JUnit reporter — did NOT fix it. This
   flag changes test NAMES, not SECTION names, so the duplicate sections remained.
2. Separate JUnit file per project (Issue 08 attempt) — worked but revealed a
   file-overwrite problem.
3. FINAL FIX (Option A): fixed the Playwright config so each spec runs under
   exactly one project using `testIgnore`, producing a single clean report with
   no duplicate sections.

## Lesson Learned
- Running one spec file under multiple projects produces duplicate sections in a
  combined JUnit report.
- The root cause was a config design issue (mobile spec running on desktop too),
  not a trcli bug.
- The cleanest fix addresses the root cause (one spec per project) rather than
  working around the symptom.
