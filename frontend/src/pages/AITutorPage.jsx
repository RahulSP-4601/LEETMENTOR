// src/pages/AITutorPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Split from "react-split";
import CodeEditor from "./../components/CodeEditor.jsx";
import "./../css/problemPage.css";
import TestCase from "./../components/TestCase.jsx";
import ReactMarkdown from "react-markdown";

const languages = ["python", "javascript", "cpp", "java", "c"];

function AITutorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [chat, setChat] = useState([
    {
      role: "ai",
      text: "👋 Hi! I am your AI Tutor. I will guide you step-by-step for this problem."
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState([]);
  const [awaitingCodeConfirm, setAwaitingCodeConfirm] = useState(false);
  const [awaitingLangSelect, setAwaitingLangSelect] = useState(false);

  // Prevent double trigger of askAI on load
  const alreadyAskedRef = useRef(false);

  // Load problem and ask AI only once
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/problems/${id}`);
        const data = await res.json();
        setProblem(data.problem);
        setTestCases(data.test_cases);

        if (!alreadyAskedRef.current) {
          alreadyAskedRef.current = true;
          askAI("Explain the solution step by step.", data.problem.description, true);
        }
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      }
    };
    fetchProblem();
  }, [id]);

  // Fetch starter code
  useEffect(() => {
    const fetchStarterCode = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/starter?problem_id=${id}&language=${language}`
        );
        const data = await res.json();
        if (data.code) setCode(data.code);
      } catch (error) {
        console.error("Failed to fetch starter code:", error);
      }
    };

    if (id && language) fetchStarterCode();
  }, [id, language]);

  const handleGoBack = () => navigate("/dashboard");

  const handleRunCode = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, problem_id: id })
      });
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Error executing code:", error);
    }
  };

  // Ask AI
  const askAI = async (question, problemDesc = problem?.description, isAuto = false) => {
    if (!isAuto && !question.trim()) return;

    if (!isAuto) {
      setUserInput("");
      setChat((prev) => [...prev, { role: "user", text: question }]);
    }

    const mode = isAuto ? "explain" : "qa";          // <-- key change

    try {
      const res = await fetch("http://127.0.0.1:5000/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          question,               // filled for QA, harmless for explain
          problem: problemDesc
        })
      });
      const data = await res.json();

      setChat((prev) => {
        if (prev.some((m) => m.text === data.answer)) return prev;
        return [...prev, { role: "ai", text: data.answer }];
      });

      if (mode === "explain" && data.answer.includes("Would you like me to provide the code?")) {
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
        { role: "ai", text: "Please select a language for the code implementation:" }
      ]);
    } else {
      setChat((prev) => [
        ...prev,
        { role: "ai", text: "Okay! Try solving it on your own first. 👍" }
      ]);
    }
  };

  const requestCode = async (lang) => {
    setAwaitingLangSelect(false);
    setChat((prev) => [...prev, { role: "user", text: lang.toUpperCase() }]);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "code",
          language: lang,
          problem: problem?.description
        })
      });
      const data = await res.json();

      setChat((prev) => [
        ...prev,
        { role: "ai", text: `Here is the ${lang} code:\n\n${data.answer}` }
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Could not fetch the code right now." }
      ]);
    }
  };

  if (!problem) return <div className="problem-container">Loading...</div>;

  return (
    <div className="problem-container">
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
          <h1>{problem.title} (AI Tutor)</h1>

          <div className="chat-box-container">
            {chat.map((msg, idx) => (
              <div key={idx} className={`chat-msg ${msg.role}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
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
                <button className="run-btn" onClick={handleRunCode}>
                  RUN
                </button>
                <button className="submit-btn">SUBMIT</button>
                <button className="leave-btn">LEAVE</button>
              </div>
            </div>

            {/* Fill remaining height with Monaco */}
            <div className="editor-fill">
              <CodeEditor language={language} code={code} setCode={setCode} />
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
