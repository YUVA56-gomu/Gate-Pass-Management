import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as approvalAPI from '../../api/approval.api'
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
    totalProcessed: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Get pending requests
      const pendingResponse = await approvalAPI.getPendingRequests()
      const pending = pendingResponse.data || []

      // Get history
      const historyResponse = await approvalAPI.getApprovalHistory()
      const history = historyResponse.data || []

      // Calculate statistics
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const approvedToday = history.filter((item) => {
        const approvedDate = new Date(item.approved_at)
        approvedDate.setHours(0, 0, 0, 0)
        return item.status === 'APPROVED' && approvedDate.getTime() === today.getTime()
      }).length

      const rejectedToday = history.filter((item) => {
        const approvedDate = new Date(item.approved_at)
        approvedDate.setHours(0, 0, 0, 0)
        return item.status === 'REJECTED' && approvedDate.getTime() === today.getTime()
      }).length

      setStats({
        pending: pending.length,
        approvedToday,
        rejectedToday,
        totalProcessed: history.length
      })

      // Get recent activity (last 5 from history)
      setRecentActivity(history.slice(0, 5))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Navigation items
  const navigationItems = [
    { label: 'Dashboard', path: '/coordinator/dashboard', icon: '🏠' },
    { label: 'Pending Requests', path: '/coordinator/requests', icon: '📋' },
    { label: 'History', path: '/coordinator/history', icon: '📊' }
  ]

  // Quick actions
  const quickActions = [
    { label: 'Review Requests', description: 'Approve or reject pending long leave requests', path: '/coordinator/requests', icon: '📋' },
    { label: 'View History', description: 'Check all approvals you have processed', path: '/coordinator/history', icon: '📊' }
  ]

  const getStatusBadge = (status) => {
    const statusColors = {
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const tableColumns = [
    { key: 'Pass.Student.User.name', label: 'Student Name', render: (val, row) => row.Pass?.Student?.User?.name || 'N/A' },
    { key: 'Pass.type', label: 'Pass Type', render: (val) => val === 'LONG_LEAVE' ? '📋 Long Leave' : '📅 Daily' },
    { key: 'status', label: 'Decision', render: (val) => <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(val)}`}>{val}</span> },
    { key: 'approved_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader />

      {/* Navigation */}
      <RoleNavigation items={navigationItems} />

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              label="Pending Requests"
              value={stats.pending}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="blue"
            />
            <StatsCard
              label="Approved Today"
              value={approvedToday}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              color="green"
            />
            <StatsCard
              label="Rejected Today"
              value={stats.rejectedToday}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
              color="red"
            />
            <StatsCard
              label="Total Processed"
              value={stats.totalProcessed}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="purple"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActionsPanel actions={quickActions} />
          </div>

          {/* Recent Activity */}
          <RecentActivityTable
            title="Recent Requests"
            columns={tableColumns}
            data={recentActivity}
            loading={loading}
            empty="No recent activity"
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
