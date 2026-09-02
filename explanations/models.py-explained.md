# models.py — Line by Line Explanation

**File location:** `login_app/models.py`
**Purpose:** Defines the database structure. A "model" in Flask is a Python class that represents a table in the database. Each class variable is a column. SQLAlchemy reads this class and creates the actual database table automatically.

---

```python
from flask_sqlalchemy import SQLAlchemy
```
**Line 1** — Imports SQLAlchemy, the Object Relational Mapper (ORM). An ORM lets you work with the database using Python objects and methods instead of writing raw SQL queries. This is what prevents SQL injection — the ORM builds parameterized queries automatically.

---

```python
from flask_login import UserMixin
```
**Line 2** — Imports `UserMixin` from Flask-Login. A "mixin" is a class that adds pre-built methods to another class. `UserMixin` adds four methods Flask-Login requires on any user object:
- `is_authenticated` — returns True if the user is logged in
- `is_active` — returns True if the account is active
- `is_anonymous` — returns True if no user is logged in
- `get_id()` — returns the user's ID as a string

Without inheriting `UserMixin`, Flask-Login cannot manage sessions for this user.

---

```python
from werkzeug.security import generate_password_hash, check_password_hash
```
**Line 3** — Imports two functions from Werkzeug (the toolkit Flask is built on):
- `generate_password_hash(password)` — takes a plaintext password and returns a secure hash. Passwords are never stored as plain text.
- `check_password_hash(hash, password)` — takes a stored hash and a plaintext attempt and returns True or False. Used during login verification.
- Werkzeug uses PBKDF2 with SHA-256 by default — a strong, industry-standard hashing algorithm.

---

```python
from datetime import datetime
```
**Line 4** — Imports Python's `datetime` class. Used to record timestamps — when an account was locked, when a reset token expires, and when the user record was created.

---

```python
db = SQLAlchemy()
```
**Line 6** — Creates the SQLAlchemy database object. This `db` object is the central connection point between Flask and the database. It is initialized without an app here because the app does not exist yet at import time. The app is attached later in `app.py` using `db.init_app(app)`.

---

```python
class User(UserMixin, db.Model):
```
**Line 9** — Defines the `User` class. It inherits from two parents:
- `UserMixin` — adds the Flask-Login required methods (explained above)
- `db.Model` — tells SQLAlchemy this class is a database model, not just a regular Python class

When Flask sees this, it knows to create a `users` table in the database with columns matching the variables defined below.

---

```python
    __tablename__ = 'users'
```
**Line 14** — Explicitly names the database table `users`. Without this, SQLAlchemy would auto-generate a name. Explicit naming is clearer and consistent with the SQL you would write directly.

---

```python
    id = db.Column(db.Integer, primary_key=True)
```
**Line 16** — Creates the `id` column. Every table needs a primary key — a unique identifier for each row.
- `db.Integer` — the column stores whole numbers
- `primary_key=True` — marks this as the unique identifier, auto-increments (1, 2, 3...) for each new user
- Flask-Login uses this ID to look up the current user on every request

---

```python
    email = db.Column(db.String(150), unique=True, nullable=False)
```
**Line 17** — Creates the `email` column.
- `db.String(150)` — stores text up to 150 characters
- `unique=True` — no two users can have the same email address. The database enforces this constraint.
- `nullable=False` — this column cannot be empty. Every user must have an email.

---

```python
    name = db.Column(db.String(100), nullable=False)
```
**Line 18** — Creates the `name` column. Stores the user's display name (shown on the dashboard as "Welcome, [name]!"). Maximum 100 characters, cannot be empty.

---

```python
    password_hash = db.Column(db.String(256), nullable=False)
```
**Line 19** — Creates the `password_hash` column. Stores the hashed password, never the plaintext password.
- `db.String(256)` — hash strings are long, 256 characters accommodates all common hash formats
- `nullable=False` — every user must have a password

---

```python
    failed_attempts = db.Column(db.Integer, default=0, nullable=False)
```
**Line 22** — Creates the `failed_attempts` column. Tracks how many consecutive wrong passwords this account has had.
- `default=0` — starts at zero for new users
- `nullable=False` — always has a value
- This column directly supports **TC_LOGIN_005** (account lockout)

---

```python
    is_locked = db.Column(db.Boolean, default=False, nullable=False)
```
**Line 23** — Creates the `is_locked` column. A True/False flag indicating whether this account is locked.
- `db.Boolean` — stores True or False
- `default=False` — all new accounts start unlocked
- Checked on every login attempt — if True, login is blocked immediately
- Directly supports **TC_LOGIN_005**

---

```python
    locked_at = db.Column(db.DateTime, nullable=True)
```
**Line 24** — Creates the `locked_at` column. Records the exact timestamp when the account was locked.
- `db.DateTime` — stores a date and time value
- `nullable=True` — can be empty (None) when the account is not locked
- Useful for audit trails and for time-based unlocking policies

---

```python
    reset_token = db.Column(db.String(100), nullable=True)
```
**Line 27** — Creates the `reset_token` column. Stores the single-use password reset token generated when a user requests a password reset.
- `nullable=True` — only populated when a reset has been requested
- Set to `None` after the token is used so it cannot be used twice
- Directly supports **TC_LOGIN_006**

---

```python
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
```
**Line 28** — Creates the `reset_token_expiry` column. Stores the timestamp when the reset token expires (1 hour from generation).
- If the current time is past this value, the token is rejected
- `nullable=True` — empty when no reset is pending
- Directly supports **TC_LOGIN_006**

---

```python
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```
**Line 30** — Creates the `created_at` column. Records when the user account was created.
- `default=datetime.utcnow` — automatically set to the current UTC time when a user is inserted
- Note: `datetime.utcnow` is passed without parentheses `()` — this passes the function itself as the default, so SQLAlchemy calls it at insert time rather than when the class is defined

---

```python
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
```
**Lines 32–34** — Method that takes a plaintext password and stores its hash.
- Called when creating a user or updating a password
- `generate_password_hash(password)` converts `Password123!` into something like `pbkdf2:sha256:600000$...` — unreadable and irreversible
- The original password is never stored anywhere

---

```python
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
```
**Lines 36–38** — Method that verifies a login attempt.
- Takes the plaintext password the user typed
- Hashes it the same way and compares it to the stored hash
- Returns `True` if they match, `False` if not
- The app never decrypts the stored hash — it only compares hashes

---

```python
    def increment_failed_attempts(self, max_attempts=5):
        self.failed_attempts += 1
        if self.failed_attempts >= max_attempts:
            self.is_locked = True
            self.locked_at = datetime.utcnow()
            return True
        return False
```
**Lines 40–49** — Method that records a failed login and locks the account if the threshold is reached.
- `self.failed_attempts += 1` — increments the counter by 1
- `if self.failed_attempts >= max_attempts` — checks if the counter reached the limit (5 by default, from `Config.MAX_FAILED_ATTEMPTS`)
- If the limit is reached: sets `is_locked = True`, records the timestamp, returns `True` to tell the caller the account just became locked
- If not yet at the limit: returns `False`
- The caller in `app.py` uses the return value to decide whether to show the lockout screen

---

```python
    def reset_failed_attempts(self):
        self.failed_attempts = 0
        self.is_locked = False
        self.locked_at = None
```
**Lines 51–54** — Method that clears the lockout state.
- Called after a successful login — resets the counter so the user starts fresh
- Also called by the `/test/reset-lockout` endpoint between Playwright tests
- Sets all three lockout fields back to their default values

---

```python
    def __repr__(self):
        return f'<User {self.email}>'
```
**Lines 56–57** — Defines how Python displays a User object in the terminal or logs.
- Without this, printing a user object would show something like `<User object at 0x000001A...>` (a memory address)
- With this, it shows `<User user@example.com>` — readable and useful for debugging
- `__repr__` is a Python "dunder" (double underscore) method that controls string representation
