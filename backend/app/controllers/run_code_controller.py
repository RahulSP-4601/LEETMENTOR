# app/controllers/run_code_controller.py

from flask import Blueprint, request, jsonify
from app.models.test_cases import TestCase
from app.services.code_executor import execute_code

run_code_bp = Blueprint("run_code_bp", __name__)

@run_code_bp.route('/api/run', methods=['POST'])
def run_code():
    data = request.get_json()
    language = data.get('language')
    code = data.get('code')
    problem_id = data.get('problem_id')

    if not all([language, code, problem_id]):
        return jsonify({"error": "Missing fields"}), 400

    test_cases = TestCase.query.filter_by(problem_id=problem_id).limit(3).all()
    results = []

    for tc in test_cases:
        result = execute_code(language, code, tc.input)
        result_data = {
            "input": tc.input,
            "expected_output": tc.expected_output,
            "output": result.get("output", ""),
            "error": result.get("error", ""),
            "passed": result.get("output", "").strip() == tc.expected_output.strip()
        }
        results.append(result_data)

    return jsonify({"results": results})
