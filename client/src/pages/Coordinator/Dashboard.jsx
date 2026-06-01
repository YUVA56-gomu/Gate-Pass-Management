import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as approvalAPI from '../../api/approval.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { StatsCard } from '../../components/ui/StatsCard'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PageHeader } from '../../components/ui/PageHeader'

const TABLE_COLUMNS = [
  {
    key: 'student',
    label: 'Student',
    render: (_, row) => (
      <div>
        <p className="font-medium text-slate-800">{row.Pass?.Student?.User?.name || '—'}</p>
        <p className="text-xs text-slate-400">{row.Pass?.Student?.usn || ''}</p>
      </div>
    )
  },
  {
    key: 'pass_type',
    label: 'Type',
    render: (_, row) => (
      <span className={`badge ${row.Pass?.type === 'LONG_LEAVE' ? 'badge-purple' : 'badge-info'}`}>
        {row.Pass?.type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
      </span>
    )
  },
  {
    key: 'status',
    label: 'Decision',
    render: (val) => <StatusBadge status={val} />
  },
  {
    key: 'approved_at',
    label: 'Date',
    render: (val) => val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  }
]

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ pending: 0, approvedToday: 0, rejectedToday: 0, totalProcessed: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true); setError('')
      let pending = [], history = []
      try { const r = await approvalAPI.getPendingRequests(); pending = Array.isArray(r?.data) ? r.data : [] } catch { /* silent */ }
      try { const r = await approvalAPI.getApprovalHistory(); history = Array.isArray(r?.data) ? r.data : [] } catch { /* silent */ }

      const today = new Date(); today.setHours(0,0,0,0)
      const isToday = (d) => { try { const dt = new Date(d); dt.setHours(0,0,0,0); return dt.getTime() === today.getTime() } catch { return false } }

      setStats({
        pending: pending.length,
        approvedToday: history.filter(h => h.status === 'APPROVED' && isToday(h.approved_at)).length,
        rejectedToday: history.filter(h => h.status === 'REJECTED' && isToday(h.approved_at)).length,
        totalProcessed: history.length
      })
      setRecentActivity(history.slice(0, 5))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally { setLoading(false) }
  }

  return (
    <DashboardShell>
      {/* Welcome */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-5 text-white shadow-lg animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">Welcome back 👋</p>
            <h2 className="text-xl font-bold mt-0.5">{user?.name}</h2>
            <p className="text-blue-200 text-sm mt-1">Coordinator Dashboard</p>
          </div>
          <button onClick={() => navigate('/coordinator/requests')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold transition-all border border-white/20">
            Review Requests
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Pending Requests" value={stats.pending}       color="amber"   loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatsCard label="Approved Today"   value={stats.approvedToday} color="emerald" loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        />
        <StatsCard label="Rejected Today"   value={stats.rejectedToday} color="red"     loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
        />
        <StatsCard label="Total Processed"  value={stats.totalProcessed} color="indigo" loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Review Pending Requests', desc: 'Approve or reject long leave requests', path: '/coordinator/requests', color: 'from-blue-500 to-cyan-600' },
          { label: 'View History', desc: 'Check all approvals you have processed', path: '/coordinator/history', color: 'from-indigo-500 to-violet-600' },
        ].map(a => (
          <button key={a.path} onClick={() => navigate(a.path)}
            className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{a.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <DataTable
        title="Recent Decisions"
        columns={TABLE_COLUMNS}
        data={recentActivity}
        loading={loading}
        empty="No recent activity"
        actions={
          <button onClick={() => navigate('/coordinator/history')}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            View all →
          </button>
        }
      />
    </DashboardShell>
  )
}

export default Dashboard
