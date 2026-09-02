import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Secret key for session signing — change this to a random value in production
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

    # SQLite database stored in the login_app folder
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'users.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Session timeout: 30 minutes of inactivity (TC_LOGIN_008)
    PERMANENT_SESSION_LIFETIME = 1800  # seconds

    # Remember Me cookie duration: 30 days (TC_LOGIN_007)
    REMEMBER_COOKIE_DURATION = 60 * 60 * 24 * 30  # seconds

    # Account lockout threshold (TC_LOGIN_005)
    MAX_FAILED_ATTEMPTS = 5
