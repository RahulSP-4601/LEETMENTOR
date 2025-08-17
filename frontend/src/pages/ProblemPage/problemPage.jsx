// src/pages/ProblemPage.jsx
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect, useMemo } from "react"
import Split from "react-split"
import CodeEditor from "./../../components/CodeEditor.jsx"
import "./../../css/problemPage.css"
import TestCase from "./../../components/TestCase.jsx"

const languages = ["python", "javascript", "cpp", "java", "c"]

export default function ProblemPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const numericId = useMemo(() => {
    const n = Number(id)
    return Number.isFinite(n) ? n : null
  }, [id])

  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState("")
  const [problem, setProblem] = useState(null)
  const [testCases, setTestCases] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [starterLoading, setStarterLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch problem + test cases
  useEffect(() => {
    if (!numericId) {
      setError("Invalid problem id")
      setLoading(false)
      return
    }

    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/problems/${numericId}`, {
          credentials: "include",
        })
        if (!res.ok) {
          const msg = `Failed to load problem (${res.status})`
          throw new Error(msg)
        }
        const data = await res.json()
        if (!cancelled) {
          setProblem(data.problem)
          setTestCases(data.test_cases || [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to fetch problem")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [numericId])

  // Fetch starter code when language changes
  useEffect(() => {
    if (!numericId || !language) return

    let cancelled = false
    const run = async () => {
      try {
        setStarterLoading(true)
        const qs = new URLSearchParams({
          problem_id: String(numericId),
          language,
        })
        const res = await fetch(`/api/starter?${qs.toString()}`, {
          credentials: "include",
        })
        if (!res.ok) {
          // Don't hard fail the whole page if starter is missing.
          // Just leave the editor empty.
          console.warn("Starter fetch not OK:", res.status)
          return
        }
        const data = await res.json()
        // Accept either { starter: "..."} or { code: "..." }
        const starter = data.starter ?? data.code ?? ""
        if (!cancelled) setCode(starter)
      } catch (err) {
        console.error("Failed to fetch starter code:", err)
        // Non-fatal
      } finally {
        if (!cancelled) setStarterLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [numericId, language])

  const handleGoBack = () => navigate("/dashboard")

  const handleRunCode = async () => {
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, problem_id: numericId }),
      })
      if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(
          `Run failed (${response.status})${text ? `: ${text}` : ""}`
        )
      }
      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.error("Error executing code:", err)
    }
  }

  if (loading) {
    return <div className="problem-container">Loading problem...</div>
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
    )
  }

  if (!problem) {
    return (
      <div className="problem-container">
        <h2>Problem not found</h2>
        <button className="go-back-btn" onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="problem-container">
      {/* OUTER: left (problem) | right (editor+tests) */}
      <Split
        className="outer-split"
        sizes={[33, 67]}
        minSize={[240, 360]}
        gutterSize={8}
        direction="horizontal"
        cursor="col-resize"
      >
        {/* LEFT */}
        <div className="left-section">
          <h1>{problem.title}</h1>
          <h2>Description:</h2>
          <p>{problem.description}</p>
          {problem.example && (
            <>
              <h2>Example</h2>
              <pre>{problem.example}</pre>
            </>
          )}
        </div>

        {/* RIGHT: editor (top) | tests (bottom) */}
        <Split
          className="right-split"
          sizes={[60, 40]}
          minSize={[200, 160]}
          gutterSize={8}
          direction="vertical"
          cursor="row-resize"
        >
          {/* TOP: editor panel */}
          <div className="right-section editor-pane">
            <div className="top-bar">
              <h1>AI Interview</h1>
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

            {/* Editor */}
            <div className="editor-fill">
              <CodeEditor language={language} code={code} setCode={setCode} />
            </div>
          </div>

          {/* BOTTOM: tests */}
          <div className="right-section tests-pane">
            <TestCase testCases={testCases} results={results} />
          </div>
        </Split>
      </Split>
    </div>
  )
}
