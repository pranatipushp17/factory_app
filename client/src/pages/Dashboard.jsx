import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth()

  const links = [
    { to: '/workers', label: 'Workers', desc: 'Add and manage worker records' },
    { to: '/attendance', label: 'Attendance', desc: 'Mark daily attendance' },
    { to: '/advances', label: 'Advances', desc: 'Track advances given' },
    { to: '/expenses', label: 'Expenses', desc: 'Record factory expenses' },
    { to: '/salary', label: 'Salary Report', desc: 'View pay, advances and dues' }
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>FactoryKhata</h1>
          <p className="dashboard-greeting">Welcome back, {user?.name} 👋</p>
        </div>
        <button className="btn-sm-outline" onClick={logout}>Logout</button>
      </div>

      <div className="dashboard-grid">
        {links.map((link) => (
          <Link to={link.to} key={link.to} className="dashboard-card">
            <p className="dashboard-card-title">{link.label}</p>
            <p className="dashboard-card-desc">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Dashboard