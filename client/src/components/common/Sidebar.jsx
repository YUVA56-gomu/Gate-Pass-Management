import { Link } from 'react-router-dom'

function Sidebar({ role }) {
  const getMenuItems = () => {
    const menus = {
      student: [
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'Apply Pass', path: '/student/apply-pass' },
        { label: 'My Passes', path: '/student/my-passes' },
        { label: 'Notifications', path: '/student/notifications' },
        { label: 'Profile', path: '/student/profile' }
      ],
      coordinator: [
        { label: 'Dashboard', path: '/coordinator/dashboard' },
        { label: 'Pending Requests', path: '/coordinator/requests' },
        { label: 'History', path: '/coordinator/history' }
      ],
      hostel_staff: [
        { label: 'Dashboard', path: '/hostel/dashboard' },
        { label: 'Pending Requests', path: '/hostel/requests' },
        { label: 'Students', path: '/hostel/students' },
        { label: 'All Passes', path: '/hostel/all-passes' }
      ],
      security: [
        { label: 'Dashboard', path: '/security/dashboard' },
        { label: 'QR Scanner', path: '/security/scanner' },
        { label: 'Scan Logs', path: '/security/logs' }
      ],
      admin: [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Reports', path: '/admin/reports' },
        { label: 'Settings', path: '/admin/settings' }
      ]
    }
    return menus[role] || []
  }

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <nav className="space-y-2">
        {getMenuItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block p-2 rounded hover:bg-gray-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
