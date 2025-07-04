// src/pages/dashboard.jsx
import Sidebar from '../components/sidebar.jsx'
import ProblemTable from '../components/problemTable.jsx'
import '../css/dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <ProblemTable />
    </div>
  )
}

export default Dashboard
