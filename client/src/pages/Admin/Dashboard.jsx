import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { getDashboardStats, getAllUsers } from '../../api/admin.api'
import { DashboardHeader } from '../../components/dashboard/DashboardHeader'
import { RoleNavigation } from '../../components/dashboard/RoleNavigation'
import { StatsCard } from '../../components/dashboard/StatsCard'

/**
 * Admin Dashboard
 * Main dashboard for admin users with statistics, user management, and system overview
 */
export const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { showNotification } = useNotification()

  // State management
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('ALL')

  // Navigation items for admin
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'User Management', path: '/admin/users', icon: '👥' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' }
  ]

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, usersData] = await Promise.all([
          getDashboardStats(),
          getAllUsers('ALL')
        ])

        if (statsData.success) {
          setStats(statsData.data)
        }

        if (usersData.success) {
          setUsers(usersData.data || [])
          setFilteredUsers(usersData.data || [])
        }
      } catch (error) {
        showNotification('Failed to load dashboard data', 'error')
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [showNotification])

  // Handle search and filter
  useEffect(() => {
    let filtered = users

    // Apply role filter
    if (userFilter !== 'ALL') {
      filtered = filtered.filter(u => u.role === userFilter)
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [searchTerm, userFilter, users])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <DashboardHeader />

      {/* Navigation */}
      <RoleNavigation items={navItems} />

      {/* Main Content */}
      <div className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-12 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Welcome Text */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Welcome to Admin Dashboard
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Manage your gate pass system efficiently. Monitor student passes, coordinate with staff, and maintain security protocols all in one place.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
                  >
                    Manage Users
                  </button>
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                  >
                    View Reports
                  </button>
                </div>
              </div>

              {/* Right: Hero Graphic */}
              <div className="relative h-96 flex items-center justify-center">
                {/* Decorative bubbles */}
                <div className="absolute w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl top-0 right-0"></div>
                <div className="absolute w-24 h-24 bg-purple-200 rounded-full opacity-20 blur-3xl bottom-10 left-0"></div>

                {/* Central Shield with Checkmark */}
                <div className="relative z-10">
                  {/* Dotted circle background */}
                  <div className="absolute inset-0 w-48 h-48 border-2 border-dashed border-blue-300 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>

                  {/* Shield */}
                  <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl relative z-20">
                    <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Floating Card - Top Right: Student Pass */}
                <div className="absolute top-8 right-0 z-30 glass-sm p-4 rounded-xl shadow-lg w-48 animate-bounce" style={{ animationDelay: '0s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      ST
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Student Pass</p>
                      <p className="text-xs text-green-600 font-medium">✓ Pass Logged</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card - Top Left: QR Pass */}
                <div className="absolute top-12 left-0 z-30 glass-sm p-4 rounded-xl shadow-lg w-40 animate-bounce" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm5-3a1 1 0 00-1 1v2a1 1 0 002 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">QR Pass</p>
                      <p className="text-xs text-purple-600 font-medium">Active</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card - Bottom Right: Security */}
                <div className="absolute bottom-8 right-4 z-30 glass-sm p-4 rounded-xl shadow-lg w-48 animate-bounce" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      SG
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Security</p>
                      <p className="text-xs text-blue-600 font-medium">✓ Verified</p>
                    </div>
                  </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Cards - First Row */}
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                label="Total Students"
                value={stats?.totalStudents || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-11-3v3m0 0h3m-3 0L10.5 1.5m0 4.5h3" /></svg>}
                color="blue"
              />
              <StatsCard
                label="Coordinators"
                value={stats?.totalCoordinators || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>}
                color="purple"
              />
              <StatsCard
                label="Hostel Staff"
                value={stats?.totalHostelStaff || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>}
                color="green"
              />
              <StatsCard
                label="Security Guards"
                value={stats?.totalSecurityGuards || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                color="orange"
              />
            </div>
          </div>
        </section>

        {/* Main Content Area - 3 Column Layout */}
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left: Recent Users Table (3 cols) */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      View All →
                    </button>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="STUDENT">Students</option>
                      <option value="COORDINATOR">Coordinators</option>
                      <option value="HOSTEL_STAFF">Hostel Staff</option>
                      <option value="SECURITY">Security</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.slice(0, 8).map((u) => (
                          <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-3 px-4 text-gray-900 font-medium">{u.name}</td>
                            <td className="py-3 px-4 text-gray-600 text-sm">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                u.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Quick Actions & Overview (1 col) */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/admin/users')}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-semibold text-sm"
                    >
                      + Add User
                    </button>
                    <button
                      onClick={() => navigate('/admin/reports')}
                      className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-semibold text-sm"
                    >
                      Generate Report
                    </button>
                    <button
                      onClick={() => navigate('/admin/settings')}
                      className="w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-semibold text-sm"
                    >
                      System Settings
                    </button>
                  </div>
                </div>

                {/* System Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="font-bold text-gray-900">{stats?.activeUsers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending Passes</span>
                      <span className="font-bold text-gray-900">{stats?.pendingPasses || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Today's Passes</span>
                      <span className="font-bold text-gray-900">{stats?.todaysPasses || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 rounded-xl shadow-md p-6 border border-yellow-200">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-yellow-900 text-sm">Important</p>
                      <p className="text-xs text-yellow-800 mt-1">
                        Review pending user approvals regularly to maintain system security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Cards - Second Row */}
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pass Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                label="Total Passes"
                value={stats?.totalPasses || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" /></svg>}
                color="blue"
              />
              <StatsCard
                label="Approved"
                value={stats?.approvedPasses || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                color="green"
              />
              <StatsCard
                label="Rejected"
                value={stats?.rejectedPasses || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
                color="red"
              />
              <StatsCard
                label="Students Outside"
                value={stats?.studentsOutside || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>}
                color="yellow"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-600 text-sm">
                © 2024 Smart Gate Pass Management System. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default AdminDashboard
