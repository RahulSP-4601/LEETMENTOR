// src/components/sidebar.jsx
import { useState } from 'react'
import '../css/sidebar.css'

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Problems')

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
    </div>
  )
}
