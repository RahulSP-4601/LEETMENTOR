from flask import Blueprint, request, jsonify
from app.models.test_cases import TestCase
from app.services.code_executor import execute_code
from app.utils.validators import deep_equal
import ast

run_code_bp = Blueprint("run_code_bp", __name__)

def parse_output(value):
    try:
        return ast.literal_eval(value)
    except Exception:
        return value

@run_code_bp.route('/api/run', methods=['POST'])
def run_code():
    data = request.get_json()
    language = data.get('language')
    code = data.get('code')
    problem_id = data.get('problem_id')

    if not all([language, code, problem_id]):
        return jsonify({"error": "Missing fields"}), 400

    test_cases = TestCase.query.filter_by(problem_id=problem_id).limit(10).all()
    results = []
    passed_count = 0

    for tc in test_cases:
        result = execute_code(language, code, tc.input)
        raw_output = result.get("output", "").strip()
        expected_output = tc.expected_output.strip()

        parsed_output = parse_output(raw_output)
        parsed_expected = parse_output(expected_output)

        # Normalize tuple vs list
        if isinstance(parsed_output, tuple):
            parsed_output = list(parsed_output)
        if isinstance(parsed_expected, tuple):
            parsed_expected = list(parsed_expected)

        passed = deep_equal(parsed_output, parsed_expected)

        if passed:
            passed_count += 1

        results.append({
            "input": tc.input,
            "expected_output": expected_output,
            "output": raw_output,
            "error": result.get("error", ""),
            "passed": passed
        })

    return jsonify({
        "results": results,
        "passed": passed_count,
        "total": len(test_cases),
        "all_passed": passed_count == len(test_cases)
    })
