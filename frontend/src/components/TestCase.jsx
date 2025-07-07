// src/components/TestCase.jsx
import { useState } from 'react'
import '../css/TestCase.css'

export default function TestCase({ testCases, results }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!testCases.length) return <div>No test cases available.</div>

  const currentResult = results?.[selectedIndex]

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
        <p>Your Output: {currentResult ? currentResult.output : '-'}</p>
        <p>Expected Output: {testCases[selectedIndex].expected_output}</p>
        {currentResult && (
          <p style={{ color: currentResult.passed ? 'lime' : 'red' }}>
            {currentResult.passed ? '✔ Passed' : '❌ Failed'}
          </p>
        )}
      </div>
    </div>
  )
}
