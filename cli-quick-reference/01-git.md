# Git — Version Control Commands

Git tracks changes to your files over time. Each saved snapshot is a "commit."

---

## git init
```bash
git init
```
Creates a new Git repository in the current folder. Run once at the start of a
project. Creates a hidden .git folder that stores all history.

---

## git status
```bash
git status
```
Shows the current state: which files are changed, staged, or untracked.
- "Changes not staged" = modified but not yet added
- "Changes to be committed" = staged, ready to commit
- "nothing to commit, working tree clean" = everything saved and committed

---

## git add
```bash
git add <file>
git add .gitignore chat.md playwright.config.js
```
Stages files — marks them to be included in the next commit. Staging lets you
choose exactly which changes go into a commit.

- `git add <specific-file>` — stage one file (preferred, precise)
- `git add .` — stage everything changed (use with care)

This project preferred naming specific files to avoid committing unintended changes.

---

## git commit
```bash
git commit -m "Your message describing the change"
```
Saves the staged files as a permanent snapshot in history.
- `-m` provides the commit message inline
- Messages should describe WHAT changed and WHY

Example from this project:
```bash
git commit -m "Add trcli step to push Playwright results to TestRail"
```

---

## git branch
```bash
git branch -M main
```
- `-M main` renames the current branch to "main" (modern default; older Git used
  "master"). Done once early in the project.

```bash
git branch --show-current
```
Shows which branch you are currently on.

---

## git push
```bash
git push
git push -u origin main
```
Uploads your local commits to the remote repository (GitHub).
- `-u origin main` sets up tracking the first time — links local "main" to the
  remote "main" so future `git push` needs no arguments.
- After the first push, just `git push` works.

Pushing to GitHub is what TRIGGERS the CI/CD pipeline automatically.

---

## git log
```bash
git log --oneline
git log --oneline -1
```
Shows commit history.
- `--oneline` — condensed, one line per commit
- `-1` — show only the most recent commit

---

## git remote
```bash
git remote -v
```
Shows the configured remote repositories (where push/pull go). `-v` = verbose,
shows the URLs.

---

## git ls-remote
```bash
git ls-remote --heads origin
```
Lists the branches on the remote. Used to confirm a push actually reached GitHub.

---

## Typical Workflow Used in This Project
```bash
git add playwright.config.js .github/workflows/playwright.yml
git commit -m "Describe the change"
git push
```
Stage the specific files -> commit with a message -> push to GitHub (triggers CI).
