from flask import request, jsonify
from app.services.user_service import create_user, get_user_by_email, validate_user

def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if get_user_by_email(email):
        return jsonify({'error': 'Email already exists'}), 409

    user = create_user(name, email, password)
    return jsonify({'message': 'Signup successful', 'user': {'id': user.id, 'email': user.email}}), 201

def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = validate_user(email, password)
    if user:
        return jsonify({'message': 'Login successful', 'user': {'id': user.id, 'email': user.email}}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401
