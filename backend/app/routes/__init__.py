# app/routes/__init__.py
from app.routes.problem_routes import problem_bp 

def register_routes(app):
    app.register_blueprint(problem_bp)
