import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home.jsx'
// import Login, Signup (later)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
      </Routes>
    </Router>
  )
}

export default App
