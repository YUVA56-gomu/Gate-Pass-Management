import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'
import { useEffect, useState } from 'react'

/**
 * Reusable Dashboard Header Component
 * Displays: Logo, System Name, Welcome Message, Notifications, Profile, Logout
 */
export const DashboardHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useNotification()
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    if (unreadCount) {
      setNotificationCount(unreadCount)
    }
  }, [unreadCount])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfile = () => {
    const roleMap = {
      'STUDENT': '/student/profile',
      'COORDINATOR': '/coordinator/profile',
      'HOSTEL_STAFF': '/hostel/profile',
      'SECURITY': '/security/profile',
      'ADMIN': '/admin/profile'
    }
    navigate(roleMap[user?.role] || '/login')
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and System Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SMART GATE PASS</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>

          {/* Center: Welcome Message */}
          <div className="hidden md:block text-center">
            <p className="text-sm text-gray-600">
              Hello, <span className="font-semibold text-gray-900">{user?.name}</span> 👋
            </p>
            <p className="text-xs text-gray-500">Welcome back! Here's what's happening today</p>
          </div>

          {/* Right: Notifications, Profile, Logout */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              onClick={() => navigate(user?.role === 'STUDENT' ? '/student/notifications' : '#')}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={handleProfile}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
