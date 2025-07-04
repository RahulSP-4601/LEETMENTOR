import { Link } from 'react-router-dom'
import './../css/navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-logo">LEETMENTOR</div>
        <div className="nav-links">
          <Link to="/get-started">Get Started</Link>
          {/* Add more options later as needed */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar