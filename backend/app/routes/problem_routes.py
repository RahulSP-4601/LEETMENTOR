# app/routes/problem_routes.py

from flask import Blueprint, jsonify
from app.models.problem import Problem  # adjust path if needed
from app.extensions import db

problem_bp = Blueprint("problem_bp", __name__)

@problem_bp.route("/api/problems", methods=["GET"])
def get_all_problems():
    problems = Problem.query.all()
    problem_list = [
        {
            "id": p.id,
            "title": p.title,
            "difficulty": p.difficulty,
            "category": p.category
        }
        for p in problems
    ]
    return jsonify(problem_list)
