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

function fmtTime(t) {
  if (!t) return '—'
  // t may be "HH:MM:SS" or "HH:MM"
  const [h, m] = t.split(':')
  const d = new Date(); d.setHours(+h, +m)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide flex-shrink-0 w-36">{label}</span>
      <span className="text-sm text-slate-800 font-medium text-right">{value || '—'}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-1">
        {children}
      </div>
    </div>
  )
}

export function PendingRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('details') // 'details' | 'approve' | 'reject'
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

  const openDetails = (req) => { setSelected(req); setView('details'); setRemarks(''); setModalError('') }
  const closeModal  = () => { setSelected(null); setView('details'); setRemarks(''); setModalError('') }

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

  const fromDate = (p) => p.leaving_date || p.from_date
  const toDate   = (p) => p.returning_date || p.to_date

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {row.Student?.User?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-medium text-slate-800">{row.Student?.User?.name || '—'}</p>
            <p className="text-xs text-slate-400 font-mono">{row.Student?.usn || ''}</p>
          </div>
        </div>
      )
    },
    {
      key: 'dept',
      label: 'Department',
      render: (_, row) => <span className="text-sm text-slate-600">{row.Student?.Department?.name || '—'}</span>
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
          <p>{fmt(fromDate(row))}</p>
          <p className="text-xs text-slate-400">to {fmt(toDate(row))}</p>
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
          <button onClick={() => openDetails(row)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200">
            View Details
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

      {error   && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{success}</div>}

      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        empty="No pending requests — all long leave requests have been processed"
      />

      {/* Details / Action Modal */}
      <Modal
        isOpen={!!selected}
        onClose={closeModal}
        title={
          view === 'approve' ? 'Approve Request' :
          view === 'reject'  ? 'Reject Request'  :
          'Gate Pass Details'
        }
        size="md"
        footer={
          view === 'details' ? (
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 btn-secondary py-2.5">Close</button>
              <button onClick={() => { setView('reject'); setRemarks(''); setModalError('') }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">
                Reject
              </button>
              <button onClick={() => { setView('approve'); setRemarks(''); setModalError('') }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors">
                Approve
              </button>
            </div>
          ) : view === 'approve' ? (
            <div className="flex gap-3">
              <button onClick={() => setView('details')} className="flex-1 btn-secondary py-2.5">Back</button>
              <button onClick={handleApprove} disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {submitting ? 'Approving...' : 'Confirm Approve'}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setView('details')} className="flex-1 btn-secondary py-2.5">Back</button>
              <button onClick={handleReject} disabled={submitting || !remarks?.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                {submitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          )
        }
      >
        {selected && view === 'details' && (
          <div className="space-y-3">
            <Section title="Student Information">
              <DetailRow label="Full Name"   value={selected.Student?.User?.name} />
              <DetailRow label="USN"         value={selected.Student?.usn} />
              <DetailRow label="Department"  value={selected.Student?.Department?.name} />
              <DetailRow label="Program"     value={selected.Student?.program_type} />
              <DetailRow label="Year / Sem"  value={selected.Student?.year_of_study && selected.Student?.semester ? `Year ${selected.Student.year_of_study} — Sem ${selected.Student.semester}` : null} />
              <DetailRow label="Email"       value={selected.Student?.User?.email} />
              <DetailRow label="Phone"       value={selected.Student?.User?.phone} />
            </Section>

            <Section title="Hostel Information">
              <DetailRow label="Hostel"      value={selected.Student?.hostel_name} />
              <DetailRow label="Room No."    value={selected.Student?.room_number} />
              <DetailRow label="Parent Phone" value={selected.Student?.parent_phone || selected.parent_contact} />
            </Section>

            <Section title="Pass Details">
              <DetailRow label="Pass Type"   value="Long Leave" />
              <DetailRow label="Destination" value={selected.destination} />
              <DetailRow label="Reason"      value={selected.reason} />
              <DetailRow label="Leaving Date"    value={fmt(selected.leaving_date || selected.from_date)} />
              <DetailRow label="Returning Date"  value={fmt(selected.returning_date || selected.to_date)} />
              <DetailRow label="Applied On"  value={fmt(selected.createdAt)} />
            </Section>
          </div>
        )}

        {selected && view === 'approve' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              You are about to <strong>approve</strong> the long leave request for <strong>{selected.Student?.User?.name}</strong> ({selected.Student?.usn}).
            </div>
            {modalError && <p className="text-xs text-red-600">{modalError}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                placeholder="Add any remarks..." className="input-field resize-none" />
            </div>
          </div>
        )}

        {selected && view === 'reject' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              You are about to <strong>reject</strong> the long leave request for <strong>{selected.Student?.User?.name}</strong> ({selected.Student?.usn}).
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
