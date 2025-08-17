import os
from .llm_client import call_gemini

FAST_MODEL = os.getenv("GEMINI_FAST_MODEL", "gemini-1.5-flash")
CODE_MODEL = os.getenv("GEMINI_CODE_MODEL", "gemini-1.5-pro")

EXPLAIN_PROMPT = """You are LeetMentor AI Tutor.
Format (Markdown):
1) One-line friendly greeting + problem name.
2) Two realistic companies that ask it.
3) Two approaches ONLY:
   • Way 1 (Brute Force): tiny example + which indices match.
   • Way 2 (Optimized canonical idea).
4) For each way: bullet Time & Space.
End with: "Would you like me to provide the code? (Yes/No)"
Problem:
{PROBLEM}
"""

QA_PROMPT = """You are LeetMentor AI Tutor (Q&A).
Answer ONLY the user's specific question about the SAME problem.
Keep it tight (2–6 sentences).
Problem:
{PROBLEM}
Question:
{QUESTION}
"""

CODE_PROMPT = """You are LeetMentor AI Tutor codegen.
Output ONLY {LANG} code inside ```{LANG}``` fences. No extra text.
Problem:
{PROBLEM}
"""

def _plan(mode: str):
    if mode == "explain": return FAST_MODEL, 380, 0.2
    if mode == "qa":      return FAST_MODEL, 300, 0.2
    if mode == "code":    return CODE_MODEL, 700, 0.15
    return FAST_MODEL, 300, 0.2

def run_agent(mode: str, *, problem: str, question: str = "", language: str | None = None):
    model, max_tokens, temp = _plan(mode)

    if mode == "explain":
        prompt = EXPLAIN_PROMPT.format(PROBLEM=problem.strip())
        return call_gemini(model, [{"text": prompt}], max_output_tokens=max_tokens, temperature=temp)

    if mode == "qa":
        if not question.strip():
            return None, "Missing question for QA mode"
        prompt = QA_PROMPT.format(PROBLEM=problem.strip(), QUESTION=question.strip())
        return call_gemini(model, [{"text": prompt}], max_output_tokens=max_tokens, temperature=temp)

    if mode == "code":
        if not language:
            return None, "Missing language"
        prompt = CODE_PROMPT.format(LANG=language.lower(), PROBLEM=problem.strip())
        return call_gemini(model, [{"text": prompt}], max_output_tokens=max_tokens, temperature=temp)

    return None, "Invalid mode"
