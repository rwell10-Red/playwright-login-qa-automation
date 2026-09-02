# verify.py — Line by Line Explanation

**File location:** `login_app/verify.py`
**Purpose:** A smoke test script that checks every Flask route works correctly without opening a browser. Uses Flask's built-in test client to simulate HTTP requests. Run this before Playwright tests to confirm the app is in a healthy state.

---

```python
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
```
**Lines 4–6** — Setup for running from the command line.
- `import sys` — Python's system module, used to manipulate the Python path and exit with a status code
- `import os` — used to get the directory path of this file
- `sys.path.insert(0, os.path.dirname(__file__))` — adds the `login_app` folder to Python's module search path so `from app import app` works when running from the project root. Without this, Python cannot find `app.py` if the script is run from outside `login_app/`.

---

```python
from app import app
from database import init_db
```
**Lines 8–9** — Imports the Flask app object and database initializer.
- `from app import app` — imports the configured Flask application
- `from database import init_db` — imports the function that creates tables and seeds users

---

```python
print("=" * 55)
print("Flask App Verification")
print("=" * 55)
```
**Lines 11–13** — Prints a visual header to the terminal. `"=" * 55` repeats the `=` character 55 times to create a separator line.

---

```python
init_db(app)
print("DB init:          OK")
```
**Lines 15–16** — Initializes the database (creates tables if missing, seeds test users if missing) and prints a confirmation. If this line fails, the remaining checks will also fail.

---

```python
errors = []
```
**Line 18** — Creates an empty list to collect any failed checks. Each time a check fails, an error description is appended here. At the end, if this list is not empty, the script exits with a failure code.

---

```python
def fresh_client():
    """Return a new test client with an isolated session."""
    return app.test_client()
```
**Lines 21–23** — Defines a helper function that creates a new Flask test client.
- `app.test_client()` — Flask's built-in test client simulates HTTP requests without a real browser or network
- Each call returns a completely new client with no session state
- Using a fresh client for each check prevents state from one test bleeding into the next (this was the bug that caused the first verification run to fail — a shared client kept the session from a successful login)

---

```python
with fresh_client() as c:
    r = c.get('/login')
    ok = r.status_code == 200
    print(f"GET  /login:  {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'}")
    if not ok:
        errors.append("GET /login failed")
```
**GET /login check** — Opens a fresh client, sends a GET request to `/login`, checks for a 200 response.
- `with fresh_client() as c` — creates the test client and ensures it is cleaned up after the block
- `c.get('/login')` — simulates a browser visiting `/login`
- `r.status_code == 200` — 200 means the page loaded successfully
- If not 200, appends an error description to the `errors` list

---

```python
with fresh_client() as c:
    r = c.get('/dashboard')
    ok = r.status_code in (301, 302)
```
**GET /dashboard unauthenticated check** — Verifies that visiting `/dashboard` without a session redirects.
- Expects a 301 or 302 redirect response (not 200)
- 200 here would mean the protected page is accessible without login — a security failure
- `@login_required` on the dashboard route causes Flask-Login to return 302 to `/login`

---

```python
with fresh_client() as c:
    r = c.post('/login',
               data={'email': 'user@example.com', 'password': 'Password123!'},
               follow_redirects=False)
    loc = r.headers.get('Location', 'none')
    ok = r.status_code in (301, 302)
```
**POST /login valid credentials check** — Tests the happy path login.
- `c.post('/login', data={...})` — simulates submitting the login form
- `follow_redirects=False` — tells the test client NOT to follow the redirect automatically. This lets us inspect the 302 response and the `Location` header to confirm where it redirects.
- `r.headers.get('Location', 'none')` — reads the redirect destination from the response headers
- Expects a redirect to `/dashboard`

---

```python
with fresh_client() as c:
    r = c.post('/login', data={'email': '', 'password': ''}, follow_redirects=False)
    body = r.get_data(as_text=True)
    ok = r.status_code == 200
    has_email_err = 'Email is required' in body
    has_pass_err  = 'Password is required' in body
```
**POST /login empty fields check** — Tests TC_LOGIN_003.
- Empty email and password submitted
- Expects 200 (stay on page, not redirect)
- `r.get_data(as_text=True)` — reads the full HTML response body as a string
- `'Email is required' in body` — checks that the validation message is present in the HTML
- Both field-level error messages must be present to pass

---

```python
with fresh_client() as c:
    r = c.post('/login',
               data={'email': 'user@example.com', 'password': 'WrongPass'},
               follow_redirects=False)
    body = r.get_data(as_text=True)
    ok = r.status_code == 200
    has_error = 'Invalid email or password' in body
```
**POST /login wrong password check** — Tests TC_LOGIN_002.
- Valid email, wrong password
- Expects 200 with the generic error message in the body
- Checks the exact text: `'Invalid email or password'`

---

```python
with fresh_client() as c:
    r = c.post('/login',
               data={'email': 'locked@example.com', 'password': 'Password123!'},
               follow_redirects=False)
    body = r.get_data(as_text=True)
    ok = r.status_code == 200
    has_lockout = 'Account Locked' in body
```
**POST /login locked account check** — Tests TC_LOGIN_005.
- Uses the pre-locked test account
- Correct credentials, but account is locked
- Expects 200 with `'Account Locked'` text in the response body
- The login form should NOT be shown — only the lockout panel

---

```python
with fresh_client() as c:
    r = c.post('/forgot-password',
               data={'email': 'user@example.com'},
               follow_redirects=False)
    body = r.get_data(as_text=True)
    has_neutral = 'If this email is registered' in body
```
**POST /forgot-password neutral message check** — Tests TC_LOGIN_006.
- Submits a registered email to the forgot password form
- Checks that the neutral message is shown (not a confirmation that the email exists)

---

```python
with fresh_client() as c:
    r = c.post('/forgot-password',
               data={'email': 'notreal@example.com'},
               follow_redirects=False)
    body = r.get_data(as_text=True)
    has_neutral = 'If this email is registered' in body
```
**POST /forgot-password unknown email check** — Second part of TC_LOGIN_006.
- Submits an email that does NOT exist in the database
- Checks that the SAME neutral message is shown — prevents email enumeration
- If the response differed based on whether the email existed, attackers could use this to build a list of valid accounts

---

```python
with fresh_client() as c:
    c.post('/login',
           data={'email': "'; DROP TABLE users;--", 'password': 'x'},
           follow_redirects=False)
    from models import User
    with app.app_context():
        count = User.query.count()
    ok = count > 0
```
**SQL injection check** — Tests TC_LOGIN_004.
- Submits the classic SQL injection string `'; DROP TABLE users;--` as the email
- After the request, counts the rows in the `users` table
- If `count > 0`, the table was not dropped — injection was blocked
- If `count == 0`, the injection succeeded — critical failure

---

```python
with fresh_client() as c:
    r = c.get('/api/session-status')
    ok = r.status_code == 200
    body = r.get_data(as_text=True)
```
**GET /api/session-status check** — Verifies the JSON API endpoint works.
- No session, so expects `{"authenticated": false}`
- Confirms the endpoint is reachable and returns valid JSON

---

```python
with fresh_client() as c:
    r = c.get('/test/reset-lockout')
    ok = r.status_code == 200
```
**GET /test/reset-lockout check** — Verifies the Playwright test helper endpoint works.
- If this returns 403, Playwright's TC_LOGIN_005b test will fail to reset state between runs

---

```python
if errors:
    print(f"RESULT: {len(errors)} issue(s) found:")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print("RESULT: All checks passed. Flask app is ready.")
```
**Final summary block** — Reports results.
- If `errors` list is not empty: prints each error description and calls `sys.exit(1)` — exit code 1 signals failure to the operating system or CI pipeline
- If `errors` is empty: prints success and exits with code 0 (success)
- Exit codes are how scripts communicate pass/fail to other tools — CI pipelines check exit codes to decide whether to proceed or stop
