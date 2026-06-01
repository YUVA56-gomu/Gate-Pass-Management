import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as passAPI from '../../api/pass.api'
import * as qrAPI from '../../api/qr.api'
import * as pdfAPI from '../../api/pdf.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import QRModal from '../../components/common/QRModal'

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

const STATUS_LABEL = {
  PENDING_HOSTEL: 'Pending Hostel',
  PENDING_COORDINATOR: 'Pending Coordinator',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function MyPasses() {
  const navigate = useNavigate()
  const location = useLocation()
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.message || '')
  const [filter, setFilter] = useState('ALL')
  const [expanded, setExpanded] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [qrData, setQrData] = useState({})
  const [qrLoading, setQrLoading] = useState({})
  const [pdfLoading, setPdfLoading] = useState({})
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedPassForQR, setSelectedPassForQR] = useState(null)

  useEffect(() => {
    fetchPasses()

    // Refresh every 30 seconds so status updates appear without manual reload
    const interval = setInterval(fetchPasses, 30000)

    // Also refresh when the student tabs back to this page
    const onVisible = () => { if (document.visibilityState === 'visible') fetchPasses() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t) }
  }, [success])

  const fetchPasses = async () => {
    try { setLoading(true); const r = await passAPI.getMyPasses(); setPasses(r.data || []) }
    catch (err) { setError(err.response?.data?.message || 'Failed to load passes') }
    finally { setLoading(false) }
  }

  const handleLoadQR = async (passId) => {
    if (qrData[passId]) {
      setSelectedPassForQR(passes.find(p => p.id === passId))
      setShowQRModal(true)
      return
    }
    try {
      setQrLoading(prev => ({ ...prev, [passId]: true }))
      const res = await qrAPI.getQRForPass(passId)
      setQrData(prev => ({ ...prev, [passId]: res.data }))
      setSelectedPassForQR(passes.find(p => p.id === passId))
      setShowQRModal(true)
    } catch { setError('Failed to load QR code.') }
    finally { setQrLoading(prev => ({ ...prev, [passId]: false })) }
  }

  const handleDownloadPDF = async (passId) => {
    try {
      setPdfLoading(prev => ({ ...prev, [passId]: true }))
      const blob = await pdfAPI.downloadPDF(passId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `gate_pass_${passId}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
      setSuccess('PDF downloaded successfully')
    } catch { setError('Failed to download PDF.') }
    finally { setPdfLoading(prev => ({ ...prev, [passId]: false })) }
  }

  const handleDelete = async (passId) => {
    try {
      setDeleting(true)
      await passAPI.deletePass(passId)
      setPasses(passes.filter(p => p.id !== passId))
      setDeleteId(null)
      setSuccess('Pass deleted successfully')
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete pass'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  const filtered = passes.filter(p => {
    if (filter === 'ALL') return true
    if (filter === 'PENDING') return p.status?.includes('PENDING')
    return p.status === filter
  })

  return (
    <DashboardShell>
      <PageHeader
        title="My Passes"
        subtitle="View and manage your gate passes"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={fetchPasses} disabled={loading}
              className="btn-secondary text-sm py-2 flex items-center gap-1.5 disabled:opacity-50">
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button onClick={() => navigate('/student/apply-pass')} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Apply New Pass
            </button>
          </div>
        }
      />

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 animate-fade-in">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex justify-between animate-fade-in">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-3">×</button>
        </div>
      )}

      {/* Filter Tabs */}
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

      {/* Passes */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-slate-700">No passes found</p>
          <p className="text-sm text-slate-400 mt-1">Start by applying for a new pass</p>
          <button onClick={() => navigate('/student/apply-pass')} className="btn-primary mt-4">
            Apply Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pass => (
            <div key={pass.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      pass.pass_type === 'DAILY' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'
                    }`}>
                      {pass.pass_type === 'DAILY'
                        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-800 text-sm">
                          {pass.pass_type === 'DAILY' ? 'Daily Pass' : 'Long Leave'}
                        </h3>
                        <span className="text-xs text-slate-400">#{pass.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{pass.reason}</p>
                    </div>
                  </div>
                  <StatusBadge status={pass.status} custom={STATUS_LABEL[pass.status]} />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    ['Destination', pass.destination || '—'],
                    [pass.pass_type === 'DAILY' ? 'Pass Date' : 'Leaving', fmt(pass.pass_type === 'DAILY' ? pass.pass_date : (pass.leaving_date || pass.from_date))],
                    [pass.pass_type === 'DAILY' ? 'Applied On' : 'Returning', fmt(pass.pass_type === 'DAILY' ? pass.createdAt : (pass.returning_date || pass.to_date))],
                    ['Hostel Staff', pass.hostelStaff?.name || '—'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">{label}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Rejection Reason */}
                {pass.status === 'REJECTED' && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm">
                    <span className="font-semibold text-red-700">Rejection Reason: </span>
                    <span className="text-red-600">{pass.Approvals?.find(a => a.status === 'REJECTED')?.remarks || 'No reason provided'}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setExpanded(expanded === pass.id ? null : pass.id)}
                    className="btn-ghost text-xs py-1.5 px-3 border border-slate-200 rounded-lg">
                    {expanded === pass.id ? 'Hide Details' : 'View Details'}
                  </button>
                  {pass.status === 'APPROVED' && (
                    <>
                      <button onClick={() => handleLoadQR(pass.id)} disabled={qrLoading[pass.id]}
                        className="btn-ghost text-xs py-1.5 px-3 border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg disabled:opacity-50">
                        {qrLoading[pass.id] ? <span className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin inline-block" /> : '🔲'} View QR
                      </button>
                      <button onClick={() => handleDownloadPDF(pass.id)} disabled={pdfLoading[pass.id]}
                        className="btn-ghost text-xs py-1.5 px-3 border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50">
                        {pdfLoading[pass.id] ? 'Downloading...' : '⬇ Download PDF'}
                      </button>
                    </>
                  )}
                  {(pass.status === 'PENDING_HOSTEL' || pass.status === 'PENDING_COORDINATOR') && (
                    <button onClick={() => setDeleteId(pass.id)}
                      className="btn-ghost text-xs py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg">
                      Delete
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {expanded === pass.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Basic Info</p>
                      <div className="space-y-1.5 text-sm">
                        {[
                          ['Pass ID', `#${pass.id}`],
                          ['Type', pass.pass_type === 'DAILY' ? 'Daily Pass' : 'Long Leave'],
                          ['Reason', pass.reason],
                          ['Destination', pass.destination],
                        ].map(([l, v]) => (
                          <div key={l} className="flex justify-between gap-2">
                            <span className="text-slate-400">{l}:</span>
                            <span className="font-medium text-slate-700 text-right">{v || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Dates</p>
                      <div className="space-y-1.5 text-sm">
                        {pass.pass_type === 'DAILY' ? (
                          <>
                            <div className="flex justify-between"><span className="text-slate-400">Pass Date:</span><span className="font-medium text-slate-700">{fmt(pass.pass_date)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Exit Time:</span><span className="font-medium text-slate-700">{pass.exit_time || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Return Time:</span><span className="font-medium text-slate-700">{pass.expected_return_time || '—'}</span></div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between"><span className="text-slate-400">Leaving:</span><span className="font-medium text-slate-700">{fmt(pass.leaving_date || pass.from_date)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Returning:</span><span className="font-medium text-slate-700">{fmt(pass.returning_date || pass.to_date)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Parent Contact:</span><span className="font-medium text-slate-700">{pass.parent_contact || '—'}</span></div>
                          </>
                        )}
                        <div className="flex justify-between"><span className="text-slate-400">Applied On:</span><span className="font-medium text-slate-700">{fmt(pass.createdAt)}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Pass" size="sm"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} disabled={deleting} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button onClick={() => handleDelete(deleteId)} disabled={deleting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        }>
        <p className="text-sm text-slate-600">Are you sure you want to delete this pass? This action cannot be undone.</p>
      </Modal>

      {/* QR Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrData={selectedPassForQR ? qrData[selectedPassForQR.id] : null}
        passDetails={selectedPassForQR ? {
          id: selectedPassForQR.id,
          studentName: selectedPassForQR.Student?.User?.name || 'N/A',
          passType: selectedPassForQR.pass_type,
          status: selectedPassForQR.status,
          destination: selectedPassForQR.destination,
          passDate: selectedPassForQR.pass_date || selectedPassForQR.leaving_date || selectedPassForQR.from_date
        } : null}
      />
    </DashboardShell>
  )
}

export default MyPasses
