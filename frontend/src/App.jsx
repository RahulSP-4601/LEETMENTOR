// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home from './pages/home.jsx'
import GetStarted from './pages/getstarted.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import Dashboard from './pages/dashboard.jsx'
import ProblemPage from './pages/ProblemPage/problemPage.jsx'
import Payment from  './pages/payment.jsx'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/get-started" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔐 Protect Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/problems/:id" element={<ProblemPage />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  )
}

export default App
