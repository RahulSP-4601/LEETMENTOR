// src/components/TestCase.jsx
import { useState } from 'react'
import '../css/TestCase.css'

const testCases = [
  {
    input: 's = "abcabcbb"',
    output: '3',
    expected: '3',
  },
  {
    input: 's = "bbbbb"',
    output: '1',
    expected: '1',
  },
  {
    input: 's = "pwwkew"',
    output: '3',
    expected: '3',
  },
]

function TestCase() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="test-case-container">
      <div className="test-case-header">
        <h3>Test Cases</h3>
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
        <span className="status-msg">{testCases.length}/3 Test Cases Passed</span>
      </div>

      <div className="test-case-content">
        <p><strong>Input:</strong> {testCases[selectedIndex].input}</p>
        <p><strong>Your Output:</strong> {testCases[selectedIndex].output}</p>
        <p><strong>Expected Output:</strong> {testCases[selectedIndex].expected}</p>
      </div>
    </div>
  )
}

export default TestCase
