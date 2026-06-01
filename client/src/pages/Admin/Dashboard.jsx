import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import { getDashboardStats, getAllUsers } from '../../api/admin.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { StatsCard } from '../../components/ui/StatsCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PageHeader } from '../../components/ui/PageHeader'

const ROLE_BADGE = {
  STUDENT:     'badge-info',
  COORDINATOR: 'badge-brand',
  HOSTEL_STAFF:'badge-success',
  SECURITY:    'badge-warning',
  ADMIN:       'badge-purple',
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, usersData] = await Promise.all([getDashboardStats(), getAllUsers('ALL')])
        if (statsData.success) setStats(statsData.data)
        if (usersData.success) { setUsers(usersData.data || []); setFilteredUsers(usersData.data || []) }
      } catch (err) {
        showNotification && showNotification('Failed to load dashboard data', 'error')
      } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = users
    if (roleFilter !== 'ALL') filtered = filtered.filter(u => u.role === roleFilter)
    if (searchTerm) filtered = filtered.filter(u =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, roleFilter, users])

  return (
    <DashboardShell>
      {/* Welcome Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 p-5 text-white shadow-lg animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-violet-200 text-sm font-medium">Admin Console 👋</p>
            <h2 className="text-xl font-bold mt-0.5">{user?.name}</h2>
            <p className="text-violet-200 text-sm mt-1">System overview and management</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => navigate('/admin/users')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold transition-all border border-white/20">
              Manage Users
            </button>
            <button onClick={() => navigate('/admin/reports')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold transition-all border border-white/10">
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Students"   value={stats?.users?.totalStudents || 0}    color="indigo"  loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>}
        />
        <StatsCard label="Coordinators"     value={stats?.users?.totalCoordinators || 0} color="blue"   loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        />
        <StatsCard label="Hostel Staff"     value={stats?.users?.totalHostelStaff || 0} color="emerald" loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
        />
        <StatsCard label="Security Guards"  value={stats?.totalSecurityGuards || 0}     color="orange"  loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
        />
      </div>

      {/* Pass Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Passes"     value={stats?.passes?.totalPasses || 0}    color="indigo"  loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatsCard label="Approved"         value={stats?.passes?.approvedPasses || 0} color="emerald" loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        />
        <StatsCard label="Rejected"         value={stats?.passes?.rejectedPasses || 0} color="red"     loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
        />
        <StatsCard label="Pending Passes"   value={stats?.pendingPasses || 0}          color="amber"   loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Users Table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="font-semibold text-slate-800 text-sm flex-1">Users</h3>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Search name or email..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="input-field text-sm py-1.5 w-48" />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="input-field text-sm py-1.5 w-36">
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="COORDINATOR">Coordinators</option>
                <option value="HOSTEL_STAFF">Hostel Staff</option>
                <option value="SECURITY">Security</option>
                <option value="ADMIN">Admins</option>
              </select>
              <button onClick={() => navigate('/admin/users')}
                className="text-xs font-medium text-violet-600 hover:text-violet-800 whitespace-nowrap">
                View all →
              </button>
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center"><div className="spinner mx-auto" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.slice(0, 10).map(u => (
                    <tr key={u.id || u._id}>
                      <td><span className="font-medium text-slate-800">{u.name}</span></td>
                      <td><span className="text-slate-500">{u.email}</span></td>
                      <td>
                        <span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>
                          {u.role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-gray'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-slate-400 text-sm">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: '+ Add User', path: '/admin/users', cls: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200' },
                { label: 'Generate Report', path: '/admin/reports', cls: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
                { label: 'System Settings', path: '/admin/settings', cls: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  className={`w-full px-3 py-2 rounded-xl text-sm font-semibold transition-colors border ${a.cls}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">System Status</h3>
            <div className="space-y-2.5">
              {[
                ['Active Users', stats?.activeUsers || 0],
                ['Pending Passes', stats?.pendingPasses || 0],
                ["Today's Passes", stats?.todaysPasses || 0],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{l}</span>
                  <span className="font-bold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <p className="text-xs font-semibold text-amber-800 mb-1">Important</p>
            <p className="text-xs text-amber-700">Review pending user approvals regularly to maintain system security.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

export default AdminDashboard
