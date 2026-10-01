# CLI Quick Reference

Every command-line tool and command used in the Login Page QA project, organized by
tool, with plain-English explanations.

## Index

| File | Tool | Purpose |
|------|------|---------|
| 01-git.md | Git | Version control — commit, push, status |
| 02-github-cli.md | gh (GitHub CLI) | Create repo, manage secrets, view CI runs |
| 03-python-pip.md | Python / pip | Run the app, install packages |
| 04-playwright.md | Playwright | Run tests, UI mode, reports |
| 05-npm-node.md | npm / Node | Install JS dependencies, run scripts |
| 06-trcli.md | trcli | Push test results to TestRail |
| 07-curl-api.md | curl | Query the TestRail REST API |
| 08-bash-basics.md | Bash | Navigation, variables, pipes, filtering |
| 09-bash-vs-powershell.md | Reference | Command equivalents between shells |

## Shell Note

This project used Git Bash on Windows. The prompt looks like:
```
arock@mn MINGW64 ~/Home/Rockwell/Rockwell/Week 1 Practical (main)
$
```
The `$` and `MINGW64` confirm bash. PowerShell shows `PS C:\>` instead.

Windows paths in bash use forward slashes and /c/ instead of C:\ :
```
C:\Users\arock\...   ->   /c/Users/arock/...
```
