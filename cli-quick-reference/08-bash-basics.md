# Bash Basics — Navigation, Variables, Pipes, Filtering

Core bash concepts used throughout this project on Git Bash (Windows).

---

## cd — Change Directory
```bash
cd "/c/Users/arock/Home/Rockwell/Rockwell/Week 1 Practical"
```
Moves into a folder. On Windows bash:
- Paths use forward slashes: `/c/Users/...` not `C:\Users\...`
- The drive is `/c/` (lowercase) for the C: drive
- Quote paths that contain spaces (like "Week 1 Practical")

---

## pwd — Print Working Directory
```bash
pwd
```
Shows the folder you are currently in. Useful to confirm location before running
commands.

---

## export — Set an Environment Variable
```bash
export TR_TOKEN="your-token-value"
```
Creates a variable available to the current terminal session and commands run from
it.
- No spaces around the `=`  (correct: `VAR="x"`, wrong: `VAR = "x"`)
- Quote the value
- Only lasts for the current session; closing the terminal clears it

---

## echo — Print Text or a Variable
```bash
echo hello
echo $TR_TOKEN
```
Prints text to the screen.
- `$VARNAME` — prints the VALUE of a variable (the `$` looks it up)
- Used to verify a variable is set: if `echo $TR_TOKEN` shows the token, it is set;
  if blank, it is not

---

## The Pipe |
```bash
command1 | command2
```
Feeds the output of the left command into the right command as its input. Chains
tools together. Example used:
```bash
gh run view <id> --log-failed | grep "error"
```
The log output flows into grep, which filters it.

---

## grep — Filter Text by Pattern
```bash
grep "system_name"
grep -i "automation_id\|error"
grep -A 5 -B 2 "automation"
```
Prints only lines matching a pattern.
- `-i` — case-insensitive
- `\|` — OR (match either pattern)
- `-A N` — also show N lines AFTER each match
- `-B N` — also show N lines BEFORE each match

grep is bash-only. In PowerShell use `Select-String` instead.

---

## Line Continuation with Backslash
```bash
curl -s -u "user:token" \
  "https://example.com/api" \
  | python -m json.tool
```
A `\` at the end of a line means "the command continues on the next line." Purely
for readability — splits one long command across multiple lines.

---

## && — Chain Commands (run next only if previous succeeds)
```bash
git add file.py && git commit -m "message"
```
`&&` runs the second command ONLY if the first succeeds. If `git add` fails, the
commit does not run. (PowerShell uses `;` instead.)

---

## Tab Completion
Type part of a filename and press Tab — bash auto-completes it. Prevents typos like
`app.p` instead of `app.py`:
```bash
python login_app/app   <Tab>   ->   python login_app/app.py
```

---

## Stopping a Running Command
- `Ctrl + C` — stops the current running process (e.g., stop the Flask server)
