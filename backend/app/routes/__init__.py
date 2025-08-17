# app/routes/__init__.py
from app.controllers.problem_controller import problem_bp
from app.controllers.run_code_controller import run_code_bp 
from app.controllers.starter_code_controller import starter_bp 
from app.controllers.ai_tutor_controller import ai_tutor_bp

def register_routes(app):
    app.register_blueprint(problem_bp, url_prefix='/api')
    app.register_blueprint(run_code_bp, url_prefix='/api')
    app.register_blueprint(starter_bp, url_prefix='/api')
    app.register_blueprint(ai_tutor_bp, url_prefix='/api')