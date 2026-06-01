import { useState, useEffect } from 'react'
import * as approvalAPI from '../../api/approval.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function PendingRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [modalType, setModalType] = useState(null) // 'approve' | 'reject'
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchRequests() }, [])
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t) }
  }, [success])

  const fetchRequests = async () => {
    try { setLoading(true); setError(''); const r = await approvalAPI.getPendingRequests(); setRequests(r.data || []) }
    catch (err) { setError(err.response?.data?.message || 'Failed to load requests') }
    finally { setLoading(false) }
  }

  const openModal = (req, type) => { setSelected(req); setModalType(type); setRemarks(''); setModalError('') }
  const closeModal = () => { setSelected(null); setModalType(null); setRemarks(''); setModalError('') }

  const handleApprove = async () => {
    setModalError(''); setSubmitting(true)
    try {
      await approvalAPI.approveRequest(selected.id, remarks)
      closeModal(); setSuccess('Request approved successfully'); fetchRequests()
    } catch (err) { setModalError(err.response?.data?.message || 'Failed to approve') }
    finally { setSubmitting(false) }
  }

  const handleReject = async () => {
    if (!remarks?.trim()) { setModalError('Remarks are required for rejection'); return }
    setModalError(''); setSubmitting(true)
    try {
      await approvalAPI.rejectRequest(selected.id, remarks)
      closeModal(); setSuccess('Request rejected'); fetchRequests()
    } catch (err) { setModalError(err.response?.data?.message || 'Failed to reject') }
    finally { setSubmitting(false) }
  }

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate-800">{row.Student?.User?.name || '—'}</p>
          <p className="text-xs text-slate-400">{row.Student?.usn || ''}</p>
        </div>
      )
    },
    {
      key: 'dept',
      label: 'Department',
      render: (_, row) => <span className="text-sm text-slate-600">{row.Student?.Department?.name || '—'}</span>
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (_, row) => <span className="text-sm text-slate-600 line-clamp-1 max-w-xs">{row.reason || '—'}</span>
    },
    {
      key: 'destination',
      label: 'Destination',
      render: (_, row) => <span className="text-sm text-slate-600">{row.destination || '—'}</span>
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (_, row) => (
        <div className="text-sm text-slate-600">
          <p>{fmt(row.from_date)}</p>
          <p className="text-xs text-slate-400">to {fmt(row.to_date)}</p>
        </div>
      )
    },
    {
      key: 'applied',
      label: 'Applied',
      render: (_, row) => <span className="text-sm text-slate-500">{fmt(row.createdAt)}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openModal(row, 'approve')}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200">
            Approve
          </button>
          <button onClick={() => openModal(row, 'reject')}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors border border-red-200">
            Reject
          </button>
        </div>
      )
    }
  ]

  return (
    <DashboardShell>
      <PageHeader
        title="Pending Long Leave Requests"
        subtitle="Review and approve or reject student long leave requests"
      />

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{success}</div>}

      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        empty="No pending requests — all long leave requests have been processed"
      />

      {/* Approve Modal */}
      <Modal
        isOpen={modalType === 'approve'}
        onClose={closeModal}
        title="Approve Request"
        size="sm"
        footer={
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={handleApprove} disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
              {submitting ? 'Approving...' : 'Approve'}
            </button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Student:</span><span className="font-medium">{selected.Student?.User?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">USN:</span><span className="font-medium">{selected.Student?.usn}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reason:</span><span className="font-medium text-right max-w-xs">{selected.reason}</span></div>
            </div>
            {modalError && <p className="text-xs text-red-600">{modalError}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks (Optional)</label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                placeholder="Add any remarks..."
                className="input-field resize-none" />
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={modalType === 'reject'}
        onClose={closeModal}
        title="Reject Request"
        size="sm"
        footer={
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={handleReject} disabled={submitting || !remarks?.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {submitting ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Student:</span><span className="font-medium">{selected.Student?.User?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">USN:</span><span className="font-medium">{selected.Student?.usn}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reason:</span><span className="font-medium text-right max-w-xs">{selected.reason}</span></div>
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
