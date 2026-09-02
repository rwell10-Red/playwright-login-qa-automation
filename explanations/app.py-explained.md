# app.py — Line by Line Explanation

**File location:** `login_app/app.py`
**Purpose:** The main application file. Defines all URL routes (what happens when someone visits a URL), the login logic, session management, and the password reset flow. This is the brain of the Flask app — every test case maps to logic in this file.

---

## Imports Section

```python
import os
```
**Line 1** — Imports Python's `os` module. Used to read environment variables (like `TESTING_DISABLED`).

---

```python
import secrets
```
**Line 2** — Imports Python's `secrets` module. Used to generate cryptographically secure random tokens for password resets. `secrets` is specifically designed for security-sensitive tokens — more secure than `random`.

---

```python
from datetime import datetime, timedelta
```
**Line 3** — Imports two datetime tools:
- `datetime` — used to get the current time (`datetime.utcnow()`)
- `timedelta` — used to add time durations (e.g., "1 hour from now" = `datetime.utcnow() + timedelta(hours=1)`)

---

```python
from flask import (
    Flask, render_template, request, redirect,
    url_for, flash, session, jsonify
)
```
**Lines 5–8** — Imports core Flask tools:
- `Flask` — the main class that creates the web app
- `render_template` — loads an HTML template file and returns it as a response
- `request` — gives access to incoming HTTP request data (form fields, URL params, headers)
- `redirect` — sends the browser to a different URL (returns a 302 response)
- `url_for` — generates a URL for a named route function (e.g., `url_for('login')` → `/login`)
- `flash` — stores a one-time message (like "You have been logged out") to display on the next page
- `session` — a dictionary stored in a signed cookie that persists data between requests
- `jsonify` — converts a Python dictionary to a JSON HTTP response

---

```python
from flask_login import (
    LoginManager, login_user, logout_user,
    login_required, current_user
)
```
**Lines 9–12** — Imports Flask-Login tools:
- `LoginManager` — the extension that manages sessions and authentication
- `login_user(user)` — logs in a user, creates their session cookie
- `logout_user()` — logs out the current user, destroys their session
- `login_required` — a decorator that blocks unauthenticated access to a route (redirects to login)
- `current_user` — a proxy object representing the currently logged-in user (or an anonymous user)

---

```python
from config import Config
from models import db, User
from database import init_db
```
**Lines 14–16** — Imports from the other files in the project:
- `Config` — the configuration class from `config.py`
- `db` — the SQLAlchemy database object from `models.py`
- `User` — the User model class from `models.py`
- `init_db` — the database initialization function from `database.py`

---

## App Setup Section

```python
app = Flask(__name__)
```
**Line 20** — Creates the Flask application object. `__name__` tells Flask the name of the current Python module, which Flask uses to find templates and static files relative to this file's location.

---

```python
app.config.from_object(Config)
```
**Line 21** — Loads all settings from the `Config` class into Flask's configuration. After this line, Flask knows the secret key, database URI, session lifetime, and all other settings.

---

```python
db.init_app(app)
```
**Line 24** — Connects the SQLAlchemy `db` object to the Flask `app`. This is the two-step initialization pattern — `db` was created without an app in `models.py`, and now it is connected to the actual app.

---

```python
login_manager = LoginManager(app)
```
**Line 25** — Creates and connects the Flask-Login manager to the app. This enables session-based authentication for all routes.

---

```python
login_manager.login_view = 'login'
```
**Line 26** — Tells Flask-Login which route to redirect to when an unauthenticated user tries to access a protected page. `'login'` refers to the function named `login` defined below. This is what causes the 302 redirect when visiting `/dashboard` without a session.

---

```python
login_manager.login_message = 'Your session has expired due to inactivity. Please log in again.'
```
**Line 27** — Sets the message flashed when a user is redirected to login due to session expiry. This message appears on the login page after a timeout redirect. Directly implements **TC_LOGIN_008**.

---

```python
login_manager.login_message_category = 'warning'
```
**Line 28** — Sets the CSS category of the flash message to `'warning'` so it displays with a yellow/amber style in the `login.html` template.

---

```python
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
```
**Lines 31–33** — The user loader callback. Flask-Login calls this function on every request to load the current user from the session.
- `@login_manager.user_loader` — registers this function as the loader
- Flask-Login stores only the user's ID in the session cookie
- On each request, it calls `load_user` with that ID to get the full User object from the database
- `User.query.get(int(user_id))` — looks up the user by primary key
- Returns the User object or `None` if not found

---

## Session Timeout Hook

```python
@app.before_request
def make_session_permanent():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(seconds=Config.PERMANENT_SESSION_LIFETIME)
```
**Lines 38–41** — Runs before every single HTTP request to the app.
- `@app.before_request` — registers this function as a pre-request hook
- `session.permanent = True` — marks the session as permanent, meaning it uses the configured lifetime instead of expiring when the browser closes
- `timedelta(seconds=1800)` — sets the session lifetime to 30 minutes
- Every request resets this timer — only truly idle sessions expire
- Directly implements **TC_LOGIN_008** (session timeout)

---

## Routes

```python
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))
```
**Lines 46–50** — The root route (`/`). Not a real page — just redirects.
- `@app.route('/')` — registers this function to handle GET requests to `/`
- If the user is already logged in, send them to `/dashboard`
- If not, send them to `/login`
- Users never stay at `/` — they are always sent somewhere else

---

```python
@app.route('/login', methods=['GET', 'POST'])
def login():
```
**Lines 53–54** — The login route. Accepts both GET (show the form) and POST (process the form submission).
- `methods=['GET', 'POST']` — without this, Flask only accepts GET by default

---

```python
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
```
**Lines 63–64** — If a logged-in user visits `/login`, redirect them to the dashboard. Prevents double-login.

---

```python
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember_me') == 'on'
```
**Lines 66–69** — Reads the submitted form data.
- `request.form.get('email', '')` — gets the email field value; defaults to empty string if missing
- `.strip()` — removes leading/trailing whitespace from the email (so spaces-only counts as empty)
- `request.form.get('remember_me') == 'on'` — checkbox values are `'on'` when checked, absent when not. This returns `True` or `False`.

---

```python
        errors = {}
        if not email:
            errors['email'] = 'Email is required.'
        if not password:
            errors['password'] = 'Password is required.'
        if errors:
            return render_template('login.html', errors=errors, email=email)
```
**Lines 72–78** — Server-side empty field validation. **TC_LOGIN_003**.
- Creates an empty `errors` dictionary
- Adds an error message for each empty field
- If there are any errors, re-render the login page with the error messages and the email value (so the user does not have to retype it)
- No database query is made — validation happens before any external calls

---

```python
        user = User.query.filter_by(email=email).first()
```
**Line 82** — Looks up the user by email.
- SQLAlchemy builds this as a parameterized query: `SELECT * FROM users WHERE email = ?`
- The `?` placeholder prevents SQL injection — the email value is passed separately, not embedded in the SQL string
- This is how **TC_LOGIN_004** (SQL injection) is handled — the ORM makes injection structurally impossible
- Returns a `User` object or `None` if no match

---

```python
        if user and user.is_locked:
            return render_template('login.html', lockout=True)
```
**Lines 85–86** — Checks lockout BEFORE checking the password. **TC_LOGIN_005**.
- If the account is locked, show the lockout screen immediately
- Does not reveal whether the password was correct — the account is just locked
- `lockout=True` is passed to the template, which switches from showing the login form to showing the lockout panel

---

```python
        if not user or not user.check_password(password):
            if user:
                just_locked = user.increment_failed_attempts(Config.MAX_FAILED_ATTEMPTS)
                db.session.commit()
                if just_locked:
                    return render_template('login.html', lockout=True)
            return render_template(
                'login.html',
                error='Invalid email or password. Please try again.',
                email=email
            )
```
**Lines 89–98** — Handles invalid credentials. **TC_LOGIN_002** and **TC_LOGIN_004**.
- `not user` — email not found in database
- `not user.check_password(password)` — email found but password is wrong
- Both cases show the SAME generic error — never reveals which field is wrong (security requirement)
- If the user exists (but wrong password): increment their failed attempt counter
- If that increment just reached the threshold: immediately show lockout screen
- `db.session.commit()` — saves the incremented counter to the database

---

```python
        user.reset_failed_attempts()
        db.session.commit()
```
**Lines 101–102** — Clears the failed attempt counter after a successful login. **TC_LOGIN_001**.
- If a user had 3 failed attempts then got it right, the counter resets to 0
- Saves the reset to the database

---

```python
        login_user(user, remember=remember,
                   duration=timedelta(seconds=Config.REMEMBER_COOKIE_DURATION))
```
**Lines 105–106** — Logs the user in via Flask-Login. **TC_LOGIN_001** and **TC_LOGIN_007**.
- `login_user(user)` — creates the session cookie that keeps the user logged in
- `remember=remember` — if True, sets a persistent cookie lasting 30 days; if False, session cookie only
- `duration=timedelta(...)` — sets the Remember Me cookie duration to 30 days from config

---

```python
        next_page = request.args.get('next')
        return redirect(next_page or url_for('dashboard'))
```
**Lines 109–110** — Redirects after successful login.
- `request.args.get('next')` — Flask-Login adds a `?next=/dashboard` parameter when redirecting unauthenticated users to login. After login, this sends them back to where they were trying to go.
- If no `next` parameter: go to `/dashboard`

---

```python
@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)
```
**Lines 114–120** — The protected dashboard route.
- `@login_required` — Flask-Login decorator. If the user is not authenticated, redirects to `/login` with a 302. This is the core session protection.
- `user=current_user` — passes the logged-in user object to the template so it can display "Welcome, [name]!"
- Covers **TC_LOGIN_001**, **TC_LOGIN_008**, **TC_LOGIN_009**

---

```python
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))
```
**Lines 123–130** — The logout route. **TC_LOGIN_009**.
- `@login_required` — only logged-in users can log out
- `logout_user()` — Flask-Login clears the session and invalidates the server-side session token
- `flash(...)` — queues a message to display on the login page
- After this, any tab using the same session token gets a 302 on their next request — the token is invalid

---

```python
@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
```
**Lines 133–134** — The forgot password route. **TC_LOGIN_006**.

---

```python
        neutral_message = ('If this email is registered, you will receive '
                           'a password reset link shortly.')
        if user:
            token = secrets.token_urlsafe(32)
            user.reset_token = token
            user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
            reset_link = url_for('reset_password', token=token, _external=True)
            print(f"\n[PASSWORD RESET] Link for {email}:\n{reset_link}\n")
        return render_template('forgot_password.html', message=neutral_message)
```
**Lines 148–161** — Core forgot password logic.
- The neutral message is set BEFORE checking if the user exists — it is always the same regardless
- `secrets.token_urlsafe(32)` — generates a 43-character cryptographically random URL-safe token
- `reset_token_expiry = datetime.utcnow() + timedelta(hours=1)` — token expires in 1 hour
- `url_for('reset_password', token=token, _external=True)` — builds the full URL including `http://localhost:5000/`
- `print(...)` — simulates email delivery by printing the link to the terminal (no email server needed)
- Whether the user exists or not, the same response is returned — prevents email enumeration

---

```python
@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
```
**Lines 165–166** — The password reset confirmation route.
- `<token>` — a URL variable. Whatever appears after `/reset-password/` is captured as the `token` parameter.
- Example: `/reset-password/abc123` → `token = 'abc123'`

---

```python
    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expiry or \
            datetime.utcnow() > user.reset_token_expiry:
        return render_template('forgot_password.html',
                               error='This reset link has expired or has already been used.')
```
**Lines 171–175** — Token validation.
- Looks up the user by the token value
- Three failure conditions: no user found, no expiry set, or current time is past expiry
- Returns the same error for all three — does not reveal why it failed

---

```python
        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        user.reset_failed_attempts()
        db.session.commit()
```
**Lines 192–196** — Completes the password reset.
- `set_password(new_password)` — hashes and stores the new password
- `reset_token = None` — invalidates the token so it cannot be used again (single-use)
- `reset_token_expiry = None` — clears the expiry
- `reset_failed_attempts()` — unlocks the account if it was locked (reset also serves as unlock)

---

```python
@app.route('/api/session-status')
def session_status():
    return jsonify({'authenticated': current_user.is_authenticated})
```
**Lines 202–204** — JSON API endpoint used by Playwright. **TC_LOGIN_008**.
- Returns `{"authenticated": true}` or `{"authenticated": false}`
- Playwright calls this after clearing cookies to verify the session is truly gone
- `jsonify` converts the Python dict to a proper JSON HTTP response with `Content-Type: application/json`

---

```python
@app.route('/test/reset-lockout')
def test_reset_lockout():
    if os.environ.get('TESTING_DISABLED'):
        return jsonify({'error': 'Not available'}), 403
    emails = ['user@example.com', 'reset@example.com']
    for email in emails:
        user = User.query.filter_by(email=email).first()
        if user:
            user.reset_failed_attempts()
    db.session.commit()
    return jsonify({'status': 'reset', 'emails': emails})
```
**Lines 210–220** — Test helper endpoint. Called by Playwright between tests to reset user state.
- `os.environ.get('TESTING_DISABLED')` — if this environment variable is set, block the endpoint (returns 403). Safe guard for hardened environments.
- Resets both `user@example.com` and `reset@example.com` — the two accounts that can accumulate failed attempts during tests
- Without this, TC_LOGIN_005b running before other tests would leave `reset@example.com` locked and break subsequent tests

---

```python
if __name__ == '__main__':
    init_db(app)
    app.run(debug=True, port=5000)
```
**Lines 224–226** — Entry point. Only runs when you execute `python app.py` directly.
- `if __name__ == '__main__'` — this block is skipped when the file is imported by another module (like `verify.py`)
- `init_db(app)` — creates the database tables and seeds test users on first run
- `app.run(debug=True, port=5000)` — starts the Flask development server on port 5000
- `debug=True` — enables auto-reload when files change and shows detailed error pages
- App is available at `http://127.0.0.1:5000`
