// src/components/sidebar.jsx
import '../css/sidebar.css'

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">AI Coding Platform</div>
      <ul className="nav-items">
        <li className="active">Problems</li>
        <li>AI Tutor</li>
        <li>AI Interviewer</li>
      </ul>
    </div>
  )
}
