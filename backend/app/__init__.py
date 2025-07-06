# app/__init__.py
from flask import Flask
from flask_cors import CORS
from app.extensions import db
from app.routes.auth_routes import auth_bp
from config import Config
from flask_jwt_extended import JWTManager

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:5173"])  
    db.init_app(app)
    app.register_blueprint(auth_bp, url_prefix='/api')
    jwt.init_app(app)

    return app
