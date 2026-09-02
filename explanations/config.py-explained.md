# config.py — Line by Line Explanation

**File location:** `login_app/config.py`
**Purpose:** Central configuration file. Stores all settings the Flask app needs to run — secret keys, database location, session durations, and security thresholds. Every setting in one place so nothing is hardcoded inside the app logic.

---

```python
import os
```
**Line 1** — Imports Python's built-in `os` module. Used to read environment variables and build file paths that work on any operating system.

---

```python
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
```
**Line 3** — Calculates the absolute path to the folder where `config.py` lives.
- `__file__` = the path to this file itself
- `os.path.dirname(...)` = strips the filename, leaves just the folder path
- `os.path.abspath(...)` = converts it to a full absolute path (e.g., `C:\Users\arock\...\login_app`)
- This is used to build the database path so it always points to the right folder regardless of where Python is run from.

---

```python
class Config:
```
**Line 5** — Defines a Python class called `Config`. Flask reads configuration from a class — all settings are defined as class-level variables inside it.

---

```python
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
```
**Line 6** — The secret key Flask uses to cryptographically sign session cookies and CSRF tokens.
- `os.environ.get('SECRET_KEY', ...)` = checks if an environment variable called `SECRET_KEY` is set on the machine. If it is, use that value. If not, fall back to the default string.
- In production, you always set this as an environment variable with a long random value so it cannot be guessed.
- If someone knows your secret key, they can forge session cookies and impersonate any user.
- The fallback string `'dev-secret-key-change-in-production'` is only safe for local development.

---

```python
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'users.db')
```
**Line 9** — Tells SQLAlchemy where to find the database.
- `sqlite:///` = the connection string prefix for SQLite (a file-based database, no server needed)
- `os.path.join(BASE_DIR, 'users.db')` = joins the folder path from line 3 with the filename `users.db`
- Result: `sqlite:///C:\Users\arock\...\login_app\users.db`
- SQLite stores everything in a single `.db` file. Perfect for local development and testing.

---

```python
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```
**Line 10** — Disables a SQLAlchemy feature that tracks every database object change in memory.
- Setting this to `False` saves memory and removes a warning Flask prints when it is not set.
- There is no reason to enable it for this project.

---

```python
    PERMANENT_SESSION_LIFETIME = 1800  # seconds
```
**Line 13** — Sets the session timeout to 1800 seconds (30 minutes).
- A "permanent" session in Flask means the session has an expiry time rather than expiring when the browser closes.
- After 30 minutes of inactivity the session is invalidated and the user must log in again.
- This directly implements **TC_LOGIN_008** (Session Timeout requirement REQ-008).
- `1800 = 60 seconds × 30 minutes`

---

```python
    REMEMBER_COOKIE_DURATION = 60 * 60 * 24 * 30  # seconds
```
**Line 16** — Sets the Remember Me cookie lifetime to 30 days in seconds.
- `60 × 60 × 24 × 30 = 2,592,000 seconds`
- When a user checks "Remember Me" and logs in, Flask-Login sets a persistent cookie that lasts this long.
- This directly implements **TC_LOGIN_007** (Remember Me requirement REQ-007).
- Written as multiplication instead of a raw number so the intent (30 days) is readable.

---

```python
    MAX_FAILED_ATTEMPTS = 5
```
**Line 19** — Defines the account lockout threshold as 5 failed login attempts.
- Used in `app.py` and `models.py` when counting failed logins.
- When a user fails to log in 5 times consecutively, their account is locked.
- Keeping this in config means you can change the threshold in one place without hunting through the code.
- This directly implements **TC_LOGIN_005** (Account Lockout requirement REQ-005).
