from flask import Blueprint, request, jsonify
from app.services.ai_agent import run_agent
import logging

ai_tutor_bp = Blueprint("ai_tutor_bp", __name__)
log = logging.getLogger(__name__)

@ai_tutor_bp.route("/ai-tutor", methods=["POST"])
def ai_tutor():
    data = request.get_json() or {}
    mode = data.get("mode", "explain")
    problem = (data.get("problem") or "").strip()
    question = (data.get("question") or "").strip()
    language = data.get("language")

    if not problem:
        return jsonify({"error": "Missing problem", "mode": mode}), 400

    text, err = run_agent(mode, problem=problem, question=question, language=language)

    if err or not text:
        # Log with context for ops/observability
        log.error(
            "AI tutor failure",
            extra={
                "mode": mode,
                "language": language,
                "len_problem": len(problem),
                "len_question": len(question),
                "error": err or "No text",
            },
        )
        # Return details so the frontend can display a useful message
        return jsonify({
            "error": "Gemini error",
            "details": err or "No response",
            "mode": mode
        }), 502

    return jsonify({"mode": mode, "answer": text.strip()})
