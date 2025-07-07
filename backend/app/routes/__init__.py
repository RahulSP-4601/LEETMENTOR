# app/routes/__init__.py
from app.controllers.problem_controller import problem_bp

def register_routes(app):
    app.register_blueprint(problem_bp)
