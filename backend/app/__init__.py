from flask import Flask
from app.extensions import db
from app.routes.auth_routes import auth_bp
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    app.register_blueprint(auth_bp, url_prefix='/api')

    return app
