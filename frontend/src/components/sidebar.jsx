// src/components/sidebar.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../css/sidebar.css'

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Problems')
  const { logout, token } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch("http://127.0.0.1:5000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      logout()
      navigate("/get-started")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  const menuItems = ['Problems', 'AI Tutor', 'AI Interviewer']

  return (
    <div className="sidebar">
      <div className="logo">AI Coding Platform</div>
      <ul className="nav-items">
        {menuItems.map((item) => (
          <li
            key={item}
            className={activeItem === item ? 'active' : ''}
            onClick={() => setActiveItem(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}
