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
            json={"contents": [{"parts": [{"text": prompt_text}]}]},
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

# ---------------- Prompts ----------------
EXPLAIN_SYSTEM = """You are LeetMentor AI Tutor. 
Respond in friendly, simple language and Markdown. 
For ANY problem, do ONLY the following in this order:
1) Greet briefly and name the problem.
2) Say one or two top companies that ask it (invent if unknown, but keep it realistic).
3) Explain EXACTLY TWO WAYS:
   - Way 1: Brute force with a tiny example and the indices that add up.
   - Way 2: Optimized using the canonical DS/technique (e.g., hash map for Two Sum).
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

QA_SYSTEM = """You are LeetMentor AI Tutor in Q&A mode.
The user already saw the full explanation. Now:
- Answer ONLY the user's specific question about the SAME problem.
- Be concise and targeted. 2–6 sentences or a short numbered list.
- Include a tiny code fragment or formula only if it directly answers the question.
- DO NOT re-explain the entire problem, and DO NOT ask whether to provide code.
- If the question is unclear, ask a single clarifying question instead of guessing.
"""

# ---------------- Route ----------------
@ai_tutor_bp.route("/api/ai-tutor", methods=["POST"])
def ai_tutor():
    data = request.get_json() or {}
    mode = data.get("mode", "explain")
    problem_description = data.get("problem", "") or ""
    question = data.get("question", "") or ""
    language = data.get("language")

    if mode == "explain":
        prompt = f"""{EXPLAIN_SYSTEM}

Problem:
{problem_description}

User request:
{question or "Explain step-by-step and end with asking for code."}
"""
        text, err = call_gemini(prompt)
        if err or not text:
            return jsonify({"error": "Gemini error", "details": err or "No response"}), 500
        return jsonify({"mode": "explain", "answer": text.strip()})

    if mode == "qa":
        if not question.strip():
            return jsonify({"error": "Missing question for QA mode"}), 400
        prompt = f"""{QA_SYSTEM}

Problem:
{problem_description}

User question:
{question}
"""
        text, err = call_gemini(prompt)
        if err or not text:
            return jsonify({"error": "Gemini error", "details": err or "No response"}), 500
        return jsonify({"mode": "qa", "answer": text.strip()})

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
        return jsonify({"mode": "code", "answer": text.strip()})

    return jsonify({"error": "Invalid mode"}), 400
