# backend/app/routes/talk_routes.py
import os
from flask import Blueprint, request, jsonify, send_file
from app.services.voice_service import (
    start_session, speech_to_text, choose_target_language,
    tutor_reply, text_to_speech, SESSIONS
)

talk_bp = Blueprint("talk", __name__, url_prefix="/api/talk")

@talk_bp.post("/start")
def start():
    problem = request.form.get("problem", "")
    sid = start_session(problem)
    return jsonify({"session_id": sid})

@talk_bp.post("/message")
def message():
    session_id = request.form.get("session_id")
    if not session_id or session_id not in SESSIONS:
        return jsonify({"error": "invalid session_id"}), 400
    file = request.files.get("audio")
    if not file:
        return jsonify({"error": "missing audio"}), 400

    data = file.read()
    user_text, user_lang = speech_to_text(data)
    state = SESSIONS[session_id]
    state.last_user_lang = user_lang

    target_lang = choose_target_language(state, user_text, user_lang)
    ai_text = tutor_reply(state, user_text, target_lang)
    audio_id = text_to_speech(ai_text)

    return jsonify({
        "userText": user_text,
        "userLang": user_lang,
        "aiText": ai_text,
        "aiLang": target_lang,
        "audioUrl": f"/api/talk/audio/{audio_id}"
    })

@talk_bp.get("/audio/<audio_id>")
def audio(audio_id: str):
    path = f"/tmp/{audio_id}.mp3"
    if not os.path.exists(path):
        return jsonify({"error": "not found"}), 404
    return send_file(path, mimetype="audio/mpeg", download_name=f"reply-{audio_id}.mp3", as_attachment=False)
