// frontend/components/sidebar.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import '../css/sidebar.css'

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const current = location.pathname.startsWith('/ai-tutor')
    ? 'AI Tutor'
    : location.pathname.startsWith('/ai-interview')
    ? 'AI Interviewer'
    : 'Problems'

  const [activeItem, setActiveItem] = useState(current)

  const handleLogout = async () => {
    try {
      await logout()                // server clears cookie
      navigate('/get-started')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const menuItems = [
    { name: 'Problems', path: '/dashboard' },
    { name: 'AI Tutor', path: '/ai-tutor' },
    { name: 'AI Interviewer', path: '/ai-interview' },
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
