# app/controllers/problem_controller.py
from flask import Blueprint, jsonify, request
from app.models.problem import Problem
from app.models.test_cases import TestCase

problem_bp = Blueprint('problem_bp', __name__)

# GET /api/problems
@problem_bp.route('/problems', methods=['GET'])
def get_all_problems():
    problems = Problem.query.all()
    return jsonify([
        {"id": p.id, "title": p.title, "difficulty": p.difficulty, "category": p.category}
        for p in problems
    ])

# GET /api/problems/<id>
@problem_bp.route('/problems/<int:problem_id>', methods=['GET'])
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
            "category": problem.category,
        },
        "test_cases": [
            {"id": tc.id, "input": tc.input, "expected_output": tc.expected_output}
            for tc in test_cases
        ],

    }), 200
