import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleLink = () => {
    switch (user?.role) {
      case 'student':
        return '/student/dashboard'
      case 'coordinator':
        return '/coordinator/dashboard'
      case 'hostel_staff':
        return '/hostel/dashboard'
      case 'security':
        return '/security/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={getRoleLink()} className="text-xl font-bold">
          Smart Gate Pass
        </Link>
        <div className="flex items-center gap-4">
          <span>{user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
