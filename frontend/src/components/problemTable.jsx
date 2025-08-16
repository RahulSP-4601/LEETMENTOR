import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../css/problemTable.css'

/**
 * basePath controls where each problem row links to.
 * Examples:
 *  - "/problems"      -> normal practice
 *  - "/ai-tutor"      -> AI Tutor flow
 *  - "/ai-interview"  -> AI Interviewer flow
 */
export default function ProblemTable({ basePath = '/problems', title = 'AI-Powered Coding Practice' }) {
  const [problems, setProblems] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/problems')
      .then((res) => res.json())
      .then((data) => setProblems(data))
      .catch((err) => console.error('Error fetching problems:', err))
  }, [])

  return (
    <div className="problem-table">
      <h1>{title}</h1>
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
                <Link to={`${basePath}/${problem.id}`} className="problem-link">
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
