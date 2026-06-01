import { useState, useEffect, useCallback } from 'react'
import { getAllLogs } from '../../api/security.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatsCard } from '../../components/ui/StatsCard'

function fmtDT(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const FILTERS = [
  { val: 'ALL',       label: 'All'        },
  { val: 'TODAY',     label: 'Today'      },
  { val: 'YESTERDAY', label: 'Yesterday'  },
  { val: 'THIS_WEEK', label: 'This Week'  },
  { val: 'OUT',       label: 'OUT Scans'  },
  { val: 'IN',        label: 'IN Scans'   },
]

export function ScanLogs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('TODAY')
  const [search, setSearch] = useState('')
  const [passTypeFilter, setPassTypeFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const downloadCSV = () => {
    if (filtered.length === 0) return
    const headers = ['Student', 'USN', 'Department', 'Pass Type', 'Action', 'Timestamp', 'Guard', 'Status']
    const rows = filtered.map(log => [
      log.studentName || '',
      log.studentUSN  || '',
      log.department  || '',
      log.passType === 'LONG_LEAVE' ? 'Long Leave' : log.passType === 'DAILY' ? 'Daily' : (log.passType || ''),
      log.action      || '',
      fmtDT(log.scannedAt),
      log.scannedBy   || '',
      log.scanStatus  || 'VALID'
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `scan-logs-${filter.toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await getAllLogs(filter, search)
      if (res.success) setLogs(res.data || [])
      else setError(res.message || 'Failed to load logs')
    } catch (err) { setError(err.message || 'Failed to load logs') }
    finally { setLoading(false) }
  }, [filter, search])

  useEffect(() => {
    const t = setTimeout(fetchLogs, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchLogs])

  // Apply pass type filter client-side
  const filtered = passTypeFilter === 'ALL'
    ? logs
    : logs.filter(l => l.passType === passTypeFilter)

  const outCount = filtered.filter(l => l.action === 'OUT').length
  const inCount  = filtered.filter(l => l.action === 'IN').length

  return (
    <DashboardShell>
      <PageHeader
        title="Scan Logs"
        subtitle="All gate entry and exit records"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={downloadCSV} disabled={filtered.length === 0}
              className="btn-secondary text-sm py-2 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </button>
            <button onClick={fetchLogs}
              className="btn-secondary text-sm py-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        }
      />

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Summary Stats */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard label="Total Logs" value={filtered.length} color="blue"
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

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Time filter */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200/80 p-1 flex-wrap shadow-sm">
          {FILTERS.map(f => (
            <button key={f.val} onClick={() => setFilter(f.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.val ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Pass type filter */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200/80 p-1 shadow-sm">
          {[['ALL', 'All Types'], ['DAILY', 'Daily'], ['LONG_LEAVE', 'Long Leave']].map(([val, label]) => (
            <button key={val} onClick={() => setPassTypeFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                passTypeFilter === val ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search name, USN, dept..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="spinner mx-auto mb-3" /><p className="text-sm text-slate-400">Loading logs...</p></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <p className="font-medium text-slate-600">No scan logs found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Pass Type</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>Guard</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800">{log.studentName || '—'}</p>
                        <p className="text-xs text-slate-400 font-mono">{log.studentUSN || ''}</p>
                      </div>
                    </td>
                    <td><span className="text-sm text-slate-600">{log.department || '—'}</span></td>
                    <td>
                      <span className={`badge ${log.passType === 'LONG_LEAVE' ? 'badge-purple' : 'badge-info'}`}>
                        {log.passType === 'LONG_LEAVE' ? 'Long Leave' : log.passType === 'DAILY' ? 'Daily' : log.passType || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${log.action === 'OUT' ? 'badge-warning' : 'badge-success'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td><span className="text-sm text-slate-500">{fmtDT(log.scannedAt)}</span></td>
                    <td><span className="text-sm text-slate-600">{log.scannedBy || '—'}</span></td>
                    <td>
                      <span className={`badge ${log.scanStatus === 'VALID' ? 'badge-success' : log.scanStatus === 'INVALID' ? 'badge-error' : 'badge-warning'}`}>
                        {log.scanStatus || 'VALID'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

export default ScanLogs
