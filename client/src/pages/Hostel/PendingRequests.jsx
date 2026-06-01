import { useState, useEffect } from 'react'
import * as hostelAPI from '../../api/hostel.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/StatusBadge'

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CoordBadge({ pass }) {
  if (pass.pass_type === 'DAILY' || pass.type === 'DAILY') return <span className="text-xs text-slate-400">N/A</span>
  if (pass.status === 'PENDING_COORDINATOR') return <span className="badge badge-warning">Pending</span>
  return <span className="badge badge-success">Approved</span>
}

export function PendingRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [modalType, setModalType] = useState(null) // 'approve' | 'reject'
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => { fetchPasses() }, [])
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t) }
  }, [success])

  const fetchPasses = async () => {
    try {
      setLoading(true); setError('')
      const res = await hostelAPI.getPendingPasses()
      if (res?.success) setRequests(res.data || [])
      else setError(res?.message || 'Failed to load pending passes')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending passes')
    } finally { setLoading(false) }
  }

  const openModal = (req, type) => {
    setSelected(req); setModalType(type); setRemarks(''); setModalError('')
  }
  const closeModal = () => { setSelected(null); setModalType(null); setRemarks(''); setModalError('') }

  const handleApprove = async () => {
    setModalError(''); setSubmitting(true)
    try {
      const res = await hostelAPI.approvePass(selected.id, remarks)
      if (!res?.success) { setModalError(res?.message || 'Failed to approve'); return }
      closeModal(); setSuccess('Pass approved successfully'); fetchPasses()
    } catch (err) { setModalError(err.response?.data?.message || 'Failed to approve') }
    finally { setSubmitting(false) }
  }

  const handleReject = async () => {
    if (!remarks?.trim()) { setModalError('Remarks are required for rejection'); return }
    setModalError(''); setSubmitting(true)
    try {
      const res = await hostelAPI.rejectPass(selected.id, remarks)
      if (!res?.success) { setModalError(res?.message || 'Failed to reject'); return }
      closeModal(); setSuccess('Pass rejected'); fetchPasses()
    } catch (err) { setModalError(err.response?.data?.message || 'Failed to reject') }
    finally { setSubmitting(false) }
  }

  const passType = (p) => p.pass_type || p.type
  const fromDate = (p) => p.pass_date || p.leaving_date || p.from_date
  const toDate   = (p) => p.returning_date || p.to_date

  return (
    <DashboardShell>
      <PageHeader
        title="Pending Pass Requests"
        subtitle="Review and approve or reject student gate pass requests"
      />

      {error   && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{success}</div>}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="spinner mx-auto mb-3" /><p className="text-sm text-slate-400">Loading...</p></div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-slate-600">No pending requests</p>
            <p className="text-sm text-slate-400 mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th><th>Type</th><th>Coordinator</th>
                  <th>Reason</th><th>Dates</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {req.Student?.User?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{req.Student?.User?.name || '—'}</p>
                          <p className="text-xs text-slate-400 font-mono">{req.Student?.usn || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${passType(req) === 'LONG_LEAVE' ? 'badge-purple' : 'badge-info'}`}>
                        {passType(req) === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
                      </span>
                    </td>
                    <td><CoordBadge pass={req} /></td>
                    <td><span className="text-sm text-slate-600 line-clamp-1 max-w-xs">{req.reason || '—'}</span></td>
                    <td>
                      <span className="text-sm text-slate-600">
                        {passType(req) === 'DAILY' ? fmt(fromDate(req)) : `${fmt(fromDate(req))} → ${fmt(toDate(req))}`}
                      </span>
                    </td>
                    <td>
                      {req.status === 'PENDING_COORDINATOR' ? (
                        <span className="text-xs text-slate-400 italic">Awaiting Coordinator</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openModal(req, 'approve')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200">
                            Approve
                          </button>
                          <button onClick={() => openModal(req, 'reject')}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors border border-red-200">
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal isOpen={modalType === 'approve'} onClose={closeModal} title="Approve Pass" size="sm"
        footer={
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={handleApprove} disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {submitting ? 'Approving...' : 'Approve Pass'}
            </button>
          </div>
        }>
        {selected && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Student:</span><span className="font-medium">{selected.Student?.User?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">USN:</span><span className="font-medium font-mono">{selected.Student?.usn}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Type:</span><span className="font-medium">{passType(selected) === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}</span></div>
            </div>
            {modalError && <p className="text-xs text-red-600">{modalError}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                placeholder="Add any remarks..." className="input-field resize-none" />
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={modalType === 'reject'} onClose={closeModal} title="Reject Pass" size="sm"
        footer={
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={handleReject} disabled={submitting || !remarks?.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {submitting ? 'Rejecting...' : 'Reject Pass'}
            </button>
          </div>
        }>
        {selected && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Student:</span><span className="font-medium">{selected.Student?.User?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">USN:</span><span className="font-medium font-mono">{selected.Student?.usn}</span></div>
            </div>
            {modalError && <p className="text-xs text-red-600">{modalError}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks <span className="text-red-500">*</span></label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                placeholder="Provide reason for rejection..."
                className={`input-field resize-none ${!remarks?.trim() && modalError ? 'border-red-400' : ''}`} />
              <p className="text-xs text-slate-400 mt-1">Required for rejection</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  )
}

export default PendingRequests
