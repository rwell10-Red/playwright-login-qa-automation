# Issue 10 — Shell: grep Not Recognized in PowerShell

## What Happened
Running a command that piped output to `grep` failed in the terminal.

## Error Message
```
grep : The term 'grep' is not recognized as the name of a cmdlet, function,
script file, or operable program.
```

## Root Cause
The command was run in PowerShell (prompt started with `PS C:\>`), but `grep` is a
Unix/bash command that PowerShell does not have. The equivalent in PowerShell is
`Select-String`.

## How It Was Diagnosed
Recognized the prompt `PS C:\...` as PowerShell, and that `grep` is bash-only.

## Solution
Two options:
1. Use the PowerShell equivalent:
   ```powershell
   gh run view <id> --log-failed | Select-String -Pattern "automation_id","error"
   ```
2. Switch to Git Bash (terminal dropdown -> Git Bash), where `grep` works:
   ```bash
   gh run view <id> --log-failed | grep -i "automation_id\|error"
   ```

## Command Equivalents

| Task | Bash | PowerShell |
|------|------|------------|
| Filter text | grep "pattern" | Select-String "pattern" |
| Set env var | export VAR="x" | $env:VAR = "x" |
| Read env var | $VAR / echo $VAR | $env:VAR |
| Path format | /c/Users/... | C:\Users\... |
| Chain commands | && | ; |

## Lesson Learned
- Always know which shell you are in before running commands. Check the prompt:
  `PS C:\>` = PowerShell, `user@machine MINGW64 ~ $` = Git Bash.
- Match commands to the shell. grep/export/$VAR are bash; Select-String/$env: are
  PowerShell.
