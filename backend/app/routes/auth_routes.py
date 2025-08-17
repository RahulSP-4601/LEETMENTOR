# app/routes/auth_routes.py
from flask import Blueprint
from app.controllers.auth_controller import signup, login, protected, logout

auth_bp = Blueprint('auth_bp', __name__)

auth_bp.add_url_rule('/signup', view_func=signup, methods=['POST'])
auth_bp.add_url_rule('/login', view_func=login, methods=['POST'])
auth_bp.add_url_rule('/protected', view_func=protected, methods=['GET'])
auth_bp.add_url_rule('/logout', view_func=logout, methods=['POST', 'OPTIONS'])
