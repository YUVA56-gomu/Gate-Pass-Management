import { useState, useEffect } from 'react'
import * as hostelAPI from '../../api/hostel.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { StatsCard } from '../../components/ui/StatsCard'

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const FILTERS = ['ALL', 'DAILY', 'LONG_LEAVE', 'APPROVED', 'REJECTED', 'PENDING_HOSTEL']

export function AllPasses() {
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true); setError('')
        const res = await hostelAPI.getAllPasses(filter)
        setPasses(res.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load passes')
      } finally { setLoading(false) }
    }
    fetch()
  }, [filter])

  const approved = passes.filter(p => p.status === 'APPROVED').length
  const rejected = passes.filter(p => p.status === 'REJECTED').length

  const FILTER_LABELS = {
    ALL: 'All', DAILY: 'Daily', LONG_LEAVE: 'Long Leave',
    APPROVED: 'Approved', REJECTED: 'Rejected', PENDING_HOSTEL: 'Pending'
  }

  return (
    <DashboardShell>
      <PageHeader title="All Passes" subtitle="View all gate passes with filtering options" />

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Summary */}
      {!loading && passes.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard label="Total Passes" value={passes.length} color="indigo"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatsCard label="Approved" value={approved} color="emerald"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          />
          <StatsCard label="Rejected" value={rejected} color="red"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-slate-200/80 p-1 flex-wrap shadow-sm">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}>
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="spinner mx-auto mb-3" /><p className="text-sm text-slate-400">Loading passes...</p></div>
        ) : passes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-slate-600">No passes found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Pass ID</th><th>Student</th><th>Type</th><th>Status</th><th>Applied</th></tr>
              </thead>
              <tbody>
                {passes.map(pass => (
                  <tr key={pass.id}>
                    <td><span className="font-mono text-xs text-slate-500">#{pass.id}</span></td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800">{pass.Student?.User?.name || '—'}</p>
                        <p className="text-xs text-slate-400 font-mono">{pass.Student?.usn || ''}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${(pass.pass_type || pass.type) === 'LONG_LEAVE' ? 'badge-purple' : 'badge-info'}`}>
                        {(pass.pass_type || pass.type) === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
                      </span>
                    </td>
                    <td><StatusBadge status={pass.status} /></td>
                    <td><span className="text-sm text-slate-500">{fmt(pass.createdAt)}</span></td>
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

export default AllPasses
