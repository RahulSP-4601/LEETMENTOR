from flask import Flask
from flask_cors import CORS
from app.extensions import db
from app.controllers.auth_controller import auth_bp
from config import Config
from flask_jwt_extended import JWTManager
from app.routes import register_routes

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])
    db.init_app(app)
    app.register_blueprint(auth_bp, url_prefix='/api')
    jwt.init_app(app)

    register_routes(app)  # ✅ This already includes problem_bp

    return app
