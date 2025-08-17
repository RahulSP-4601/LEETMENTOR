// frontend/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthed, setIsAuthed] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" }) // if using Vite proxy; otherwise http://127.0.0.1:5000/api/me
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated) {
          setUser(data.user)
          setIsAuthed(true)
        } else {
          setUser(null)
          setIsAuthed(false)
        }
      } else {
        setUser(null)
        setIsAuthed(false)
      }
    } catch {
      setUser(null)
      setIsAuthed(false)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchMe() // restore session on refresh
  }, [])

  const login = async (email, password) => {
    const res = await fetch("/api/login", {
      method: "POST",
      credentials: "include",              // <- crucial for cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || "Login failed")
    }
    // Cookie is set by server; now fetch /me to populate user
    await fetchMe()
  }

  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    setUser(null)
    setIsAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthed, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
