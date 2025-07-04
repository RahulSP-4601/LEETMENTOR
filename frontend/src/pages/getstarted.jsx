// src/pages/getstarted.jsx
import { useState } from 'react'
import Login from './login'
import Signup from './signup'
import './../css/getstarted.css'

function GetStarted() {
  const [selectedForm, setSelectedForm] = useState('login')

  return (
    <div className="getstarted-container">
      <div className="getstarted-box">
        <div className="button-group">
          <button
            className={`toggle-btn ${selectedForm === 'login' ? 'active' : ''}`}
            onClick={() => setSelectedForm('login')}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${selectedForm === 'signup' ? 'active' : ''}`}
            onClick={() => setSelectedForm('signup')}
          >
            Signup
          </button>
        </div>
        <div className="form-area">
          {selectedForm === 'login' ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  )
}

export default GetStarted
