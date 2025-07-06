from app.models.user import User
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

def create_user(name, email, password):
    hashed_password = generate_password_hash(password)
    user = User(name=name, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return user

def get_user_by_email(email):
    return User.query.filter_by(email=email).first()

def validate_user(email, password):
    user = get_user_by_email(email)
    if user and check_password_hash(user.password, password):
        return user
    return None

def get_user_by_email_id(user_id):
    return User.query.get(user_id)
