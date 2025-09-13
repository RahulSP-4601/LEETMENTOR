from flask import Flask
from app.extensions import db
from app.controllers.auth_controller import auth_bp
from config import Config
from flask_jwt_extended import JWTManager
from app.routes import register_routes
from flask_cors import CORS

# NEW
from app.routes.talk_routes import talk_bp

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS if your Vite dev server hits Flask
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    jwt.init_app(app)

    # Existing
    app.register_blueprint(auth_bp, url_prefix="/api")
    register_routes(app)

    # NEW voice tutor routes
    app.register_blueprint(talk_bp)  # already has url_prefix="/api/talk"

    return app
