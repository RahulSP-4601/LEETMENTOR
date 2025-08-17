# app/controllers/starter_code_controller.py

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.starter_code import StarterCode

starter_bp = Blueprint('starter_bp', __name__)

@starter_bp.route('/starter', methods=['GET'])
def get_starter_code():
    problem_id = request.args.get('problem_id')
    language = request.args.get('language')

    if not problem_id or not language:
        return jsonify({"error": "Missing problem_id or language"}), 400

    starter = StarterCode.query.filter_by(problem_id=problem_id, language=language).first()

    if not starter:
        return jsonify({"error": "Starter code not found"}), 404

    return jsonify({"code": starter.code})
