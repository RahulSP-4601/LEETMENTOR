// src/pages/getstarted.jsx
import { Link } from 'react-router-dom'
import './../css/getstarted.css'

function GetStarted() {
  return (
    <div className="getstarted-container">
      <div className="getstarted-box">
        <Link to="/login" className="getstarted-btn">Login</Link>
        <Link to="/signup" className="getstarted-btn">Signup</Link>
      </div>
    </div>
  )
}

export default GetStarted