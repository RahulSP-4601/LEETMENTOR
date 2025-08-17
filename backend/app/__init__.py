from flask import Flask
from app.extensions import db
from app.controllers.auth_controller import auth_bp
from config import Config
from flask_jwt_extended import JWTManager
from app.routes import register_routes

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    # Mount under /api so the frontend can proxy to it
    app.register_blueprint(auth_bp, url_prefix="/api")  # -> /api/login, /api/me, /api/logout

    register_routes(app)
    return app
