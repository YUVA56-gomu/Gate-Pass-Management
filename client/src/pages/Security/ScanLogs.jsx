import { useState, useEffect } from 'react'
import { getAllLogs } from '../../api/security.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatsCard } from '../../components/ui/StatsCard'

function fmtDT(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const FILTERS = ['ALL', 'OUT', 'IN', 'TODAY']

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
  { key: 'scannedBy', label: 'Security Staff', render: (val) => <span className="text-sm text-slate-600">{val || '—'}</span> },
]

export function ScanLogs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try { setLoading(true); setError(null); const r = await getAllLogs(filter); if (r.success) setLogs(r.data); else setError(r.message) }
      catch (err) { setError(err.message || 'Failed to load logs') }
      finally { setLoading(false) }
    }
    fetch()
  }, [filter])

  const outCount = logs.filter(l => l.action === 'OUT').length
  const inCount  = logs.filter(l => l.action === 'IN').length

  return (
    <DashboardShell>
      <PageHeader title="Scan Logs" subtitle="All gate entry and exit records" />

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Summary */}
      {!loading && logs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard label="Total Logs" value={logs.length} color="blue"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
          />
          <StatsCard label="OUT Scans" value={outCount} color="orange"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>}
          />
          <StatsCard label="IN Scans" value={inCount} color="emerald"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>}
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
        columns={COLUMNS}
        data={logs}
        loading={loading}
        empty="No scan logs found"
      />
    </DashboardShell>
  )
}

export default ScanLogs
