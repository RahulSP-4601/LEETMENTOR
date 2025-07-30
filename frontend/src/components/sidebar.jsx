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
      await fetch("http://127.0.0.1:5000/logout", {
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

  // Define menu items with their paths
  const menuItems = [
    { name: 'Problems', path: '/dashboard' },
    { name: 'AI Tutor', path: '/ai-tutor/1' },        // Use dynamic problem ID later
    { name: 'AI Interviewer', path: '/ai-interview/1' }
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
