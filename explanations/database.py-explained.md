# database.py — Line by Line Explanation

**File location:** `login_app/database.py`
**Purpose:** Handles two jobs — creating the database tables when the app first starts, and seeding the database with known test user accounts. This file is what makes the app ready to test immediately without any manual setup.

---

```python
from models import db, User
```
**Line 1** — Imports two things from `models.py`:
- `db` — the SQLAlchemy database connection object (needed to create tables)
- `User` — the User model class (needed to create user records)

---

```python
def init_db(app):
```
**Line 4** — Defines the `init_db` function. Takes the Flask `app` object as a parameter. This function is called once when the app starts up (at the bottom of `app.py`).

---

```python
    with app.app_context():
```
**Line 8** — Opens an "application context." Flask uses contexts to make the app's configuration and database connection available without passing them everywhere. Database operations require an active app context to work. The `with` statement ensures the context is properly opened and closed.

---

```python
        db.create_all()
```
**Line 9** — Tells SQLAlchemy to look at all registered models (the `User` class) and create their tables in the database if they do not already exist.
- If `users.db` does not exist, SQLite creates the file and creates the `users` table
- If `users.db` already exists and has the table, this line does nothing — it is safe to call multiple times
- The column structure comes from the variables defined in `models.py`

---

```python
        seed_test_users()
```
**Line 10** — Calls the `seed_test_users` function below to populate the database with test accounts. Called immediately after table creation so test data is always available when the app starts.

---

```python
def seed_test_users():
```
**Line 13** — Defines the `seed_test_users` function. No parameters needed — everything it needs is imported at the top.

---

```python
    users = [
        {
            'email': 'user@example.com',
            'name': 'Test User',
            'password': 'Password123!',
            'is_locked': False,
            'failed_attempts': 0,
        },
        {
            'email': 'locked@example.com',
            'name': 'Locked User',
            'password': 'Password123!',
            'is_locked': True,
            'failed_attempts': 5,
        },
        {
            'email': 'reset@example.com',
            'name': 'Reset User',
            'password': 'Password123!',
            'is_locked': False,
            'failed_attempts': 0,
        },
    ]
```
**Lines 24–47** — Defines a list of dictionaries. Each dictionary holds the data for one test user. Three users are seeded:

**User 1 — `user@example.com`**
- The main active test account used in most Playwright tests
- Not locked, zero failed attempts
- Used in: TC_LOGIN_001, TC_LOGIN_002, TC_LOGIN_003, TC_LOGIN_004, TC_LOGIN_007, TC_LOGIN_008, TC_LOGIN_009, TC_LOGIN_010

**User 2 — `locked@example.com`**
- Pre-locked account — simulates an account that already hit the lockout threshold
- `is_locked: True` and `failed_attempts: 5` set at creation
- Used in: TC_LOGIN_005 (to test the lockout message without needing to fail 5 times first)
- Using a pre-locked account prevents TC_LOGIN_005 from dirtying the main test user

**User 3 — `reset@example.com`**
- Clean account reserved for the lockout progression test (TC_LOGIN_005b)
- Also available for password reset flow testing (TC_LOGIN_006)
- Not locked at start, zero failed attempts

---

```python
    for user_data in users:
```
**Line 49** — Loops through the list of user dictionaries one at a time.

---

```python
        existing = User.query.filter_by(email=user_data['email']).first()
```
**Line 50** — Checks if a user with this email already exists in the database.
- `User.query` — starts a database query on the users table
- `.filter_by(email=user_data['email'])` — adds a WHERE clause: `WHERE email = 'user@example.com'`
- `.first()` — returns the first matching row, or `None` if no match found
- This check makes the function safe to call multiple times — if the user already exists, it skips creation

---

```python
        if not existing:
```
**Line 51** — Only create the user if one with that email does not already exist. This prevents duplicate records and errors on subsequent app restarts.

---

```python
            user = User(
                email=user_data['email'],
                name=user_data['name'],
                is_locked=user_data['is_locked'],
                failed_attempts=user_data['failed_attempts'],
            )
```
**Lines 52–57** — Creates a new `User` object in memory with the values from the dictionary.
- Notice `password` is NOT passed here — passwords are never stored directly
- The `id` and `created_at` columns are not set here either — SQLAlchemy fills them automatically

---

```python
            user.set_password(user_data['password'])
```
**Line 58** — Calls the `set_password` method from `models.py` to hash `Password123!` and store the hash in `user.password_hash`. This is the correct way to store passwords — never assign to `password_hash` directly with a plaintext value.

---

```python
            db.session.add(user)
```
**Line 59** — Adds the user object to the database session (a staging area for changes).
- Nothing is written to the database file yet — this just queues the insert
- Multiple `add()` calls can be staged before committing them all at once

---

```python
    db.session.commit()
```
**Line 61** — Writes all staged changes to the database in a single transaction.
- If any insert fails, the entire commit is rolled back — no partial data
- After this line, all three users exist in `users.db` and will survive app restarts

---

```python
    print("Database seeded with test users.")
```
**Line 62** — Prints a confirmation message to the terminal when seeding completes. Useful to confirm the app started correctly and the database is ready.
