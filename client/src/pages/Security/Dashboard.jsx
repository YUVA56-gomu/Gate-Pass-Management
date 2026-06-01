import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardStats } from '../../api/security.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { StatsCard } from '../../components/ui/StatsCard'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'

function fmtDT(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const COLUMNS = [
  { key: 'studentName', label: 'Student', render: (val, row) => (
    <div>
      <p className="font-medium text-slate-800">{val || '—'}</p>
      <p className="text-xs text-slate-400 font-mono">{row.studentUSN || ''}</p>
    </div>
  )},
  { key: 'passType', label: 'Pass Type', render: (val) => (
    <span className={`badge ${val === 'DAILY' ? 'badge-info' : 'badge-purple'}`}>{val}</span>
  )},
  { key: 'action', label: 'Action', render: (val) => (
    <span className={`badge ${val === 'OUT' ? 'badge-warning' : 'badge-success'}`}>{val}</span>
  )},
  { key: 'scannedAt', label: 'Timestamp', render: (val) => <span className="text-sm text-slate-500">{fmtDT(val)}</span> },
  { key: 'scannedBy', label: 'Scanned By', render: (val) => <span className="text-sm text-slate-600">{val || '—'}</span> },
]

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setError(null)
      const res = await getDashboardStats()
      if (res.success) setStats(res.data)
      else setError(res.message || 'Failed to load dashboard')
    } catch (err) { setError(err.message || 'Failed to load dashboard') }
    finally { setLoading(false) }
  }

  return (
    <DashboardShell>
      {/* Security Terminal Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-5 text-white shadow-lg animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-orange-200 text-xs font-medium uppercase tracking-wide">Security Terminal Active</span>
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-orange-200 text-sm mt-0.5">Gate Entry/Exit Monitoring</p>
          </div>
          <button onClick={() => navigate('/security/scanner')}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold transition-all border border-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Open Scanner
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard label="Today's Scans"     value={stats?.todayScans || 0}       color="blue"    loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
        />
        <StatsCard label="Students Outside"  value={stats?.studentsOutside || 0}  color="orange"  loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatsCard label="Completed Passes"  value={stats?.completedPasses || 0} color="emerald" loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button onClick={() => navigate('/security/scanner')}
          className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">QR Scanner</p>
            <p className="text-xs text-slate-500 mt-0.5">Scan student gate passes</p>
          </div>
          <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button onClick={() => navigate('/security/logs')}
          className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Scan Logs</p>
            <p className="text-xs text-slate-500 mt-0.5">View all gate entry/exit logs</p>
          </div>
          <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Recent Activity */}
      <DataTable
        title="Recent Scan Activity"
        columns={COLUMNS}
        data={stats?.recentActivity || []}
        loading={loading}
        empty="No recent scan activity"
        actions={
          <button onClick={() => navigate('/security/logs')}
            className="text-xs font-medium text-orange-600 hover:text-orange-800 transition-colors">
            View all logs →
          </button>
        }
      />
    </DashboardShell>
  )
}

export default Dashboard
