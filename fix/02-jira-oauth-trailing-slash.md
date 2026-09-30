# Issue 02 — Jira Integration: OAuth Failure and Trailing Slash

## What Happened
After fixing the URL scheme, the Jira integration still failed to connect. It
showed permission errors and "authentication window closed" errors across several
attempts.

## Error Messages
```
Your Atlassian account lacks the required permissions to use tokens
for the specified Jira Base URL.
```
and later:
```
Connection failed. There was an issue authorizing your Jira account.
Reason: Authentication window was closed before completion. Please try again.
```

## Root Cause
Two separate problems, resolved in sequence:
1. The Base URL had an extra path segment: `https://androckwell.atlassian.net/jira`
   The `/jira` is part of the browser navigation path, not the base URL. TestRail
   needs only the domain root.
2. The URL had a trailing slash: `https://androckwell.atlassian.net/`
   The trailing slash caused the final connection validation to fail.

## How It Was Diagnosed
- Confirmed the exact subdomain spelling from the Atlassian Connected Apps page
  and the Jira address bar (`anrdrockwell`, confirmed correct).
- Verified in Atlassian > Connected Apps that TestRail WAS authorized — proving
  OAuth itself worked and the problem was the URL string.
- Removed URL components one at a time: first the `/jira` suffix, then the
  trailing slash.

## Solution
Base URL set to exactly:
```
https://anrdrockwell.atlassian.net    ← no /jira, no trailing slash
```
After removing the trailing slash, both Defects and References integrations
connected successfully.

## Lesson Learned
Integration URLs are extremely sensitive to exact formatting. A trailing slash or
an extra path segment can break a connection that is otherwise fully authorized.
When an OAuth app shows as connected in the provider (Atlassian) but the
integration still fails, suspect the URL string, not the permissions.
