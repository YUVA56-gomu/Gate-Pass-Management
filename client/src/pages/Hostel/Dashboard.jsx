import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import * as hostelAPI from '../../api/hostel.api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { addNotification } = useNotification()

  // State management
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    studentsOutside: 0,
    totalPassesThisMonth: 0
  })
  const [pendingPasses, setPendingPasses] = useState([])
  const [allPasses, setAllPasses] = useState([])
  const [students, setStudents] = useState([])
  const [studentsOutside, setStudentsOutside] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedPass, setSelectedPass] = useState(null)
  const [showPassModal, setShowPassModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rejectRemarks, setRejectRemarks] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Today's Overview - will be populated from real backend data
  const [todayOverview, setTodayOverview] = useState({
    entriesIn: 0,
    exitsOut: 0,
    currentlyOutside: 0,
    expectedReturnsToday: 0
  })

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      console.log('[HOSTEL DASHBOARD] Fetching dashboard data...')

      const [dashboardData, pendingData, allPassesData, studentsData, outsideData, overviewData] = await Promise.all([
        hostelAPI.getDashboard(),
        hostelAPI.getPendingPasses(),
        hostelAPI.getAllPasses('ALL'),
        hostelAPI.getStudents(),
        hostelAPI.getStudentsOutside(),
        hostelAPI.getTodayOverview()
      ])

      console.log('[HOSTEL DASHBOARD] Dashboard data received:', {
        stats: dashboardData.data?.stats,
        pendingCount: pendingData.data?.length,
        allPassesCount: allPassesData.data?.length,
        studentsCount: studentsData.data?.length,
        outsideCount: outsideData.data?.length
      })

      if (dashboardData.success) {
        setStats(dashboardData.data.stats || {})
      }

      if (pendingData.success) {
        console.log('[HOSTEL DASHBOARD] Setting pending passes:', pendingData.data?.length)
        setPendingPasses(pendingData.data || [])
      }

      if (allPassesData.success) {
        console.log('[HOSTEL DASHBOARD] Setting all passes:', allPassesData.data?.length)
        setAllPasses(allPassesData.data || [])
      }

      if (studentsData.success) {
        console.log('[HOSTEL DASHBOARD] Setting students:', studentsData.data?.length)
        setStudents(studentsData.data || [])
      }

      if (outsideData.success) {
        setStudentsOutside(outsideData.data || [])
      }

      if (overviewData.success) {
        setTodayOverview(overviewData.data || {
          entriesIn: 0,
          exitsOut: 0,
          currentlyOutside: 0,
          expectedReturnsToday: 0
        })
      }
    } catch (err) {
      console.error('[HOSTEL DASHBOARD] Error fetching dashboard data:', err)
      addNotification('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }
  // Handle pass approval
  const handleApprovePass = async (passId) => {
    console.log('[HOSTEL DASHBOARD] Approve clicked, passId:', passId)
    try {
      const response = await hostelAPI.approvePass(passId, '')
      console.log('[HOSTEL DASHBOARD] Approve API response:', response)

      if (!response?.success) {
        console.error('[HOSTEL DASHBOARD] Approve failed (API):', response?.message)
        addNotification(response?.message || 'Failed to approve pass', 'error')
        return
      }

      await fetchDashboardData()
      setShowPassModal(false)
      setRejectRemarks('')
      addNotification('Pass approved successfully', 'success')
    } catch (err) {
      console.error('[HOSTEL DASHBOARD] Approve error:', err.response?.data || err.message)
      addNotification(err.response?.data?.message || 'Failed to approve pass', 'error')
    }
  }

  // Handle pass rejection
  const handleRejectPass = async (passId) => {
    if (!rejectRemarks || !rejectRemarks.trim()) {
      addNotification('Remarks are required for rejection', 'error')
      return
    }

    console.log('[HOSTEL DASHBOARD] Reject clicked, passId:', passId)
    try {
      const response = await hostelAPI.rejectPass(passId, rejectRemarks)
      console.log('[HOSTEL DASHBOARD] Reject API response:', response)

      if (!response?.success) {
        console.error('[HOSTEL DASHBOARD] Reject failed (API):', response?.message)
        addNotification(response?.message || 'Failed to reject pass', 'error')
        return
      }

      await fetchDashboardData()
      setShowPassModal(false)
      setRejectRemarks('')
      addNotification('Pass rejected successfully', 'success')
    } catch (err) {
      console.error('[HOSTEL DASHBOARD] Reject error:', err.response?.data || err.message)
      addNotification(err.response?.data?.message || 'Failed to reject pass', 'error')
    }
  }

  // Handle logout with confirmation
  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
    navigate('/login')
  }

  // Format date helper
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get coordinator status badge
  const getCoordinatorStatusBadge = (pass) => {
    if (pass.pass_type === 'DAILY') {
      return <span className="text-gray-500 text-sm">N/A</span>
    }
    
    if (pass.status === 'PENDING_COORDINATOR') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-orange-600 text-sm font-medium">Pending</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-green-600 text-sm font-medium">Approved</span>
      </div>
    )
  }

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.Department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Product Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Smart Gate Management</h1>
              </div>
            </div>

            {/* Center: Dashboard Title */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Hostel Staff Dashboard</h2>
              <p className="text-sm text-gray-600">Manage and approve student gate pass requests</p>
            </div>

            {/* Right: Profile and Logout */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/hostel/profile')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Top Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="font-semibold">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Pending Requests</span>
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('allpasses')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'allpasses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">All Passes</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="font-semibold">Students</span>
            </button>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Content - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Pending Requests Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pending || 0}</div>
                  <div className="text-sm text-gray-600 font-medium">Pending Requests</div>
                  {/* Decorative wave */}
                  <svg className="absolute bottom-0 left-0 w-full h-8 opacity-20" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M0,10 Q50,0 100,10 T200,10 L200,20 L0,20 Z" fill="#3B82F6" />
                  </svg>
                </div>

                {/* Approved Today Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.approvedToday || 0}</div>
                  <div className="text-sm text-gray-600 font-medium">Approved Today</div>
                  <svg className="absolute bottom-0 left-0 w-full h-8 opacity-20" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M0,10 Q50,0 100,10 T200,10 L200,20 L0,20 Z" fill="#10B981" />
                  </svg>
                </div>

                {/* Rejected Today Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.rejectedToday || 0}</div>
                  <div className="text-sm text-gray-600 font-medium">Rejected Today</div>
                  <svg className="absolute bottom-0 left-0 w-full h-8 opacity-20" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M0,10 Q50,0 100,10 T200,10 L200,20 L0,20 Z" fill="#EF4444" />
                  </svg>
                </div>

                {/* Students Outside Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stats.studentsOutside || 0}</div>
                  <div className="text-sm text-gray-600 font-medium">Students Outside</div>
                  <svg className="absolute bottom-0 left-0 w-full h-8 opacity-20" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M0,10 Q50,0 100,10 T200,10 L200,20 L0,20 Z" fill="#8B5CF6" />
                  </svg>
                </div>
              </div>
              {/* Pending Requests Table */}
              {activeTab === 'dashboard' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-lg font-bold text-gray-900">Pending Requests</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('pending')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                      >
                        View All
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {pendingPasses.length === 0 ? (
                      <div className="p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">No pending requests</p>
                        <p className="text-gray-400 text-sm mt-1">All caught up! New requests will appear here.</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">USN</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Pass Type</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Coordinator Status</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Dates</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Hostel Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {pendingPasses.slice(0, 6).map((pass) => (
                            <tr key={pass.id} className="hover:bg-gray-50 transition">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {pass.Student?.User?.name?.charAt(0) || 'S'}
                                  </div>
                                  <span className="font-medium text-gray-900">{pass.Student?.User?.name || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-700 font-mono text-sm">{pass.Student?.usn || 'N/A'}</td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  pass.pass_type === 'LONG_LEAVE' 
                                    ? 'bg-orange-100 text-orange-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {pass.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily Pass'}
                                </span>
                              </td>
                              <td className="py-4 px-6">{getCoordinatorStatusBadge(pass)}</td>
                              <td className="py-4 px-6 text-gray-700 text-sm max-w-xs truncate">{pass.reason || 'N/A'}</td>
                              <td className="py-4 px-6 text-gray-700 text-sm">
                                {pass.pass_type === 'DAILY' 
                                  ? formatDate(pass.pass_date)
                                  : `${formatDate(pass.leaving_date || pass.from_date)} - ${formatDate(pass.returning_date || pass.to_date)}`
                                }
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {pass.status === 'PENDING_COORDINATOR' ? (
                                    <span className="text-xs text-gray-500 italic">Waiting for Coordinator</span>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleApprovePass(pass.id)}
                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                        title="Approve"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedPass(pass)
                                          setShowPassModal(true)
                                        }}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                        title="Reject"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedPass(pass)
                                          setShowPassModal(true)
                                        }}
                                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                        title="View Details"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {pendingPasses.length > 6 && (
                    <div className="p-4 border-t border-gray-100 text-center">
                      <button
                        onClick={() => setActiveTab('pending')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        View All Pending Requests →
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* All Passes Tab */}
              {activeTab === 'allpasses' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">All Passes</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {allPasses.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">No passes found</div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Pass ID</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Student Name</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Pass Type</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Approval Date</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Status</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">QR Code Status</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {allPasses.map((pass) => (
                            <tr key={pass.id} className="hover:bg-gray-50 transition">
                              <td className="py-4 px-6 font-mono text-sm text-gray-700">#{pass.id}</td>
                              <td className="py-4 px-6 font-medium text-gray-900">{pass.Student?.User?.name || 'N/A'}</td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  pass.pass_type === 'LONG_LEAVE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {pass.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily Pass'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-gray-700 text-sm">{formatDate(pass.updatedAt)}</td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  pass.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                  pass.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {pass.status}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                {pass.status === 'APPROVED' ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                    ✓ Generated
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">N/A</span>
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedPass(pass)
                                      setShowPassModal(true)
                                    }}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition"
                                  >
                                    View Pass
                                  </button>
                                  {pass.status === 'APPROVED' && (
                                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition">
                                      Download PDF
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Student Directory</h3>
                      <input
                        type="text"
                        placeholder="Search by name, USN, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {filteredStudents.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">No students found</div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Name</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">USN</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Department</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Hostel</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Room</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Phone</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition">
                              <td className="py-4 px-6 font-medium text-gray-900">{student.User?.name || 'N/A'}</td>
                              <td className="py-4 px-6 font-mono text-sm text-gray-700">{student.usn || 'N/A'}</td>
                              <td className="py-4 px-6 text-gray-700">{student.Department?.name || 'N/A'}</td>
                              <td className="py-4 px-6 text-gray-700">{student.hostel_name || 'N/A'}</td>
                              <td className="py-4 px-6 text-gray-700">{student.room_number || 'N/A'}</td>
                              <td className="py-4 px-6 text-gray-700">{student.User?.email || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Pending Requests Full Tab */}
              {activeTab === 'pending' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">All Pending Requests</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {pendingPasses.length === 0 ? (
                      <div className="p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">No pending requests</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Student Name</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">USN</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Pass Type</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Coordinator Status</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Reason</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Leave Dates</th>
                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase">Hostel Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {pendingPasses.map((pass) => (
                            <tr key={pass.id} className="hover:bg-gray-50 transition">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {pass.Student?.User?.name?.charAt(0) || 'S'}
                                  </div>
                                  <span className="font-medium text-gray-900">{pass.Student?.User?.name || 'N/A'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-700 font-mono text-sm">{pass.Student?.usn || 'N/A'}</td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  pass.pass_type === 'LONG_LEAVE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {pass.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily Pass'}
                                </span>
                              </td>
                              <td className="py-4 px-6">{getCoordinatorStatusBadge(pass)}</td>
                              <td className="py-4 px-6 text-gray-700 text-sm max-w-xs truncate">{pass.reason || 'N/A'}</td>
                              <td className="py-4 px-6 text-gray-700 text-sm">
                                {pass.pass_type === 'DAILY' 
                                  ? formatDate(pass.pass_date)
                                  : `${formatDate(pass.leaving_date || pass.from_date)} - ${formatDate(pass.returning_date || pass.to_date)}`
                                }
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {pass.status === 'PENDING_COORDINATOR' ? (
                                    <span className="text-xs text-gray-500 italic">Waiting for Coordinator</span>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleApprovePass(pass.id)}
                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                        title="Approve"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedPass(pass)
                                          setShowPassModal(true)
                                        }}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                        title="Reject"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedPass(pass)
                                          setShowPassModal(true)
                                        }}
                                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                        title="View Details"
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Right Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-sm">View Pending Requests</span>
                    </div>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveTab('allpasses')}
                    className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-sm">Approved Passes</span>
                    </div>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition group">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <span className="font-semibold text-sm">Gate Pass Report</span>
                    </div>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Today's Overview Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-sm border border-blue-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Entries (IN)</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{todayOverview.entriesIn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Exits (OUT)</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{todayOverview.exitsOut}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Currently Outside</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{todayOverview.currentlyOutside}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Expected Returns Today</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{todayOverview.expectedReturnsToday}</span>
                  </div>
                </div>
              </div>

              {/* Important Notice Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">Important Notice</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Ensure all passes are approved after verifying student details and leave dates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Long leave requires Coordinator approval first.</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-white/60 backdrop-blur-sm rounded-lg flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Security First</p>
                    <p className="text-xs text-gray-600">Verify all details before approval</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="px-6 py-6 text-center">
          <p className="text-sm text-gray-600">© 2025 Smart Gate Management System. All rights reserved.</p>
        </div>
      </footer>

      {/* Pass Details Modal */}
      {showPassModal && selectedPass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Pass Details</h3>
                <button
                  onClick={() => {
                    setShowPassModal(false)
                    setSelectedPass(null)
                    setRejectRemarks('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Student Information</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPass.Student?.User?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">USN:</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">{selectedPass.Student?.usn || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Department:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPass.Student?.Department?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Semester:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPass.Student?.semester || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPass.Student?.User?.email || 'N/A'}</span>
                  </div>
                  {selectedPass.parent_contact && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Parent Phone:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedPass.parent_contact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pass Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Pass Information</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pass Type:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedPass.pass_type === 'LONG_LEAVE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedPass.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily Pass'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reason:</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{selectedPass.reason || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Destination:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPass.destination || 'N/A'}</span>
                  </div>
                  {selectedPass.pass_type === 'DAILY' ? (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pass Date:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedPass.pass_date)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Leaving Date:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedPass.leaving_date || selectedPass.from_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Returning Date:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedPass.returning_date || selectedPass.to_date)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Coordinator Status */}
              {selectedPass.pass_type === 'LONG_LEAVE' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">Coordinator Status</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    {getCoordinatorStatusBadge(selectedPass)}
                  </div>
                </div>
              )}

              {/* Rejection Remarks Input */}
              {selectedPass.status !== 'PENDING_COORDINATOR' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase mb-2">
                    Rejection Remarks (Required for rejection)
                  </label>
                  <textarea
                    value={rejectRemarks}
                    onChange={(e) => setRejectRemarks(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedPass.status !== 'PENDING_COORDINATOR' && (
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => handleApprovePass(selectedPass.id)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Approve Pass
                </button>
                <button
                  onClick={() => handleRejectPass(selectedPass.id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                >
                  Reject Pass
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
            </div>

            {/* Modal Body */}
            <p className="text-gray-700 mb-6">
              Are you sure you want to logout from Smart Gate Pass Management System?
            </p>

            {/* Modal Footer */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
