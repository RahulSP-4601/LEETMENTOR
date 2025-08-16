import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import '../css/sidebar.css'

export default function Sidebar() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // keep active state in sync with URL
  const current = location.pathname.startsWith('/ai-tutor')
    ? 'AI Tutor'
    : location.pathname.startsWith('/ai-interview')
    ? 'AI Interviewer'
    : 'Problems'

  const [activeItem, setActiveItem] = useState(current)

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:5000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      logout()
      navigate('/get-started')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const menuItems = [
    { name: 'Problems', path: '/dashboard' },   // normal practice
    { name: 'AI Tutor', path: '/ai-tutor' },    // list view first
    { name: 'AI Interviewer', path: '/ai-interview' }, // list view first
  ]

  return (
    <div className="sidebar">
      <div className="logo">AI Coding Platform</div>
      <ul className="nav-items">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={activeItem === item.name ? 'active' : ''}
            onClick={() => {
              setActiveItem(item.name)
              navigate(item.path)
            }}
          >
            {item.name}
          </li>
        ))}
      </ul>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}
