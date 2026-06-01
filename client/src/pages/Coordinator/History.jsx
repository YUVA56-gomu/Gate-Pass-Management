import { useState, useEffect } from 'react'
import * as approvalAPI from '../../api/approval.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { StatsCard } from '../../components/ui/StatsCard'

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const FILTERS = ['ALL', 'APPROVED', 'REJECTED']

export function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    const fetch = async () => {
      try { setLoading(true); setError(''); const r = await approvalAPI.getApprovalHistory(); setHistory(r.data || []) }
      catch (err) { setError(err.response?.data?.message || 'Failed to load history') }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const filtered = history.filter(h => filter === 'ALL' || h.status === filter)
  const approved = history.filter(h => h.status === 'APPROVED').length
  const rejected = history.filter(h => h.status === 'REJECTED').length

  const columns = [
    {
      key: 'pass_id',
      label: 'Pass ID',
      render: (_, row) => <span className="font-mono text-xs text-slate-500">#{row.Pass?.id}</span>
    },
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
      key: 'dept',
      label: 'Department',
      render: (_, row) => <span className="text-sm text-slate-600">{row.Pass?.Student?.Department?.name || '—'}</span>
    },
    {
      key: 'status',
      label: 'Decision',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (_, row) => (
        <span className="text-sm text-slate-500 line-clamp-1 max-w-xs">{row.remarks || '—'}</span>
      )
    },
    {
      key: 'approved_at',
      label: 'Date',
      render: (val) => <span className="text-sm text-slate-500">{fmt(val)}</span>
    }
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="Approval History"
        subtitle="All long leave requests you have approved or rejected"
      />

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Summary Stats */}
      {!loading && history.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard label="Total Processed" value={history.length} color="indigo"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatsCard label="Approved" value={approved} color="emerald"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          />
          <StatsCard label="Rejected" value={rejected} color="red"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-sm">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        empty={filter === 'ALL' ? 'No approvals yet' : `No ${filter.toLowerCase()} requests found`}
      />
    </DashboardShell>
  )
}

export default History
