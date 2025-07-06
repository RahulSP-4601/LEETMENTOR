// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import GetStarted from './pages/getstarted.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import Dashboard from './pages/dashboard.jsx' // <-- Import
import ProblemPage from './pages/ProblemPage/problemPage.jsx'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* <-- Add this */}
        <Route path="/problems/:id" element={<ProblemPage />} />

      </Routes>
    </Router>
  )
}

export default App
