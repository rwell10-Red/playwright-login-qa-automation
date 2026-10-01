# Bash vs PowerShell — Command Equivalents

This project used Git Bash, but Windows also has PowerShell. Commands differ between
them. A mistake made during the project was running bash syntax in PowerShell (and
vice versa), causing errors like "grep is not recognized."

---

## How to Tell Which Shell You Are In

Look at the prompt:
| Prompt | Shell |
|--------|-------|
| `arock@mn MINGW64 ~/... (main) $` | Git Bash |
| `PS C:\Users\arock\...>` | PowerShell |

`MINGW64` and `$` = bash. `PS` and `>` = PowerShell.

---

## Command Equivalents

| Task | Bash | PowerShell |
|------|------|------------|
| Filter text (grep) | `grep "pattern"` | `Select-String "pattern"` |
| Filter, case-insensitive | `grep -i "pat"` | `Select-String "pat"` (already case-insensitive) |
| Filter multiple patterns | `grep "a\|b"` | `Select-String "a","b"` |
| Set env variable | `export VAR="x"` | `$env:VAR = "x"` |
| Read env variable | `echo $VAR` | `$env:VAR` |
| Print text | `echo text` | `Write-Output text` or `echo text` |
| Change directory | `cd "/c/path"` | `cd "C:\path"` |
| Path format | `/c/Users/arock/...` | `C:\Users\arock\...` |
| Chain (run next if success) | `cmd1 && cmd2` | `cmd1; cmd2` |
| List files | `ls -la` | `Get-ChildItem` (or `ls`) |
| First N lines | `head -n 5` | `Select-Object -First 5` |
| Last N lines | `tail -n 5` | `Select-Object -Last 5` |

---

## Real Examples From This Project

### Reading a CI error — Bash
```bash
gh run view 36510389666 --log-failed | grep -i "automation_id\|error"
```

### Same thing — PowerShell
```powershell
gh run view 36510389666 --log-failed | Select-String -Pattern "automation_id","error"
```

### Setting the TestRail token — Bash
```bash
export TR_TOKEN="ttO...xZ2Z"
```

### Same thing — PowerShell
```powershell
$env:TR_TOKEN = "ttO...xZ2Z"
```

---

## Commands That Work the Same in Both

These are their own programs (not shell built-ins), so they work identically in
bash and PowerShell:
- `git ...`
- `gh ...`
- `python ...`
- `pip ...`
- `npm ...`
- `npx playwright ...`
- `trcli ...`
- `curl ...`

Only the shell built-ins (grep/Select-String, export/$env:, echo, cd path format,
&&/;) differ.

---

## The Lesson

Always know which shell you are in before running a command. If you get
"X is not recognized," check whether you used a bash command in PowerShell or the
reverse. Match the command to the shell shown in your prompt.
