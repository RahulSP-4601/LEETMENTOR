// src/components/ProblemTable.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../css/problemTable.css'

export default function ProblemTable() {
  const [problems, setProblems] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/problems')
      .then((res) => res.json())
      .then((data) => setProblems(data))
      .catch((err) => console.error('Error fetching problems:', err))
  }, [])

  return (
    <div className="problem-table">
      <h1>AI-Powered Coding Practice</h1>
      <button className="start-practice-btn">Start Practice</button>
      <h2>Problems</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr key={problem.id}>
              <td>{problem.id}</td>
              <td>
                <Link to={`/problems/${problem.id}`} className="problem-link">
                  {problem.title}
                </Link>
              </td>
              <td>
                <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
