# Issue 01 — Jira Integration: Invalid URL

## What Happened
While configuring the TestRail-to-Jira integration, the "Configure Jira Integration"
dialog rejected the Jira Base URL.

## Error Message
```
Field Jira Base URL is not a valid URL.
```

## Root Cause
The URL was entered without the protocol prefix:
```
androckwell.atlassian.net          ← wrong (no https://)
```
A valid URL requires the scheme. TestRail could not recognize plain text as a URL.

## How It Was Diagnosed
Read the error literally — "not a valid URL" points to URL formatting, not
credentials or permissions. Compared the entered value to a proper URL format.

## Solution
Added the `https://` prefix:
```
https://androckwell.atlassian.net   ← correct
```

## Lesson Learned
A URL field needs the full scheme (`https://`). "Not a valid URL" errors are almost
always a formatting problem — missing protocol, extra path, or a typo — not an
authentication issue.
