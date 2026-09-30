# Issue 04 — trcli: Wrong Project Argument

## What Happened
The first CI/CD run of the trcli step (pushing Playwright results to TestRail)
failed immediately.

## Error Message
```
Please specify the project name using the --project argument.
```

## Root Cause
The workflow used `--project-id 2` (the numeric project ID) but trcli requires
`--project` with the project NAME, not just the ID.

## How It Was Diagnosed
Read the failed step log from the CLI:
```
gh run view <run-id> --log-failed
```
Skipped the pip install noise, read the bottom of the log where the error appears
right before "Process completed with exit code 1". The message explicitly stated
which argument was missing.

## Solution
Added the `--project` argument with the project name:
```
--project "Login Page QA — Week 1 Practical" \
--project-id 2 \
```

## Lesson Learned
- CLI tools often tell you exactly what argument they need — read the error text.
- CI errors live at the BOTTOM of the log, just above the "exit code 1" line.
  Use `gh run view <id> --log-failed` and read the end, ignore the install noise.
- trcli identifies a project by name (`--project`), not only by ID.
