// src/pages/dashboard.jsx
import Sidebar from '../components/sidebar.jsx'
import ProblemTable from '../components/ProblemTable.jsx' // make sure the casing matches the file
import '../css/dashboard.css'

/**
 * Reusable list page with sidebar.
 * - basePath: where rows should link to ("/problems" | "/ai-tutor" | "/ai-interview")
 * - title: page heading
 */
function Dashboard({ basePath = '/problems', title = 'AI-Powered Coding Practice' }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <ProblemTable basePath={basePath} title={title} />
      </div>
    </div>
  )
}

export default Dashboard
