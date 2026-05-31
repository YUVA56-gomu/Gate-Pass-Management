import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as passAPI from '../../api/pass.api'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import RoleNavigation from '../../components/dashboard/RoleNavigation'
import StatsCard from '../../components/dashboard/StatsCard'
import QuickActionsPanel from '../../components/dashboard/QuickActionsPanel'
import RecentActivityTable from '../../components/dashboard/RecentActivityTable'
import InstructionsPanel from '../../components/dashboard/InstructionsPanel'

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch passes on mount
  useEffect(() => {
    fetchPasses()
  }, [])

  const fetchPasses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await passAPI.getMyPasses()
      setPasses(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load passes')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalPasses = passes.length
  const approvedPasses = passes.filter(p => p.status === 'APPROVED').length
  const pendingPasses = passes.filter(p => p.status?.includes('PENDING')).length
  const rejectedPasses = passes.filter(p => p.status === 'REJECTED').length

  // Get recent applications (last 5)
  const recentApplications = passes.slice(0, 5)

  // Navigation items
  const navigationItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: '🏠' },
    { label: 'Apply Pass', path: '/student/apply-pass', icon: '📝' },
    { label: 'My Passes', path: '/student/my-passes', icon: '📋' },
    { label: 'Notifications', path: '/student/notifications', icon: '🔔' },
    { label: 'Profile', path: '/student/profile', icon: '👤' }
  ]

  // Quick actions
  const quickActions = [
    { label: 'Apply for Pass', description: 'Request a new daily pass or long leave', path: '/student/apply-pass', icon: '📝' },
    { label: 'My Passes', description: 'View all your pass applications', path: '/student/my-passes', icon: '📋' },
    { label: 'View Notifications', description: 'Check approval status and updates', path: '/student/notifications', icon: '🔔' },
    { label: 'Update Profile', description: 'Complete or update your profile', path: '/student/profile', icon: '👤' }
  ]

  // Instructions
  const instructions = [
    'Daily Pass is valid only between 9:00 AM to 6:00 PM',
    'You must return on the same day for daily passes',
    'Long Leave requires Coordinator and Hostel approval',
    'Carry your physical ID card while going out',
    'Scan QR code at gate entry and exit'
  ]

  const getStatusBadge = (status) => {
    const statusColors = {
      'PENDING_HOSTEL': 'bg-yellow-100 text-yellow-800',
      'PENDING_COORDINATOR': 'bg-blue-100 text-blue-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'COMPLETED': 'bg-purple-100 text-purple-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const tableColumns = [
    { key: 'type', label: 'Pass Type', render: (val) => val === 'DAILY' ? '📅 Daily Pass' : '📋 Long Leave' },
    { key: 'createdAt', label: 'Applied Date', render: (val) => new Date(val).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) },
    { key: 'from_date', label: 'From Date', render: (val) => new Date(val).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) },
    { key: 'status', label: 'Status', render: (val) => <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(val)}`}>{val?.replace(/_/g, ' ')}</span> }
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
              label="Total Passes"
              value={totalPasses}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              color="blue"
            />
            <StatsCard
              label="Approved Passes"
              value={approvedPasses}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              color="green"
            />
            <StatsCard
              label="Pending Passes"
              value={pendingPasses}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="yellow"
            />
            <StatsCard
              label="Rejected Passes"
              value={rejectedPasses}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
              color="red"
            />
          </div>

          {/* Main Grid: Quick Actions + Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Quick Actions - Takes 2 columns */}
            <div className="lg:col-span-2">
              <QuickActionsPanel actions={quickActions} />
            </div>

            {/* Instructions - Takes 1 column */}
            <div>
              <InstructionsPanel title="Important Instructions" items={instructions} icon="📋" />
            </div>
          </div>

          {/* Recent Applications */}
          <RecentActivityTable
            title="Recent Applications"
            columns={tableColumns}
            data={recentApplications}
            loading={loading}
            empty="No passes yet. Start by applying for a pass."
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
