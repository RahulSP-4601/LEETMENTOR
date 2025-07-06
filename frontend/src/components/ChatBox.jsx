// src/components/ChatBox.jsx
import React from 'react'
import '../css/ChatBox.css'

export default function ChatBox({ chat }) {
  return (
    <>
      <div className="chat-box">
        <div className="ai-bubble">AI</div>
        <div className="chat-msg">{chat}</div>
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="Type a message..." />
        <button className="mic-button">🎤</button>
      </div>
    </>
  )
}
