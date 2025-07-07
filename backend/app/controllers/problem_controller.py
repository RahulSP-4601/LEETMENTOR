# app/controllers/problem_controller.py
from flask import Blueprint, jsonify
from app.models.problem import Problem
from app.models.test_cases import TestCase
from app.extensions import db

problem_bp = Blueprint('problem_bp', __name__)

@problem_bp.route('/api/problems/<int:problem_id>', methods=['GET'])
def get_problem_by_id(problem_id):
    problem = Problem.query.get(problem_id)
    if not problem:
        return jsonify({"error": "Problem not found"}), 404

    test_cases = TestCase.query.filter_by(problem_id=problem_id).all()

    return jsonify({
        "problem": {
            "id": problem.id,
            "title": problem.title,
            "description": problem.description,
            "difficulty": problem.difficulty,
            "category": problem.category
        },
        "test_cases": [
            {
                "id": tc.id,
                "input": tc.input,
                "expected_output": tc.expected_output
            }
            for tc in test_cases
        ]
    }), 200
