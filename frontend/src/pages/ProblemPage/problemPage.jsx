// src/pages/ProblemPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ChatBox from './../../components/ChatBox.jsx'
import CodeEditor from './../../components/CodeEditor.jsx'
import './../../css/problemPage.css'
import TestCase from './../../components/TestCase.jsx'

const languages = ['python', 'javascript', 'cpp', 'java', 'c']

function ProblemPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [chat, setChat] = useState('Hello, I’ll be conducting your coding interview today.')
  const [problem, setProblem] = useState(null)
  const [testCases, setTestCases] = useState([])
  const [results, setResults] = useState([])

  // Fetch problem + test cases
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/problems/${id}`)
        const data = await res.json()
        setProblem(data.problem)
        setTestCases(data.test_cases)
      } catch (error) {
        console.error('Failed to fetch problem:', error)
      }
    }

    fetchProblem()
  }, [id])

  // Fetch starter code
  useEffect(() => {
    const fetchStarterCode = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/starter?problem_id=${id}&language=${language}`)
        const data = await res.json()
        if (data.code) setCode(data.code)
      } catch (error) {
        console.error('Failed to fetch starter code:', error)
      }
    }

    if (id && language) {
      fetchStarterCode()
    }
  }, [id, language])

  const handleGoBack = () => {
    navigate('/dashboard')
  }

  const handleRunCode = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          problem_id: id
        }),
      })

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Error executing code:', error)
    }
  }

  if (!problem) return <div className="problem-container">Loading...</div>

  return (
    <div className="problem-container">
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
        <ChatBox chat={chat} setChat={setChat}/>
      </div>

      <div className="right-section">
        <div className="top-bar">
          <h1>AI Interview</h1>
          <button className="go-back-btn" onClick={handleGoBack}>Go Back</button>
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
            <button className="run-btn" onClick={handleRunCode}>RUN</button>
            <button className="submit-btn">SUBMIT</button>
            <button className="leave-btn">LEAVE</button>
          </div>
        </div>

        <CodeEditor language={language} code={code} setCode={setCode} />
        <TestCase testCases={testCases} results={results} />
      </div>
    </div>
  )
}

export default ProblemPage
