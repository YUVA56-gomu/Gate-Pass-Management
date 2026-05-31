# Dashboard Rebuild - Quick Reference Guide

## COPY-PASTE TEMPLATES FOR REMAINING DASHBOARDS

### Template: Hostel Staff Dashboard
**File**: `client/src/pages/Hostel/Dashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as hostelAPI from '../../api/hostel.api'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import RoleNavigation from '../../components/dashboard/RoleNavigation'
import StatsCard from '../../components/dashboard/StatsCard'
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel'
import RecentActivityTable from '../../components/dashboard/RecentActivityTable'

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    activePasses: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await hostelAPI.getDashboard()
      const { stats: dashboardStats, recentActivity: activity } = response.data
      setStats(dashboardStats)
      setRecentActivity(activity)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { label: 'Dashboard', path: '/hostel/dashboard', icon: '🏠' },
    { label: 'Pending Requests', path: '/hostel/requests', icon: '📋' },
    { label: 'Students', path: '/hostel/students', icon: '👥' },
    { label: 'All Passes', path: '/hostel/all-passes', icon: '📄' }
  ]

  const quickActions = [
    { label: 'Review Requests', description: 'Approve or reject pending passes', path: '/hostel/requests', icon: '📋' },
    { label: 'Student Directory', description: 'View all hostel students', path: '/hostel/students', icon: '👥' },
    { label: 'View All Passes', description: 'Check all pass records', path: '/hostel/all-passes', icon: '📄' }
  ]

  const getStatusBadge = (status) => {
    const statusColors = {
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'PENDING_HOSTEL': 'bg-yellow-100 text-yellow-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const tableColumns = [
    { key: 'Pass.Student.User.name', label: 'Student', render: (val, row) => row.Pass?.Student?.User?.name || 'N/A' },
    { key: 'Pass.type', label: 'Pass Type', render: (val) => val === 'LONG_LEAVE' ? '📋 Long Leave' : '📅 Daily' },
    { key: 'status', label: 'Decision', render: (val) => <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(val)}`}>{val}</span> },
    { key: 'approved_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <RoleNavigation items={navigationItems} />
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard label="Pending Passes" value={stats.pending} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} color="blue" />
            <StatsCard label="Approved Today" value={stats.approvedToday} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} color="green" />
            <StatsCard label="Rejected Today" value={stats.rejectedToday} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} color="red" />
            <StatsCard label="Active Passes" value={stats.activePasses} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} color="purple" />
          </div>
          <div className="mb-8">
            <QuickActionsPanel actions={quickActions} />
          </div>
          <RecentActivityTable title="Recent Activity" columns={tableColumns} data={recentActivity} loading={loading} empty="No recent activity" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
```

---

### Template: Security Dashboard
**File**: `client/src/pages/Security/Dashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as securityAPI from '../../api/security.api'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import RoleNavigation from '../../components/dashboard/RoleNavigation'
import StatsCard from '../../components/dashboard/StatsCard'
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel'
import RecentActivityTable from '../../components/dashboard/RecentActivityTable'

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
    const interval = setInterval(fetchDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await securityAPI.getDashboardStats()
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.message || 'Failed to load dashboard')
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { label: 'Dashboard', path: '/security/dashboard', icon: '🏠' },
    { label: 'QR Scanner', path: '/security/scanner', icon: '📱' },
    { label: 'Scan Logs', path: '/security/logs', icon: '📊' }
  ]

  const quickActions = [
    { label: 'Open QR Scanner', description: 'Scan student passes at gate', path: '/security/scanner', icon: '📱' },
    { label: 'View Scan Logs', description: 'Check all scan records', path: '/security/logs', icon: '📊' }
  ]

  const tableColumns = [
    { key: 'studentName', label: 'Student Name' },
    { key: 'studentUSN', label: 'USN' },
    { key: 'passType', label: 'Pass Type', render: (val) => val === 'DAILY' ? '📅 Daily' : '📋 Long Leave' },
    { key: 'action', label: 'Action', render: (val) => <span className={`px-2 py-1 rounded text-xs font-medium ${val === 'OUT' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{val}</span> },
    { key: 'scannedAt', label: 'Time', render: (val) => new Date(val).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  ]

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <RoleNavigation items={navigationItems} />
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard label="Today OUT" value={stats?.todayOut || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>} color="orange" />
            <StatsCard label="Today IN" value={stats?.todayIn || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1" /></svg>} color="green" />
            <StatsCard label="Active Passes" value={stats?.activePasses || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="blue" />
            <StatsCard label="Total Scans" value={stats?.totalScans || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} color="purple" />
          </div>
          <div className="mb-8">
            <QuickActionsPanel actions={quickActions} />
          </div>
          <RecentActivityTable title="Recent Scan Activity" columns={tableColumns} data={stats?.recentActivity || []} loading={loading} empty="No recent activity" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
```

---

### Template: Admin Dashboard
**File**: `client/src/pages/Admin/Dashboard.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as adminAPI from '../../api/admin.api'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import RoleNavigation from '../../components/dashboard/RoleNavigation'
import StatsCard from '../../components/dashboard/StatsCard'
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel'
import RecentActivityTable from '../../components/dashboard/RecentActivityTable'

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
    const interval = setInterval(fetchDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAPI.getDashboardStats()
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.message || 'Failed to load dashboard')
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Reports', path: '/admin/reports', icon: '📊' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' }
  ]

  const quickActions = [
    { label: 'Create User', description: 'Add new staff member', path: '/admin/users', icon: '➕' },
    { label: 'Manage Users', description: 'Edit or deactivate users', path: '/admin/users', icon: '👥' },
    { label: 'View Reports', description: 'System reports and analytics', path: '/admin/reports', icon: '📊' },
    { label: 'System Settings', description: 'Configure system parameters', path: '/admin/settings', icon: '⚙️' }
  ]

  const tableColumns = [
    { key: 'timestamp', label: 'Time', render: (val) => new Date(val).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    { key: 'action', label: 'Action' },
    { key: 'user', label: 'User' },
    { key: 'details', label: 'Details' }
  ]

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <RoleNavigation items={navigationItems} />
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Users Statistics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatsCard label="Total Students" value={stats?.users?.totalStudents || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} color="blue" />
              <StatsCard label="Coordinators" value={stats?.users?.totalCoordinators || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} color="purple" />
              <StatsCard label="Hostel Staff" value={stats?.users?.totalHostelStaff || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m5.581 0a2 2 0 100-4 2 2 0 000 4zm0 0a2 2 0 110-4 2 2 0 010 4z" /></svg>} color="green" />
              <StatsCard label="Security Staff" value={stats?.users?.totalSecurityStaff || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="orange" />
              <StatsCard label="Admins" value={stats?.users?.totalAdmins || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>} color="red" />
            </div>
          </div>

          {/* Passes Statistics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Passes</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard label="Total Passes" value={stats?.passes?.totalPasses || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} color="blue" />
              <StatsCard label="Approved" value={stats?.passes?.approvedPasses || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="green" />
              <StatsCard label="Rejected" value={stats?.passes?.rejectedPasses || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="red" />
              <StatsCard label="Students Outside" value={stats?.security?.studentsOutside || 0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} color="orange" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActionsPanel actions={quickActions} />
          </div>

          {/* Recent Activity */}
          <RecentActivityTable title="Recent Activity" columns={tableColumns} data={stats?.recentActivity || []} loading={loading} empty="No recent activity" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
```

---

## IMPLEMENTATION STEPS

1. Copy the appropriate template for each dashboard
2. Replace the file content in the respective dashboard file
3. Run diagnostics to check for errors
4. Test the dashboard in the browser
5. Verify all quick actions navigate correctly
6. Check that statistics display properly

## QUICK CHECKLIST

- [ ] Hostel Staff Dashboard updated
- [ ] Security Dashboard updated
- [ ] Admin Dashboard updated
- [ ] All imports verified
- [ ] No TypeScript errors
- [ ] All quick actions working
- [ ] All navigation items working
- [ ] Statistics displaying correctly
- [ ] Recent activity table showing data
- [ ] Responsive design verified

---

**Time to Complete**: ~30 minutes for all three dashboards
