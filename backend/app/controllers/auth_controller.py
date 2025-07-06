from flask import request, jsonify
from werkzeug.security import check_password_hash
from app.services.user_service import create_user, get_user_by_email
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask import Blueprint
from app.extensions import db 

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if get_user_by_email(email):
        return jsonify({'error': 'Email already exists'}), 409

    user = create_user(name, email, password)
    return jsonify({'message': 'Signup successful', 'user': {'id': user.id, 'email': user.email}}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)
    user.jwt_token = access_token
    db.session.commit()

    return jsonify(access_token=access_token), 200

@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    user = get_user_by_email_id(user_id)

    # Check if token matches the one in DB
    current_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if user.jwt_token != current_token:
        return jsonify({"error": "Token revoked or expired"}), 401

    return jsonify(message=f"Welcome, user {user.id}!")

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    user = get_user_by_email_id(user_id)

    user.jwt_token = None
    db.session.commit()
    return jsonify(message="Successfully logged out"), 200
