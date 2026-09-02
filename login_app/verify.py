"""
Verification script — tests all Flask routes without a browser.
Each test uses a fresh client session to avoid state bleed.
Run from: login_app/ directory
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import app
from database import init_db

print("=" * 55)
print("Flask App Verification")
print("=" * 55)

init_db(app)
print("DB init:          OK")

errors = []


def fresh_client():
    """Return a new test client with an isolated session."""
    return app.test_client()


# ── GET /login ────────────────────────────────────────────────
with fresh_client() as c:
    r = c.get('/login')
    ok = r.status_code == 200
    print(f"GET  /login:                  {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'}")
    if not ok:
        errors.append("GET /login failed")

# ── GET /dashboard unauthenticated → redirect ─────────────────
with fresh_client() as c:
    r = c.get('/dashboard')
    ok = r.status_code in (301, 302)
    print(f"GET  /dashboard unauthed:     {'OK (redirected)' if ok else 'FAIL (' + str(r.status_code) + ')'}")
    if not ok:
        errors.append("GET /dashboard unauthenticated should redirect")

# ── POST /login valid credentials ─────────────────────────────
with fresh_client() as c:
    r = c.post('/login',
               data={'email': 'user@example.com', 'password': 'Password123!'},
               follow_redirects=False)
    loc = r.headers.get('Location', 'none')
    ok = r.status_code in (301, 302)
    print(f"POST /login valid creds:      {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'} -> {loc}")
    if not ok:
        errors.append("POST /login valid creds should redirect to /dashboard")

# ── POST /login empty fields ──────────────────────────────────
with fresh_client() as c:
    r = c.post('/login', data={'email': '', 'password': ''}, follow_redirects=False)
    body = r.get_data(as_text=True)
    ok = r.status_code == 200
    has_email_err = 'Email is required' in body
    has_pass_err  = 'Password is required' in body
    print(f"POST /login empty fields:     {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'} | email err: {has_email_err} | pass err: {has_pass_err}")
    if not ok:
        errors.append("POST /login empty fields should return 200")
    if not has_email_err:
        errors.append("Empty fields: missing 'Email is required' in response")
    if not has_pass_err:
        errors.append("Empty fields: missing 'Password is required' in response")

# ── POST /login wrong password ────────────────────────────────
with fresh_client() as c:
    r = c.post('/login',
               data={'email': 'user@example.com', 'password': 'WrongPass'},
               follow_redirects=False)
    body = r.get_data(as_text=True)
    ok = r.status_code == 200
    has_error = 'Invalid email or password' in body
    print(f"POST /login wrong password:   {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'} | error msg: {has_error}")
    if not ok:
        errors.append("Wrong password should return 200 with error message")
    if not has_error:
        errors.append("Wrong password: missing 'Invalid email or password' message")

# ── POST /login locked account ────────────────────────────────
with fresh_client() as c:
    r = c.post('/login',
               data={'email': 'locked@example.com', 'password': 'Password123!'},
               follow_redirects=False)
    body = r.get_data(as_text=True)
    ok = r.status_code == 200
    has_lockout = 'Account Locked' in body
    print(f"POST /login locked account:   {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'} | lockout shown: {has_lockout}")
    if not ok:
        errors.append("Locked account should return 200 with lockout message")
    if not has_lockout:
        errors.append("Locked account: missing 'Account Locked' in response")

# ── GET /forgot-password ──────────────────────────────────────
with fresh_client() as c:
    r = c.get('/forgot-password')
    ok = r.status_code == 200
    print(f"GET  /forgot-password:        {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'}")
    if not ok:
        errors.append("GET /forgot-password failed")

# ── POST /forgot-password neutral message ─────────────────────
with fresh_client() as c:
    r = c.post('/forgot-password',
               data={'email': 'user@example.com'},
               follow_redirects=False)
    body = r.get_data(as_text=True)
    has_neutral = 'If this email is registered' in body
    print(f"POST /forgot-password:        {'OK' if has_neutral else 'FAIL'} | neutral msg: {has_neutral}")
    if not has_neutral:
        errors.append("Forgot password missing neutral message")

# ── POST /forgot-password unregistered email (same message) ───
with fresh_client() as c:
    r = c.post('/forgot-password',
               data={'email': 'notreal@example.com'},
               follow_redirects=False)
    body = r.get_data(as_text=True)
    has_neutral = 'If this email is registered' in body
    print(f"POST /forgot-password unknown: {'OK' if has_neutral else 'FAIL'} | same neutral msg: {has_neutral}")
    if not has_neutral:
        errors.append("Forgot password (unknown email) should show same neutral message")

# ── SQL injection — database intact ───────────────────────────
with fresh_client() as c:
    c.post('/login',
           data={'email': "'; DROP TABLE users;--", 'password': 'x'},
           follow_redirects=False)
    from models import User
    with app.app_context():
        count = User.query.count()
    ok = count > 0
    print(f"POST /login SQL injection:    {'OK' if ok else 'FAIL'} | users in DB: {count}")
    if not ok:
        errors.append("SQL injection may have affected database")

# ── GET /api/session-status ───────────────────────────────────
with fresh_client() as c:
    r = c.get('/api/session-status')
    ok = r.status_code == 200
    body = r.get_data(as_text=True)
    print(f"GET  /api/session-status:     {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'} | body: {body.strip()}")
    if not ok:
        errors.append("GET /api/session-status failed")

# ── GET /test/reset-lockout ───────────────────────────────────
with fresh_client() as c:
    r = c.get('/test/reset-lockout')
    ok = r.status_code == 200
    print(f"GET  /test/reset-lockout:     {'OK' if ok else 'FAIL (' + str(r.status_code) + ')'}")
    if not ok:
        errors.append("GET /test/reset-lockout failed")

# ── Summary ───────────────────────────────────────────────────
print("=" * 55)
if errors:
    print(f"RESULT: {len(errors)} issue(s) found:")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print("RESULT: All checks passed. Flask app is ready.")
    print("=" * 55)
    print()
    print("Start the app:")
    print("  python login_app/app.py")
    print()
    print("Run Playwright tests (app must be running first):")
    print("  npx playwright test                  (headless)")
    print("  npx playwright test --headed         (watch browser)")
    print("  npx playwright test --project=chromium-desktop")
    print("  npx playwright test --project=mobile-chrome")
    print("  npx playwright show-report           (HTML report)")
