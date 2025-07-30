from flask import Blueprint, request, jsonify
import os, requests

ai_tutor_bp = Blueprint("ai_tutor_bp", __name__)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"

def call_gemini(prompt_text):
    if not GEMINI_API_KEY:
        return None, "Gemini API key not configured"

    try:
        resp = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {"parts": [{"text": prompt_text}]}
                ]
            },
            timeout=30
        )
        if resp.status_code != 200:
            return None, resp.text
        data = resp.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        return text, None
    except Exception as e:
        return None, str(e)

EXPLAIN_SYSTEM = """You are LeetMentor AI Tutor. 
Respond in friendly, simple language and Markdown. 
For ANY problem, do ONLY the following in this order:
1) Greet briefly and name the problem.
2) Say one or two top companies that ask it (invent if unknown, but keep it realistic).
3) Explain EXACTLY TWO WAYS:
   - Way 1: Brute Force. Use a tiny made-up example array and show at a glance how the two indices add up.
   - Way 2: Optimized using a dictionary/hash map (or the canonical DS). Explain it like to a beginner.
4) For EACH way list Time Complexity and Space Complexity as bullet points.
5) End with EXACTLY this question on a new line:
   "Would you like me to provide the code? (Yes/No)"
Keep it concise, helpful, and encouraging.
"""

CODE_SYSTEM = """You are LeetMentor AI Tutor.
Output ONLY code in the requested language, wrapped in triple backticks with the correct language tag.
Do NOT add any explanation, comments, or extra text.
If starter code skeleton is provided, complete inside it and keep the same function name/signature.
"""

@ai_tutor_bp.route("/api/ai-tutor", methods=["POST"])
def ai_tutor():
    data = request.get_json() or {}
    mode = data.get("mode", "explain")
    problem_description = data.get("problem", "")
    question = data.get("question", "")
    language = data.get("language")

    if mode == "explain":
        prompt = f"""{EXPLAIN_SYSTEM}

Problem:
{problem_description}

User question:
{question or "Explain step-by-step and end with asking for code."}
"""
        text, err = call_gemini(prompt)
        if err or not text:
            return jsonify({"error": "Gemini error", "details": err or "No response"}), 500

        return jsonify({
            "mode": "explain",
            "answer": text.strip()
        })

    if mode == "code":
        if not language:
            return jsonify({"error": "Missing language"}), 400

        prompt = f"""{CODE_SYSTEM}
Language: {language}
Problem:
{problem_description}
"""
        text, err = call_gemini(prompt)
        if err or not text:
            return jsonify({"error": "Gemini error", "details": err or "No response"}), 500

        return jsonify({
            "mode": "code",
            "answer": text.strip()
        })

    return jsonify({"error": "Invalid mode"}), 400
