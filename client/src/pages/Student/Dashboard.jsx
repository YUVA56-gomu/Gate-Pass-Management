import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import * as passAPI from '../../api/pass.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { StatsCard } from '../../components/ui/StatsCard'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PageHeader } from '../../components/ui/PageHeader'

const QUICK_ACTIONS = [
  {
    label: 'Apply for Pass',
    desc: 'Request a daily pass or long leave',
    path: '/student/apply-pass',
    color: 'from-indigo-500 to-violet-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    )
  },
  {
    label: 'My Passes',
    desc: 'View all your pass applications',
    path: '/student/my-passes',
    color: 'from-blue-500 to-cyan-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    label: 'Notifications',
    desc: 'Check approval status and updates',
    path: '/student/notifications',
    color: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  },
  {
    label: 'My Profile',
    desc: 'Complete or update your profile',
    path: '/student/profile',
    color: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }
]

const INSTRUCTIONS = [
  'Daily Pass is valid only between 9:00 AM to 6:00 PM',
  'You must return on the same day for daily passes',
  'Long Leave requires Coordinator and Hostel Staff approval',
  'Carry your physical ID card while going out',
  'Scan QR code at gate entry and exit',
]

const TABLE_COLUMNS = [
  {
    key: 'pass_type',
    label: 'Type',
    render: (val) => (
      <span className={`badge ${val === 'DAILY' ? 'badge-info' : 'badge-purple'}`}>
        {val === 'DAILY' ? 'Daily Pass' : 'Long Leave'}
      </span>
    )
  },
  {
    key: 'destination',
    label: 'Destination',
    render: (val) => <span className="font-medium text-slate-700">{val || '—'}</span>
  },
  {
    key: 'createdAt',
    label: 'Applied',
    render: (val) => val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  },
  {
    key: 'status',
    label: 'Status',
    render: (val) => <StatusBadge status={val} />
  }
]

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        setLoading(true)
        const res = await passAPI.getMyPasses()
        setPasses(res.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load passes')
      } finally {
        setLoading(false)
      }
    }
    fetchPasses()
  }, [])

  const total    = passes.length
  const approved = passes.filter(p => p.status === 'APPROVED').length
  const pending  = passes.filter(p => p.status?.includes('PENDING')).length
  const rejected = passes.filter(p => p.status === 'REJECTED').length
  const recent   = passes.slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <DashboardShell>
      {/* Welcome Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white shadow-lg animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{greeting} 👋</p>
            <h2 className="text-xl font-bold mt-0.5">{user?.name}</h2>
            <p className="text-indigo-200 text-sm mt-1">Here's your gate pass overview</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/student/apply-pass')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold transition-all border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Apply Pass
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Passes"    value={total}    color="indigo"  loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatsCard label="Approved"        value={approved} color="emerald" loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        />
        <StatsCard label="Pending"         value={pending}  color="amber"   loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatsCard label="Rejected"        value={rejected} color="red"     loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{action.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-slate-300 ml-auto flex-shrink-0 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Important Rules</h3>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <ul className="space-y-3">
              {INSTRUCTIONS.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-slate-600 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <DataTable
        title="Recent Applications"
        columns={TABLE_COLUMNS}
        data={recent}
        loading={loading}
        empty="No passes yet. Start by applying for a pass."
        actions={
          <button
            onClick={() => navigate('/student/my-passes')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all →
          </button>
        }
      />
    </DashboardShell>
  )
}

export default Dashboard
