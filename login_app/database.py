from models import db, User


def init_db(app):
    """
    Initialize the database and seed test users.
    Called once when the app starts if the database does not exist.
    """
    with app.app_context():
        db.create_all()
        seed_test_users()


def seed_test_users():
    """
    Create known test users for QA testing.
    Safe to call multiple times — skips users that already exist.

    Test accounts:
      user@example.com     / Password123!   — active, normal account
      locked@example.com   / Password123!   — pre-locked account (TC_LOGIN_005)
      reset@example.com    / Password123!   — account for password reset flow (TC_LOGIN_006)
    """
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

    for user_data in users:
        existing = User.query.filter_by(email=user_data['email']).first()
        if not existing:
            user = User(
                email=user_data['email'],
                name=user_data['name'],
                is_locked=user_data['is_locked'],
                failed_attempts=user_data['failed_attempts'],
            )
            user.set_password(user_data['password'])
            db.session.add(user)

    db.session.commit()
    print("Database seeded with test users.")
