# curl — Querying the TestRail REST API

curl makes HTTP requests from the command line — like a browser without the visuals.
Used in this project to inspect TestRail's configuration directly via its API, which
is the source of truth when the UI is misleading.

---

## The Full Command Used
```bash
curl -s -u "email@example.com:$TR_TOKEN" \
  "https://rockwell.testrail.io/index.php?/api/v2/get_case_fields" \
  | python -m json.tool | grep "system_name"
```

This is three commands chained with pipes. Each part explained below.

---

## Part 1 — curl
```bash
curl -s -u "email:$TR_TOKEN" "https://.../api/v2/get_case_fields"
```
| Piece | Meaning |
|-------|---------|
| `curl` | Make an HTTP request and print the response |
| `-s` | Silent — hide the progress bar, show only the response |
| `-u "user:password"` | HTTP Basic Auth. For TestRail: email + API token |
| `$TR_TOKEN` | Environment variable holding the token (keeps it out of history) |
| The URL | TestRail API v2 endpoint `get_case_fields` (lists all custom case fields) |

---

## Part 2 — python -m json.tool
```bash
| python -m json.tool
```
Pretty-prints the raw JSON response into readable, indented form. The API returns
JSON crammed onto few lines; this makes it human-readable.

---

## Part 3 — grep
```bash
| grep "system_name"
```
Filters the output to only lines containing "system_name", giving a clean list of
field names instead of the full field definitions.

---

## The Pipe Symbol
```bash
command1 | command2
```
A pipe feeds the OUTPUT of the left command as INPUT to the right command. Chains
tools together: curl fetches -> json.tool formats -> grep filters.

---

## Setting the Token First (Bash)
```bash
export TR_TOKEN="your-testrail-api-token"
echo $TR_TOKEN
```
- `export VAR="value"` — set an environment variable (no spaces around `=`)
- `echo $VAR` — print it, to confirm it is set
- Referencing `$TR_TOKEN` in curl keeps the real token out of the typed command

---

## Debugging Without Filters
```bash
curl -s -u "email@example.com:$TR_TOKEN" \
  "https://rockwell.testrail.io/index.php?/api/v2/get_case_fields"
```
When the filtered command returned nothing, removing `| python -m json.tool | grep`
showed the RAW response — revealing whether auth worked, an error was returned, or
the response was empty. When debugging a pipe, strip the filters to see raw output.

---

## What This Solved

The TestRail UI showed a custom field existed, but trcli said it did not. Querying
the API revealed the field's real system_name was `custom_case_automation_id`
(not the `custom_automation_id` trcli expected). The API is the source of truth —
inspecting it directly is how the root cause was found.

---

## The Skill

Hitting a REST API with curl, formatting the JSON, and filtering for what you need
is a core QA/SDET debugging skill. When an integration misbehaves, go to the API and
read the actual data instead of guessing from the UI.
