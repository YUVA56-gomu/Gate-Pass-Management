import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardStats, getStudentsOutside } from '../../api/security.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { StatsCard } from '../../components/ui/StatsCard'
import { DataTable } from '../../components/ui/DataTable'
import { PageHeader } from '../../components/ui/PageHeader'

const TABS = [
  { id: 'overview',  label: 'Overview'          },
  { id: 'outside',   label: 'Students Outside', badge: true },
  { id: 'activity',  label: 'Recent Activity'   },
]

function fmtDT(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Status pill for outside students
function OutsideStatus({ status }) {
  const map = {
    OUTSIDE:        { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Outside' },
    RETURNING_TODAY:{ cls: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-500',   label: 'Returning Today' },
    OVERDUE:        { cls: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500',     label: 'Overdue' },
  }
  const cfg = map[status] || map.OUTSIDE
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

const OUTSIDE_COLUMNS = [
  {
    key: 'student',
    label: 'Student',
    render: (_, row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {row.studentName?.charAt(0) || 'S'}
        </div>
        <div>
          <p className="font-medium text-slate-800 text-sm">{row.studentName || '—'}</p>
          <p className="text-xs text-slate-400 font-mono">{row.studentUSN || ''}</p>
        </div>
      </div>
    )
  },
  {
    key: 'department',
    label: 'Dept',
    render: (_, row) => <span className="text-sm text-slate-600">{row.department || '—'}</span>
  },
  {
    key: 'pass_type',
    label: 'Type',
    render: (_, row) => (
      <span className={`badge ${row.pass_type === 'LONG_LEAVE' ? 'badge-purple' : 'badge-info'}`}>
        {row.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
      </span>
    )
  },
  {
    key: 'destination',
    label: 'Destination',
    render: (_, row) => <span className="text-sm text-slate-600">{row.destination || '—'}</span>
  },
  {
    key: 'exitTime',
    label: 'Exit Time',
    render: (_, row) => <span className="text-sm text-slate-500">{fmtDT(row.exitTime)}</span>
  },
  {
    key: 'returnDate',
    label: 'Expected Return',
    render: (_, row) => <span className="text-sm text-slate-600">{fmt(row.returnDate)}</span>
  },
  {
    key: 'daysRemaining',
    label: 'Days',
    render: (_, row) => {
      if (row.daysRemaining === null) return <span className="text-slate-400">—</span>
      if (row.daysRemaining < 0) return <span className="text-red-600 font-bold text-sm">{Math.abs(row.daysRemaining)}d overdue</span>
      if (row.daysRemaining === 0) return <span className="text-amber-600 font-bold text-sm">Today</span>
      return <span className="text-slate-600 text-sm">{row.daysRemaining}d left</span>
    }
  },
  {
    key: 'currentStatus',
    label: 'Status',
    render: (_, row) => <OutsideStatus status={row.currentStatus} />
  },
  {
    key: 'hostelStaff',
    label: 'Hostel Staff',
    render: (_, row) => <span className="text-sm text-slate-500">{row.hostelStaff || '—'}</span>
  },
]

const ACTIVITY_COLUMNS = [
  {
    key: 'studentName',
    label: 'Student',
    render: (val, row) => (
      <div>
        <p className="font-medium text-slate-800">{val || '—'}</p>
        <p className="text-xs text-slate-400 font-mono">{row.studentUSN || ''}</p>
      </div>
    )
  },
  {
    key: 'passType',
    label: 'Type',
    render: (val) => (
      <span className={`badge ${val === 'LONG_LEAVE' ? 'badge-purple' : 'badge-info'}`}>
        {val === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
      </span>
    )
  },
  {
    key: 'action',
    label: 'Action',
    render: (val) => (
      <span className={`badge ${val === 'OUT' ? 'badge-warning' : 'badge-success'}`}>{val}</span>
    )
  },
  {
    key: 'scannedAt',
    label: 'Time',
    render: (val) => <span className="text-sm text-slate-500">{fmtDT(val)}</span>
  },
  {
    key: 'scannedBy',
    label: 'Guard',
    render: (val) => <span className="text-sm text-slate-600">{val || '—'}</span>
  },
]

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [outsideStudents, setOutsideStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [outsideLoading, setOutsideLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [outsideFilter, setOutsideFilter] = useState('ALL')
  const [outsideSearch, setOutsideSearch] = useState('')

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeTab === 'outside') fetchOutside()
  }, [activeTab])

  const fetchStats = async () => {
    try {
      setError(null)
      const res = await getDashboardStats()
      if (res.success) setStats(res.data)
      else setError(res.message || 'Failed to load dashboard')
    } catch (err) { setError(err.message || 'Failed to load dashboard') }
    finally { setLoading(false) }
  }

  const fetchOutside = async () => {
    try {
      setOutsideLoading(true)
      const res = await getStudentsOutside()
      if (res.success) setOutsideStudents(res.data || [])
    } catch { /* silent */ }
    finally { setOutsideLoading(false) }
  }

  // Filter outside students
  const filteredOutside = outsideStudents.filter(s => {
    const matchFilter =
      outsideFilter === 'ALL'            ? true :
      outsideFilter === 'DAILY'          ? s.pass_type === 'DAILY' :
      outsideFilter === 'LONG_LEAVE'     ? s.pass_type === 'LONG_LEAVE' :
      outsideFilter === 'OVERDUE'        ? s.currentStatus === 'OVERDUE' :
      outsideFilter === 'RETURNING_TODAY'? s.currentStatus === 'RETURNING_TODAY' :
      true

    const q = outsideSearch.toLowerCase()
    const matchSearch = !q ||
      s.studentName?.toLowerCase().includes(q) ||
      s.studentUSN?.toLowerCase().includes(q)  ||
      s.department?.toLowerCase().includes(q)

    return matchFilter && matchSearch
  })

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

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatsCard label="Today's Scans"     value={stats?.todayScans || 0}         color="blue"    loading={loading}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>}
        />
        <StatsCard label="Outside Now"       value={stats?.studentsOutside || 0}    color="orange"  loading={loading}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatsCard label="Completed Today"   value={stats?.completedPasses || 0}   color="emerald" loading={loading}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatsCard label="Overdue"           value={stats?.overdueStudents || 0}   color="red"     loading={loading}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <StatsCard label="Returning Today"   value={stats?.returningToday || 0}    color="amber"   loading={loading}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatsCard label="Long Leave Out"    value={stats?.longLeaveOutside || 0}  color="violet"  loading={loading}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatsCard label="Daily Pass Out"    value={stats?.dailyPassOutside || 0}  color="cyan"    loading={loading}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-sm">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}>
            {tab.label}
            {tab.badge && (stats?.studentsOutside || 0) > 0 && (
              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                activeTab === tab.id ? 'bg-white text-slate-900' : 'bg-orange-500 text-white'
              }`}>
                {(stats?.studentsOutside || 0) > 9 ? '9+' : stats?.studentsOutside}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/security/scanner')}
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800">QR Scanner</p>
              <p className="text-sm text-slate-500 mt-0.5">Scan student gate passes for entry/exit</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button onClick={() => navigate('/security/logs')}
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800">Scan Logs</p>
              <p className="text-sm text-slate-500 mt-0.5">View all gate entry and exit records</p>
            </div>
            <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Students Outside Tab ── */}
      {activeTab === 'outside' && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex gap-1 bg-white rounded-xl border border-slate-200/80 p-1 flex-wrap shadow-sm">
              {[
                ['ALL', 'All'],
                ['DAILY', 'Daily'],
                ['LONG_LEAVE', 'Long Leave'],
                ['OVERDUE', 'Overdue'],
                ['RETURNING_TODAY', 'Returning Today'],
              ].map(([val, label]) => (
                <button key={val} onClick={() => setOutsideFilter(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    outsideFilter === val ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Search name, USN, department..."
              value={outsideSearch} onChange={e => setOutsideSearch(e.target.value)}
              className="input-field text-sm max-w-xs" />
          </div>

          <DataTable
            title={`Students Currently Outside (${filteredOutside.length})`}
            columns={OUTSIDE_COLUMNS}
            data={filteredOutside}
            loading={outsideLoading}
            empty="No students currently outside campus"
          />
        </div>
      )}

      {/* ── Recent Activity Tab ── */}
      {activeTab === 'activity' && (
        <DataTable
          title="Recent Scan Activity"
          columns={ACTIVITY_COLUMNS}
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
      )}
    </DashboardShell>
  )
}

export default Dashboard
