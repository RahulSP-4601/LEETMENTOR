// src/pages/AITutorPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import Split from "react-split";
import CodeEditor from "./../components/CodeTutorEditor.jsx";
import "./../css/problemPage.css";
import TestCase from "./../components/TestCase.jsx";
import ReactMarkdown from "react-markdown";
import AudioTutor from "../components/audio.jsx";

const languages = ["python", "javascript", "cpp", "java", "c"];

function AITutorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const numericId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [chat, setChat] = useState([
    { role: "ai", text: "👋 Hi! I am your AI Tutor. I will guide you step-by-step for this problem." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState([]);
  const [awaitingCodeConfirm, setAwaitingCodeConfirm] = useState(false);
  const [awaitingLangSelect, setAwaitingLangSelect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starterLoading, setStarterLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // hidden audio element used for instant playback
  const ttsRef = useRef(null);

  // expose editor actions (CodeTutorEditor.jsx should assign: externalApiRef.current = { getCode: handleGetCode })
  const codeApiRef = useRef(null);

  // Prevent double trigger of askAI on load
  const alreadyAskedRef = useRef(false);

  // Load problem and (once) ask AI to explain
  useEffect(() => {
    if (!numericId) {
      setError("Invalid problem id");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/problems/${numericId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Failed to load problem (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) {
          setProblem(data.problem);
          setTestCases(data.test_cases || []);

          if (!alreadyAskedRef.current && data.problem?.description) {
            alreadyAskedRef.current = true;
            askAI("Explain the solution step by step.", data.problem.description, true);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to fetch problem");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [numericId]);

  // Fetch starter code for selected language
  useEffect(() => {
    if (!numericId || !language) return;

    let cancelled = false;
    const run = async () => {
      try {
        setStarterLoading(true);
        const qs = new URLSearchParams({
          problem_id: String(numericId),
          language,
        });
        const res = await fetch(`/api/starter?${qs.toString()}`, {
          credentials: "include",
        });
        if (!res.ok) {
          console.warn("Starter fetch not OK:", res.status);
          return;
        }
        const data = await res.json();
        const starter = data.starter ?? data.code ?? "";
        if (!cancelled) setCode(starter);
      } catch (err) {
        console.error("Failed to fetch starter code:", err);
      } finally {
        if (!cancelled) setStarterLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [numericId, language]);

  const handleGoBack = () => navigate("/dashboard");

  const handleRunCode = async () => {
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, problem_id: numericId }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Run failed (${response.status})${text ? `: ${text}` : ""}`);
      }
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Error executing code:", error);
    }
  };

  // ----- helpers -----
  const stopAllAudio = () => {
    try {
      if (ttsRef.current) {
        ttsRef.current.pause();
        ttsRef.current.currentTime = 0;
        ttsRef.current.src = "";
      }
      // pause any visible <audio> in chat too
      document.querySelectorAll(".chat-box-container audio").forEach((el) => {
        try { el.pause(); } catch {}
      });
    } catch {}
  };

  // ESC shortcut to stop speaking
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") stopAllAudio(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const maybeHandleVoiceCommand = (text) => {
    if (!text) return;

    const t = text.toLowerCase();

    // examples: "write code in my editor", "fill the code", "put the solution in the editor"
    const wantsCode =
      /write\s+code\s+in\s+my\s+editor/.test(t) ||
      /fill\s+(the\s+)?code/.test(t) ||
      /put\s+(the\s+)?solution\s+in\s+the\s+editor/.test(t) ||
      /generate\s+code\s+in\s+editor/.test(t);

    if (wantsCode) {
      codeApiRef.current?.getCode?.();
      setChat((prev) => [
        ...prev,
        { role: "ai", text: "🧠 Sure — generating code directly in your editor..." },
      ]);
    }
  };

  // Ask AI (text)
  const askAI = async (question, problemDesc = problem?.description, isAuto = false) => {
    if (!isAuto && !question.trim()) return;

    if (!isAuto) {
      // If typed command says "write code...", intercept and trigger editor
      maybeHandleVoiceCommand(question);
      setUserInput("");
      setChat((prev) => [...prev, { role: "user", text: question }]);
    }

    const mode = isAuto ? "explain" : "qa";

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          question, // populated for qa; harmless for explain
          problem: problemDesc,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`AI tutor error (${res.status})${text ? `: ${text}` : ""}`);
      }
      const data = await res.json();
      setChat((prev) => {
        if (prev.some((m) => m.text === data.answer)) return prev;
        return [...prev, { role: "ai", text: data.answer }];
      });

      if (mode === "explain" && typeof data.answer === "string" && data.answer.includes("Would you like me to provide the code?")) {
        setAwaitingCodeConfirm(true);
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setChat((prev) => [...prev, { role: "ai", text: "⚠️ Sorry, I could not process your request." }]);
    }
  };

  const handleCodeConfirm = (yes) => {
    setAwaitingCodeConfirm(false);
    if (yes) {
      setAwaitingLangSelect(true);
      setChat((prev) => [
        ...prev,
        { role: "ai", text: "Please select a language for the code implementation:" },
      ]);
    } else {
      setChat((prev) => [
        ...prev,
        { role: "ai", text: "Okay! Try solving it on your own first. 👍" },
      ]);
    }
  };

  const requestCode = async (lang) => {
    setAwaitingLangSelect(false);
    setChat((prev) => [...prev, { role: "user", text: lang.toUpperCase() }]);

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "code",
          language: lang,
          problem: problem?.description,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`AI code error (${res.status})${text ? `: ${text}` : ""}`);
      }
      const data = await res.json();
      setChat((prev) => [
        ...prev,
        { role: "ai", text: `Here is the ${lang.toUpperCase()} code:\n\n${data.answer}` },
      ]);
    } catch (error) {
      console.error("Failed to get AI code:", error);
      setChat((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Could not fetch the code right now." },
      ]);
    }
  };

  // Voice exchange handler — used by AudioTutor to push messages here
  const handleVoiceExchange = (userMsg, aiMsg) => {
    // If user commanded via voice to write code — do it
    maybeHandleVoiceCommand(userMsg?.text || "");

    setChat((prev) => [
      ...prev,
      { role: "user", text: userMsg.text },
      { role: "ai", text: aiMsg.text, audioUrl: aiMsg.audioUrl },
    ]);

    // Try to autoplay immediately through a hidden audio element
    if (aiMsg?.audioUrl && ttsRef.current) {
      try {
        ttsRef.current.src = aiMsg.audioUrl;
        const playPromise = ttsRef.current.play();
        if (playPromise?.catch) {
          playPromise.catch(() => setAutoplayBlocked(true));
        }
      } catch {
        setAutoplayBlocked(true);
      }
    }
  };

  const replayAudio = (url) => {
    if (!url || !ttsRef.current) return;
    try {
      ttsRef.current.src = url;
      ttsRef.current.play().catch(() => setAutoplayBlocked(true));
    } catch {
      setAutoplayBlocked(true);
    }
  };

  if (loading) {
    return <div className="problem-container">Loading problem...</div>;
  }

  if (error) {
    return (
      <div className="problem-container">
        <h2>Unable to load problem</h2>
        <p>{error}</p>
        <button className="go-back-btn" onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="problem-container">
        <h2>Problem not found</h2>
        <button className="go-back-btn" onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="problem-container">
      {/* Hidden audio tag to auto-play new TTS replies */}
      <audio ref={ttsRef} style={{ display: "none" }} />

      {/* OUTER SPLIT: Left (AI tutor) | Right (Editor + Tests) */}
      <Split
        className="outer-split"
        sizes={[33, 67]}
        minSize={[240, 360]}
        gutterSize={8}
        direction="horizontal"
        cursor="col-resize"
      >
        {/* LEFT SECTION */}
        <div className="left-section">
          {/* Header row with Stop button */}
          <div className="left-header" style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap: 8}}>
            <h1 style={{margin:0}}>{problem.title} (AI Tutor)</h1>
            <button
              className="stop-tts-btn"
              onClick={stopAllAudio}
              title="Stop AI audio (Esc)"
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #444",
                background: "#2b2b2b",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              ⏹ Stop
            </button>
          </div>

          {autoplayBlocked && (
            <div className="hint-banner" style={{ margin: "8px 0", fontSize: 12, opacity: 0.85 }}>
              🔇 Your browser blocked autoplay. Click any <b>play</b> button or press the mic once to enable sound.
            </div>
          )}

          <div className="chat-box-container">
            {chat.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.role}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>

                {/* If AI message has audio, show a player + replay/stop buttons */}
                {msg.role === "ai" && msg.audioUrl && (
                  <div style={{ marginTop: 6 }}>
                    <audio controls src={msg.audioUrl} style={{ width: "100%" }} />
                    <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => replayAudio(msg.audioUrl)}>
                        🔁 Replay
                      </button>
                      <button className="btn" onClick={stopAllAudio}>
                        ⏹ Stop
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {awaitingCodeConfirm && (
              <div className="button-row">
                <button onClick={() => handleCodeConfirm(true)}>Yes</button>
                <button onClick={() => handleCodeConfirm(false)}>No</button>
              </div>
            )}

            {awaitingLangSelect && (
              <div className="button-row">
                {languages.map((lang) => (
                  <button key={lang} onClick={() => requestCode(lang)}>
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask the AI Tutor..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI(userInput)}
            />
            <button className="mic-button" onClick={() => askAI(userInput)}>
              Send
            </button>

            {/* Mic: pressing it interrupts any current TTS, then starts recording in AudioTutor */}
            <span onMouseDown={stopAllAudio} onTouchStart={stopAllAudio}>
              <AudioTutor
                problemText={problem?.description || ""}
                compact={true}
                onExchange={handleVoiceExchange}
              />
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: INNER SPLIT (Editor on top, Test Cases bottom) */}
        <Split
          className="right-split"
          sizes={[60, 40]}
          minSize={[200, 160]}
          gutterSize={8}
          direction="vertical"
          cursor="row-resize"
        >
          {/* TOP: Editor */}
          <div className="right-section editor-pane">
            <div className="top-bar">
              <h1>AI Tutor Mode</h1>
              <button className="go-back-btn" onClick={handleGoBack}>
                Go Back
              </button>
            </div>

            <div className="editor-header">
              <div className="editor-controls">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="language-select"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="action-buttons">
                <button className="run-btn" onClick={handleRunCode} disabled={starterLoading}>
                  {starterLoading ? "LOADING..." : "RUN"}
                </button>
                <button className="submit-btn">SUBMIT</button>
                <button className="leave-btn" onClick={handleGoBack}>LEAVE</button>
              </div>
            </div>

            {/* Fill remaining height with Monaco */}
            <div className="editor-fill">
              <CodeEditor
                language={language}
                problem={problem?.description}
                problemId={numericId}
                initialCode={code}
                onCodeChange={setCode}
                externalApiRef={codeApiRef}  // parent→child imperative API
              />
            </div>
          </div>

          {/* BOTTOM: Test cases */}
          <div className="right-section tests-pane">
            <TestCase testCases={testCases} results={results} />
          </div>
        </Split>
      </Split>
    </div>
  );
}

export default AITutorPage;
