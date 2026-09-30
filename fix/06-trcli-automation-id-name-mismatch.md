# Issue 06 — trcli: automation_id System Name Mismatch

## What Happened
Even after creating the automation_id field, trcli still reported it as "not
properly configured." First the field appeared missing entirely; after recreating
it, the field existed but with the wrong internal name.

## Root Cause
Two layered problems:
1. The first field creation did not persist to the project at all (the API showed
   no such field).
2. After recreating it, TestRail stored the field's system name as
   `custom_case_automation_id` instead of the `custom_automation_id` that trcli
   expects. TestRail auto-prefixes custom fields, and this field type received a
   `custom_case_` prefix. The system name cannot be changed after creation.

## How It Was Diagnosed
Queried the TestRail API directly to get the ground truth instead of trusting the
UI:
```bash
export TR_TOKEN="<testrail-api-token>"
curl -s -u "email:$TR_TOKEN" \
  "https://rockwell.testrail.io/index.php?/api/v2/get_case_fields" \
  | python -m json.tool | grep "system_name"
```
The raw API response revealed:
```json
"name": "automation_id",
"system_name": "custom_case_automation_id"   ← not what trcli expects
```

## Solution
Bypassed the automation_id field entirely by matching tests by NAME instead:
```
--case-matcher name
```
This tells trcli to match Playwright tests to TestRail cases by test title, so the
problematic custom field is not needed at all.

## Lesson Learned
- The API is the source of truth. When a UI says a field exists but a tool says it
  does not, query the API to see the real stored values.
- TestRail auto-prefixes custom field system names (`custom_`, sometimes
  `custom_case_`), and these names are permanent once created.
- trcli's `--case-matcher name` is a clean way to match by test title and avoid the
  automation_id field requirement completely.
- Using curl to inspect a REST API is a core debugging skill — go to the data, do
  not guess.
