# Issue 05 — trcli: automation_id Field Not Configured

## What Happened
After fixing the project argument, trcli connected and parsed results but then
refused to upload them.

## Error Message
```
The automation_id field is not properly configured. Please configure it in the
TestRail Administration under Customizations > Case Fields.
The field should have the following mandatory details:
  - System Name: automation_id
  - Type: Text (or String)
  - Is Active: True
```

## Root Cause
trcli uses a custom TestRail case field called `automation_id` to match automated
tests to TestRail cases. This field did not exist in the TestRail project yet.

## How It Was Diagnosed
Read the failed step log. trcli got past authentication, found the project, parsed
the JUnit report, then stopped with an explicit instruction to create the field.

## Solution (first attempt)
Created a custom case field in TestRail:
```
Admin -> Customizations -> Case Fields -> Add Field
  Label: Automation ID
  System Name: automation_id
  Type: Text
  Assign to project: Login Page QA — Week 1 Practical
```

## Complication
The first save did not persist to the project (confirmed via API — see Issue 06).
It took a second, careful attempt with explicit project assignment to save it.

## Lesson Learned
- trcli requires a specific `automation_id` custom field to map automated results
  to TestRail cases.
- Creating a custom field is not enough — it MUST be assigned to the target
  project, or trcli cannot see it.
- Always verify a field was actually created via the API, not just the UI
  (see Issue 06).
