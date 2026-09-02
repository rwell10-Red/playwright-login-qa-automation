from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(UserMixin, db.Model):
    """
    User model — stores all login-related state.
    Covers: valid login, lockout, remember me, session, password reset.
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    # Account lockout fields (TC_LOGIN_005)
    failed_attempts = db.Column(db.Integer, default=0, nullable=False)
    is_locked = db.Column(db.Boolean, default=False, nullable=False)
    locked_at = db.Column(db.DateTime, nullable=True)

    # Password reset fields (TC_LOGIN_006)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Hash and store password using Werkzeug bcrypt-style hashing."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify a plaintext password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    def increment_failed_attempts(self, max_attempts=5):
        """
        Increment failed login counter.
        Lock account when threshold is reached.
        Returns True if account just became locked.
        """
        self.failed_attempts += 1
        if self.failed_attempts >= max_attempts:
            self.is_locked = True
            self.locked_at = datetime.utcnow()
            return True
        return False

    def reset_failed_attempts(self):
        """Clear failed attempt counter on successful login."""
        self.failed_attempts = 0
        self.is_locked = False
        self.locked_at = None

    def __repr__(self):
        return f'<User {self.email}>'
