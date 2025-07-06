// src/components/ProblemTable.jsx
import '../css/problemTable.css'
import { Link } from 'react-router-dom'

export default function ProblemTable() {
  const problems = [
    { id: 1, title: 'Two Sum', difficulty: 'Easy' },
    { id: 2, title: 'Valid Parentheses', difficulty: 'Easy' },
    { id: 3, title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
    { id: 4, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
    { id: 5, title: 'Valid Palindrome', difficulty: 'Easy' },
    { id: 6, title: 'Invert Binary Tree', difficulty: 'Easy' },
    { id: 7, title: 'Balanced Binary Tree', difficulty: 'Easy' },
    { id: 8, title: 'Linked List Cycle', difficulty: 'Medium' },
    { id: 9, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Medium' },
  ]

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
