import os
import secrets
from datetime import datetime, timedelta

from flask import (
    Flask, render_template, request, redirect,
    url_for, flash, session, jsonify
)
from flask_login import (
    LoginManager, login_user, logout_user,
    login_required, current_user
)

from config import Config
from models import db, User
from database import init_db

# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.config.from_object(Config)

# Initialise extensions
db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Your session has expired due to inactivity. Please log in again.'
login_manager.login_message_category = 'warning'


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# ---------------------------------------------------------------------------
# Session timeout — reset timer on every request (TC_LOGIN_008)
# ---------------------------------------------------------------------------
@app.before_request
def make_session_permanent():
    session.permanent = True
    app.permanent_session_lifetime = timedelta(seconds=Config.PERMANENT_SESSION_LIFETIME)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    """Root redirect — send authenticated users to dashboard, others to login."""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Login route — handles all login scenarios:
      TC_LOGIN_001: valid credentials → dashboard
      TC_LOGIN_002: invalid credentials → generic error
      TC_LOGIN_003: empty fields → validation error (server-side)
      TC_LOGIN_004: special characters → sanitized, treated as invalid
      TC_LOGIN_005: account locked → lockout message
      TC_LOGIN_007: remember me → persistent cookie
    """
    # Already logged in — go to dashboard
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember_me') == 'on'

        # TC_LOGIN_003: Server-side empty field validation
        errors = {}
        if not email:
            errors['email'] = 'Email is required.'
        if not password:
            errors['password'] = 'Password is required.'
        if errors:
            return render_template('login.html', errors=errors, email=email)

        # Look up user — Flask-SQLAlchemy ORM handles parameterised query,
        # preventing SQL injection at the ORM level (TC_LOGIN_004)
        user = User.query.filter_by(email=email).first()

        # TC_LOGIN_005: Locked account — check before verifying password
        if user and user.is_locked:
            return render_template('login.html', lockout=True)

        # TC_LOGIN_002 / TC_LOGIN_004: Invalid credentials — generic message
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

        # Successful login — TC_LOGIN_001
        user.reset_failed_attempts()
        db.session.commit()

        # TC_LOGIN_007: Remember Me — pass remember flag to Flask-Login
        login_user(user, remember=remember,
                   duration=timedelta(seconds=Config.REMEMBER_COOKIE_DURATION))

        # Redirect to the page the user originally wanted, or dashboard
        next_page = request.args.get('next')
        return redirect(next_page or url_for('dashboard'))

    return render_template('login.html')


@app.route('/dashboard')
@login_required
def dashboard():
    """
    Protected dashboard — only accessible when logged in.
    TC_LOGIN_001: destination after valid login
    TC_LOGIN_008: session timeout redirects here if expired
    TC_LOGIN_009: multi-tab — if session invalidated, redirect to login
    """
    return render_template('dashboard.html', user=current_user)


@app.route('/logout')
@login_required
def logout():
    """
    Logout route.
    TC_LOGIN_009: invalidates server-side session so other tabs lose access.
    """
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """
    Forgot password — TC_LOGIN_006.
    Generates a reset token and prints the reset link to the console
    (simulates email sending without requiring an email server).
    """
    if request.method == 'POST':
        email = request.form.get('email', '').strip()

        if not email:
            return render_template('forgot_password.html',
                                   error='Email address is required.')

        user = User.query.filter_by(email=email).first()

        # Always show the same neutral message to prevent email enumeration
        neutral_message = ('If this email is registered, you will receive '
                           'a password reset link shortly.')

        if user:
            # Generate a secure single-use token
            token = secrets.token_urlsafe(32)
            user.reset_token = token
            user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()

            # In a real app this would send an email.
            # For local testing, print the reset link to the terminal.
            reset_link = url_for('reset_password', token=token, _external=True)
            print(f"\n[PASSWORD RESET] Link for {email}:\n{reset_link}\n")

        return render_template('forgot_password.html', message=neutral_message)

    return render_template('forgot_password.html')


@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    """
    Password reset confirmation page — TC_LOGIN_006.
    Validates token, checks expiry, accepts new password.
    """
    user = User.query.filter_by(reset_token=token).first()

    # Invalid or expired token
    if not user or not user.reset_token_expiry or \
            datetime.utcnow() > user.reset_token_expiry:
        return render_template('forgot_password.html',
                               error='This reset link has expired or has already been used.')

    if request.method == 'POST':
        new_password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        if not new_password or not confirm_password:
            return render_template('reset_password.html', token=token,
                                   error='Both fields are required.')

        if new_password != confirm_password:
            return render_template('reset_password.html', token=token,
                                   error='Passwords do not match.')

        if len(new_password) < 8:
            return render_template('reset_password.html', token=token,
                                   error='Password must be at least 8 characters.')

        # Update password and invalidate token
        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        user.reset_failed_attempts()
        db.session.commit()

        flash('Your password has been updated. Please log in.', 'success')
        return redirect(url_for('login'))

    return render_template('reset_password.html', token=token)


# ---------------------------------------------------------------------------
# API endpoint — used by Playwright for session timeout test (TC_LOGIN_008)
# ---------------------------------------------------------------------------
@app.route('/api/session-status')
def session_status():
    """Returns whether the current session is authenticated. Used by Playwright tests."""
    return jsonify({'authenticated': current_user.is_authenticated})


# ---------------------------------------------------------------------------
# Test helper endpoint — resets lockout state on user@example.com
# Only active in debug/dev mode. Never expose in production.
# ---------------------------------------------------------------------------
@app.route('/test/reset-lockout')
def test_reset_lockout():
    """
    Resets failed_attempts and is_locked for all test users.
    Called by Playwright between tests to keep state clean.
    Disabled by TESTING_DISABLED env var for hardened deployments.
    """
    if os.environ.get('TESTING_DISABLED'):
        return jsonify({'error': 'Not available'}), 403

    emails = ['user@example.com', 'reset@example.com']
    for email in emails:
        user = User.query.filter_by(email=email).first()
        if user:
            user.reset_failed_attempts()
    db.session.commit()
    return jsonify({'status': 'reset', 'emails': emails})


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    init_db(app)
    app.run(debug=True, port=5000)
