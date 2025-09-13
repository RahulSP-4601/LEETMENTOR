# backend/app/services/voice_service.py
import io, os, uuid, re
from dataclasses import dataclass, field
from typing import Dict, Optional
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@dataclass
class SessionState:
    preferred_lang: str = "en"
    last_user_lang: str = "en"
    problem_context: str = ""

SESSIONS: Dict[str, SessionState] = {}

SYSTEM_PROMPT = """You are LeetMentor Voice Tutor.
- Be brief, clear, friendly.
- Explain code and algorithms step-by-step when asked.
- If the user says "preferred language", use the session preferred_lang.
- Otherwise, reply in the user's current spoken language.
- Keep explanations beginner-friendly with tiny examples.
"""

LANG_NAME_TO_CODE = {
    "english": "en", "hindi": "hi", "spanish": "es", "french": "fr", "german": "de",
    "mandarin": "zh", "chinese": "zh", "japanese": "ja", "korean": "ko",
    "gujarati": "gu", "marathi": "mr", "tamil": "ta", "telugu": "te", "bengali": "bn",
}

def _maybe_extract_explicit_lang(user_text: str) -> Optional[str]:
    m = re.search(r"(explain|speak|use|prefer).*?\b(in|is)\b\s+([A-Za-z]+)", user_text, re.IGNORECASE)
    if m:
        word = m.group(3).lower()
        return LANG_NAME_TO_CODE.get(word)
    return None

def _asked_for_preferred(user_text: str) -> bool:
    return bool(re.search(r"preferred\s+language", user_text, re.IGNORECASE))

def start_session(problem_text: str = "") -> str:
    sid = str(uuid.uuid4())
    SESSIONS[sid] = SessionState(problem_context=problem_text or "")
    return sid

def speech_to_text(file_bytes: bytes):
    # Whisper STT + language detection
    tr = client.audio.transcriptions.create(
        model="whisper-1",
        file=("input.wav", io.BytesIO(file_bytes)),
        response_format="verbose_json"
    )
    text = (tr.text or "").strip()
    lang = (tr.language or "en").lower()
    return text, lang

def choose_target_language(state: SessionState, user_text: str, user_lang: str) -> str:
    explicit = _maybe_extract_explicit_lang(user_text)
    if explicit:
        state.preferred_lang = explicit
        return explicit
    if _asked_for_preferred(user_text):
        return state.preferred_lang
    return user_lang or "en"

def tutor_reply(state: SessionState, user_text: str, target_lang: str) -> str:
    lang_note = f"Reply in ISO language '{target_lang}'."
    ctx = f"\n\nCurrent problem context:\n{state.problem_context}" if state.problem_context else ""
    msgs = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"{user_text}{ctx}\n\n{lang_note}"},
    ]
    chat = client.chat.completions.create(
        model=os.getenv("OPENAI_FAST_MODEL", "gpt-4o-mini"),
        messages=msgs,
        temperature=0.3,
        max_tokens=500,
    )
    return (chat.choices[0].message.content or "").strip()

def text_to_speech(ai_text: str) -> str:
    audio = client.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice="alloy",
        input=ai_text
    )
    out_id = str(uuid.uuid4())
    out_path = f"/tmp/{out_id}.mp3"
    with open(out_path, "wb") as f:
        f.write(audio.read())
    return out_id
