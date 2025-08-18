import os
from .llm_client import call_gemini

# ----- Models -----
FAST_MODEL = os.getenv("GEMINI_FAST_MODEL", "gemini-1.5-flash")
CODE_MODEL = os.getenv("GEMINI_CODE_MODEL", "gemini-1.5-pro")

# ----- Prompts -----
EXPLAIN_PROMPT = """You are LeetMentor AI Tutor.
Format (Markdown):
1) One-line friendly greeting + problem name.
2) Two realistic companies that ask it.
3) Two approaches ONLY:
   • Way 1 (Brute Force): tiny example + which indices match.
   • Way 2 (Optimized canonical idea).
4) For each way: bullet Time & Space Complexity.
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

# Generates fully commented code (used by "code_tutor" button if desired)
CODE_TUTOR_PROMPT = """You are LeetMentor AI Tutor codegen.
Write a COMPLETE, WORKING solution in {LANG} for the problem below.
IMPORTANT:
- Include friendly inline comments that explain the steps in simple words.
- Prefer clarity over terseness.
Return ONLY code inside ```{LANG}``` fences. No extra commentary outside.
Problem:
{PROBLEM}
"""

# NEW: language-aware body filler (no function signature, no outer braces)
CODE_FILL_PROMPT = """You are LeetMentor AI Tutor codegen (function body filler).
Target language: {LANG}

Return STRICT JSON (no markdown, no backticks) with EXACTLY:
{{
  "body": "<ONLY the function body statements (no signature, no outer braces/brackets)>",
  "helpers": "<0+ helper function definitions or empty string>"
}}

Absolute rules (do NOT violate):
- Output must be valid JSON only. No prose, no code fences, no comments outside JSON.
- DO NOT write any imports/includes, package statements, using namespace, or #includes.
- DO NOT redeclare classes, methods, or the target function signature.
- DO NOT close the function (no extra '}', '};', 'end', or ')').
- Keep comments short and instructional.

Language-specific constraints you MUST follow:
- python: Provide only statements for the existing method's body. No 'def ...:'.
- javascript: The project uses `var twoSum = function(...) { ... };`. Provide only statements valid inside those braces. No nested function or closing '};'.
- cpp: We already have `class Solution { ... vector<int> twoSum(...){ /*body*/ } ... }`. Give only statements valid inside that method. No `#include`, `class`, or braces.
- java: We already have `class Solution { public int[] twoSum(...){ /*body*/ } }`. Provide only statements valid inside that method. No `import`, `class`, or braces.
- c: Signature is `int* twoSum(int* nums, int numsSize, int target, int* returnSize)`.
  * You MUST set `*returnSize = 2` when a solution exists.
  * You MUST allocate with `int *res = (int*)malloc(2 * sizeof(int));` and return `res`.
  * Provide only statements valid inside the function. No typedefs, structs, main(), or includes.

Guidance:
- Prefer a single-pass hash-map/hashing approach if appropriate (e.g., Two Sum).
- Keep code clear and minimal.

PROBLEM:
{PROBLEM}

SKELETON:
{SKELETON}
"""


REVIEW_PROMPT = """You are LeetMentor Code Reviewer.
Given the problem and USER_CODE, analyze correctness and style.
Respond as STRICT JSON (no markdown, no code fences). Schema:
{
  "summary": "1-3 sentence overall feedback",
  "issues": [
    {
      "line": <int>,
      "start_col": <int>,
      "end_col": <int>,
      "severity": "error"|"warn"|"ok",
      "reason": "short description",
      "hint": "short hint to fix",
      "ok": <bool>
    }
  ]
}
Rules:
- If you cannot map a problem to a specific span, set start_col=1 and end_col=200.
- Keep messages SHORT and SIMPLE.
- Prefer pointing to missing logic by the closest related line.
Problem:
{PROBLEM}

USER_CODE ({LANG}):
{USER_CODE}
"""

# ----- Utilities -----
_ALLOWED_LANGS = {"python", "javascript", "cpp", "java", "c"}

def _normalize_lang(lang: str | None) -> str | None:
    if not lang:
        return None
    lang = str(lang).strip().lower()
    # Map common Monaco ids to your API languages if needed
    aliases = {
        "js": "javascript",
        "c++": "cpp",
        "typescript": "javascript",  # if you route TS to JS runner
    }
    lang = aliases.get(lang, lang)
    return lang if lang in _ALLOWED_LANGS else lang  # keep original if you support more

def _safe_truncate(text: str, max_chars: int = 16000) -> str:
    if not text:
        return ""
    if len(text) <= max_chars:
        return text
    # keep head and tail to preserve context
    head = text[: max_chars // 2]
    tail = text[-max_chars // 2 :]
    return head + "\n\n# ... [truncated for length] ...\n\n" + tail

def _plan(mode: str):
    if mode == "explain":    return FAST_MODEL, 380, 0.2
    if mode == "qa":         return FAST_MODEL, 300, 0.2
    if mode == "code":       return CODE_MODEL, 700, 0.15
    if mode == "code_tutor": return CODE_MODEL, 900, 0.15
    if mode == "review":     return FAST_MODEL, 700, 0.2
    if mode == "code_fill":  return CODE_MODEL, 800, 0.15
    return FAST_MODEL, 300, 0.2

# ----- Main entry -----
def run_agent(mode: str, *, problem: str, question: str = "", language: str | None = None):
    """
    Returns (text, err)
    - text: model text (string) or None
    - err:  error message (string) or None
    """
    lang = _normalize_lang(language)
    model, max_tokens, temperature = _plan(mode)

    try:
        if mode == "explain":
            prompt = EXPLAIN_PROMPT.format(PROBLEM=problem.strip())
            return call_gemini(
                model,
                [{"text": prompt}],
                max_output_tokens=max_tokens,
                temperature=temperature,
            )

        if mode == "qa":
            if not question.strip():
                return None, "Missing question for QA mode"
            prompt = QA_PROMPT.format(PROBLEM=problem.strip(), QUESTION=question.strip())
            return call_gemini(
                model,
                [{"text": prompt}],
                max_output_tokens=max_tokens,
                temperature=temperature,
            )

        if mode == "code":
            if not lang:
                return None, "Missing language"
            prompt = CODE_PROMPT.format(LANG=lang, PROBLEM=problem.strip())
            return call_gemini(
                model,
                [{"text": prompt}],
                max_output_tokens=max_tokens,
                temperature=temperature,
            )

        if mode == "code_tutor":
            if not lang:
                return None, "Missing language"
            prompt = CODE_TUTOR_PROMPT.format(LANG=lang, PROBLEM=problem.strip())
            return call_gemini(
                model,
                [{"text": prompt}],
                max_output_tokens=max_tokens,
                temperature=temperature,
            )

        if mode == "code_fill":
            if not lang:
                return None, "Missing language"
            if not question.strip():
                return None, "Missing skeleton for code_fill"
            prompt = CODE_FILL_PROMPT.format(
                LANG=lang,
                PROBLEM=problem.strip(),
                SKELETON=_safe_truncate(question),
            )
            # If your llm client supports response_mime_type, add it there.
            return call_gemini(
                model,
                [{"text": prompt}],
                max_output_tokens=max_tokens,
                temperature=temperature,
            )

        if mode == "review":
            if not lang:
                return None, "Missing language"
            if not question.strip():
                return None, "Missing code to review"
            prompt = REVIEW_PROMPT.format(
                PROBLEM=problem.strip(), LANG=lang, USER_CODE=_safe_truncate(question)
            )
            return call_gemini(
                model,
                [{"text": prompt}],
                max_output_tokens=max_tokens,
                temperature=temperature,
            )

        return None, "Invalid mode"

    except Exception as e:
        # Make sure the controller can surface a meaningful message
        return None, f"LLM call failed: {type(e).__name__}: {e}"
