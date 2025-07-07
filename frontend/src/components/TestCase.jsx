// src/components/TestCase.jsx
import { useState } from 'react'
import '../css/TestCase.css'
function TestCase({ testCases }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!testCases.length) return <div>No test cases available.</div>

  return (
    <div className="test-case-container">
      <div className="test-case-header">
        <span>Test Cases</span>
        <div className="circle-btns">
          {testCases.map((_, i) => (
            <button
              key={i}
              className={`circle-btn ${selectedIndex === i ? 'active' : ''}`}
              onClick={() => setSelectedIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <span className="status-msg">{testCases.length}/10 Test Cases</span>
      </div>

      <div className="test-case-content">
        <p>Input: {testCases[selectedIndex].input}</p>
        <p>Your Output: -</p>
        <p>Expected Output: {testCases[selectedIndex].expected_output}</p>
      </div>
    </div>
  )
}

export default TestCase
