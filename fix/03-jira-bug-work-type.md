# Issue 03 — Jira: Bug Work Type Missing

## What Happened
When pushing a defect from TestRail to Jira, the Issue Type dropdown only offered
Story, Epic, and Task — there was no Bug option, which is the correct type for a
defect.

## Root Cause
The Jira space (a team-managed Software space) did not have the Bug work type
enabled. Although Atlassian docs state software spaces include Bug by default, it
was not present in this space's configuration.

## How It Was Diagnosed
- Confirmed via the TestRail Push Defect dropdown that only Story/Epic/Task existed.
- Searched current Atlassian documentation, which confirmed the new "Spaces"
  interface renames things: Project settings -> Space settings, Issue types ->
  Work types.

## Solution
Added the Bug work type in Jira:
```
Space name -> ... (More actions) -> Space settings -> Work types -> Add work type -> Bug
```
After adding, Bug appeared in both Jira's Create menu and the TestRail defect
push dropdown.

## Lesson Learned
- Not all Jira spaces have Bug enabled by default; verify and add work types as needed.
- The modern Jira "Spaces" interface uses different terminology than older docs:
  Space (not Project), Space settings (not Project settings), Work types (not
  Issue types), Work items (not Issues). Always match instructions to the actual
  UI version in front of you.
