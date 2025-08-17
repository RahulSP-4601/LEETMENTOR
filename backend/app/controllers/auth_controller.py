from flask import request, jsonify, Blueprint, make_response
from werkzeug.security import check_password_hash
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity,
    set_access_cookies, unset_jwt_cookies
)
from app.services.user_service import create_user, get_user_by_email, get_user_by_email_id
from app.extensions import db

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    name = data.get('name'); email = data.get('email'); password = data.get('password')
    if not all([name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400
    if get_user_by_email(email):
        return jsonify({'error': 'Email already exists'}), 409
    user = create_user(name, email, password)
    return jsonify({'message': 'Signup successful', 'user': {'id': user.id, 'email': user.email}}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email"); password = data.get("password")

    user = get_user_by_email(email) if email else None
    if not user or not check_password_hash(user.password, password or ""):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)
    resp = make_response(jsonify(message="Login successful"))
    set_access_cookies(resp, access_token)  # sets HttpOnly cookie
    return resp, 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required(optional=True, locations=["cookies"])  # <-- optional auth
def me():
    user_id = get_jwt_identity()
    if not user_id:
        # Not logged in: return 200 with a clear flag (no errors)
        return jsonify(authenticated=False, user=None), 200

    user = get_user_by_email_id(user_id)
    return jsonify(authenticated=True, user={"id": user.id, "email": user.email, "name": user.name}), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required(locations=["cookies"])
def logout():
    # If you stored tokens in DB, clear here
    resp = make_response(jsonify(message="Successfully logged out"))
    unset_jwt_cookies(resp)
    return resp, 200

@auth_bp.route("/protected", methods=["GET"])
@jwt_required(locations=["cookies"])
def protected():
    user_id = get_jwt_identity()
    user = get_user_by_email_id(user_id)
    return jsonify(message=f"Welcome, user {user.id}!")
