import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ChatBox from './../../components/ChatBox.jsx'
import CodeEditor from './../../components/CodeEditor.jsx'
import './../../css/problemPage.css'
import TestCase from './../../components/TestCase'

const dummyProblem = {
  id: 1,
  title: 'Longest Substring Without Repeating Characters',
  description:
    'Given a string s, find the length of the longest substring without repeating characters.',
  example: `Input: s = "abcabcbb"\nOutput: 3`,
}

const languages = ['python', 'javascript', 'cpp', 'java', 'c']

function ProblemPage() {
  const { id } = useParams()
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [chat, setChat] = useState('Hello, I’ll be conducting your coding interview today.')
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate('/dashboard')
  }
  return (
    <div className="problem-container">
      <div className="left-section">
        <h1>{dummyProblem.title}</h1>
        <h2>Description:</h2>
        <p>{dummyProblem.description}</p>
        <h2>Example</h2>
        <pre>{dummyProblem.example}</pre>
        <ChatBox chat={chat} />
      </div>

      <div className="right-section">
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
            <button className="run-btn">RUN</button>
            <button className="submit-btn">SUBMIT</button>
            <button className="leave-btn">LEAVE</button>
          </div>
        </div>

        <CodeEditor language={language} code={code} setCode={setCode} />
        <TestCase />
      </div>
    </div>
  )
}

export default ProblemPage
