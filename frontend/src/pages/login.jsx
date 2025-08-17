// frontend/pages/login.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      await login(email, password)        // sets cookie + fetches /me
      navigate("/dashboard")
    } catch (error) {
      setMessage(error.message || "Login failed")
    }
  }

  return (
    <div className="form-content">
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="submit-btn" onClick={handleLogin}>Log In</button>
      {message && <p>{message}</p>}
    </div>
  )
}
export default Login
