// src/components/audio.jsx
import { useEffect, useRef, useState } from "react";

export default function AudioTutor({ problemText = "", onExchange, compact = true }) {
  const [sessionId, setSessionId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState([]); // kept for standalone view
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    (async () => {
      const fd = new FormData();
      fd.append("problem", problemText || "");
      const res = await fetch("/api/talk/start", { method: "POST", body: fd });
      const data = await res.json();
      setSessionId(data.session_id);
    })();
  }, [problemText]);

  const startRec = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      await sendAudio(blob);
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
  };

  const stopRec = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const sendAudio = async (blob) => {
    if (!sessionId) return;

    if (!compact) {
      setMessages((m) => [...m, { role: "user", text: "…", lang: "detecting" }]);
    }

    const fd = new FormData();
    fd.append("session_id", sessionId);
    fd.append("audio", blob, "input.webm");

    const res = await fetch("/api/talk/message", { method: "POST", body: fd });
    const data = await res.json();

    // Push into parent chat if provided
    if (onExchange) {
      onExchange(
        { role: "user", text: data.userText },
        { role: "ai", text: data.aiText, audioUrl: data.audioUrl }
      );
    }

    // Maintain internal transcript if not compact
    if (!compact) {
      setMessages((m) => {
        const copy = [...m];
        const idx = copy.findIndex((x) => x.role === "user" && x.text === "…");
        if (idx !== -1) copy[idx] = { role: "user", text: data.userText, lang: data.userLang };
        else copy.push({ role: "user", text: data.userText, lang: data.userLang });
        copy.push({ role: "ai", text: data.aiText, lang: data.aiLang, audioUrl: data.audioUrl });
        return copy;
      });
    }

    // Autoplay AI audio
    if (data.audioUrl) {
      const a = new Audio(data.audioUrl);
      a.play().catch(() => {});
    }
  };

  return (
    <div className="voice-tutor" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {!recording ? (
        <button onClick={startRec} className="mic-button">🎙️</button>
      ) : (
        <button onClick={stopRec} className="mic-button" title="Stop">⏹</button>
      )}

      {!compact && (
        <div className="transcript" style={{ maxHeight: 400, overflowY: "auto", padding: 12, border: "1px solid #333", borderRadius: 8 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {m.role === "user" ? "You" : "AI Tutor"} · <code>{m.lang}</code>
              </div>
              <div style={{ background: m.role === "user" ? "#223" : "#1e1e1e", color: "#fff", padding: 10, borderRadius: 8 }}>
                {m.text}
              </div>
              {m.audioUrl && <audio controls src={m.audioUrl} style={{ marginTop: 6, width: "100%" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
