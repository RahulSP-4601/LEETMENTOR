// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home from './pages/home.jsx'
import GetStarted from './pages/getstarted.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import Dashboard from './pages/dashboard.jsx'
import ProblemPage from './pages/ProblemPage/problemPage.jsx'
import AITutor from './pages/AITutorPage.jsx'
import Payment from './pages/payment.jsx'
// import AIInterview from './pages/AIInterviewPage.jsx' // when you have it

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/get-started" />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard /> {/* default: problems list */}
            </ProtectedRoute>
          }
        />

        {/* Normal problem solving (detail) */}
        <Route
          path="/problems/:id"
          element={
            <ProtectedRoute>
              <ProblemPage />
            </ProtectedRoute>
          }
        />

        {/* AI Tutor: LIST -> DETAIL (both show sidebar/active state) */}
        <Route
          path="/ai-tutor"
          element={
            <ProtectedRoute>
              <Dashboard basePath="/ai-tutor" title="AI Tutor — Pick a Problem" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-tutor/:id"
          element={
            <ProtectedRoute>
              <AITutor />
            </ProtectedRoute>
          }
        />

        {/* AI Interviewer: LIST -> DETAIL (enable detail when ready) */}
        <Route
          path="/ai-interview"
          element={
            <ProtectedRoute>
              <Dashboard basePath="/ai-interview" title="AI Interviewer — Pick a Problem" />
            </ProtectedRoute>
          }
        />
        {/*
        <Route
          path="/ai-interview/:id"
          element={
            <ProtectedRoute>
              <AIInterview />
            </ProtectedRoute>
          }
        />
        */}

        {/* Payment */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
