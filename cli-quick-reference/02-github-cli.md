# GitHub CLI (gh) — Repo, Secrets, and CI Runs

The `gh` command is GitHub's official command-line tool. It does from the terminal
what you would otherwise click through on github.com.

---

## gh auth status
```bash
gh auth status
```
Shows whether you are logged in to GitHub and with what permissions (scopes).
This project confirmed the account "rwell10-Red" with `repo` and `workflow` scopes
(needed for creating repos and running Actions).

---

## gh repo create
```bash
gh repo create login-page-qa-week1 --private --source=. --remote=origin --description "..."
```
Creates a new GitHub repository AND links it to your local repo in one command.
- `login-page-qa-week1` — the repo name
- `--private` — makes it private (use `--public` for public)
- `--source=.` — use the current folder's local git repo
- `--remote=origin` — name the remote "origin"
- `--description "..."` — the repo description

This created the repo without touching the GitHub website.

---

## gh secret set
```bash
gh secret set TESTRAIL_HOST --body "https://rockwell.testrail.io"
gh secret set TESTRAIL_USER --body "email@example.com"
gh secret set TESTRAIL_API_KEY
```
Stores an encrypted secret in the repo. The pipeline reads these at runtime; they
never appear in code or logs.
- `--body "value"` — provide the value inline (fine for non-secret values like URLs)
- NO `--body` — prompts you to paste the value privately (used for the API token so
  it stays out of command history)

---

## gh secret list
```bash
gh secret list
```
Lists the names of stored secrets (never the values — they are write-only). Used to
confirm all three TestRail secrets were saved.

---

## gh run list
```bash
gh run list
gh run list --limit 5
gh run list --limit 1 --json databaseId --jq '.[0].databaseId'
```
Lists CI/CD pipeline runs with STATUS (✓ pass, X fail, * running), title, branch,
and ID.
- `--limit N` — show only N most recent
- `--json databaseId --jq '.[0].databaseId'` — extract just the latest run's ID as
  plain text (used to script "get the newest run")

---

## gh run view
```bash
gh run view <run-id>
gh run view <run-id> --log
gh run view <run-id> --log-failed
gh run view <run-id> --job <job-id> --log
```
Inspects a specific run.
- (no flag) — shows the step list and pass/fail status
- `--log` — full output of every step
- `--log-failed` — ONLY the failed steps (fastest for debugging)
- `--job <id>` — target a specific job within the run

Debugging tip learned in this project: errors live at the BOTTOM of the log, right
above "Process completed with exit code 1". Read the end first.

---

## gh run watch
```bash
gh run watch
gh run watch --exit-status
```
Streams a run in progress live in the terminal, updating as steps complete.
- `--exit-status` — makes the command exit with the run's pass/fail code

---

## gh run rerun
```bash
gh run rerun <run-id>
```
Re-runs a previous pipeline run without needing a new commit. Used to re-trigger the
pipeline after creating the TestRail automation_id field (no code change needed).

---

## Common Debugging Sequence Used
```bash
gh run list --limit 3                          # find which run failed (X)
gh run view <id> --log-failed                  # read only the failed step
gh run view <id> --log-failed | grep -i error  # jump to the error line
```
