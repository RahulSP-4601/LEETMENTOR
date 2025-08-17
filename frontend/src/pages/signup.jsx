import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()
  const handleSignup = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Signup successful!")
        navigate("/dashboard")
      } else {
        setMessage(data.error || "Signup failed")
      }
    } catch (error) {
      setMessage("Something went wrong")
    }
  }

  return (
    <div className="form-content">
      <h2>Signup</h2>
      <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="submit-btn" onClick={handleSignup}>Sign Up</button>
      {message && <p>{message}</p>}
    </div>
  )
}

export default Signup
