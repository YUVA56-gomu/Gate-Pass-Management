import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as passAPI from '../../api/pass.api'
import * as qrAPI from '../../api/qr.api'
import * as pdfAPI from '../../api/pdf.api'

export const MyPasses = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.message || '')
  const [filter, setFilter] = useState('ALL')
  const [expandedPass, setExpandedPass] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [qrData, setQrData] = useState({})
  const [qrLoading, setQrLoading] = useState({})
  const [pdfLoading, setPdfLoading] = useState({})

  useEffect(() => { fetchPasses() }, [])

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(t)
    }
  }, [success])

  const fetchPasses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await passAPI.getMyPasses()
      setPasses(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load passes')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const map = {
      PENDING_HOSTEL: 'bg-yellow-100 text-yellow-800',
      PENDING_COORDINATOR: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
    }
    return map[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const map = {
      PENDING_HOSTEL: 'Pending Hostel Approval',
      PENDING_COORDINATOR: 'Pending Coordinator Approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED: 'Cancelled',
      COMPLETED: 'Completed',
    }
    return map[status] || status
  }

  const getPassTypeIcon = (type) => (type === 'DAILY' ? '📅' : '📋')

  const togglePassDetails = (passId) => {
    setExpandedPass(expandedPass === passId ? null : passId)
  }

  const canDeletePass = (pass) =>
    pass.status === 'PENDING_HOSTEL' || pass.status === 'PENDING_COORDINATOR'

  const handleDeletePass = async (passId) => {
    try {
      setDeleting(true)
      await passAPI.deletePass(passId)
      setPasses(passes.filter(p => p.id !== passId))
      setShowDeleteConfirm(null)
      setSuccess('Pass deleted successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete pass')
      setShowDeleteConfirm(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleLoadQR = async (passId) => {
    if (qrData[passId]) return
    try {
      setQrLoading(prev => ({ ...prev, [passId]: true }))
      const response = await qrAPI.getQRForPass(passId)
      setQrData(prev => ({ ...prev, [passId]: response.data }))
    } catch (err) {
      setError('Failed to load QR code. Please try again.')
    } finally {
      setQrLoading(prev => ({ ...prev, [passId]: false }))
    }
  }

  const handleDownloadPDF = async (passId) => {
    try {
      setPdfLoading(prev => ({ ...prev, [passId]: true }))
      const blob = await pdfAPI.downloadPDF(passId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gate_pass_${passId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setSuccess('PDF downloaded successfully')
    } catch (err) {
      setError('Failed to download PDF. Please try again.')
    } finally {
      setPdfLoading(prev => ({ ...prev, [passId]: false }))
    }
  }

  const filteredPasses = passes.filter(pass => {
    if (filter === 'ALL') return true
    if (filter === 'PENDING') return pass.status?.includes('PENDING')
    if (filter === 'APPROVED') return pass.status === 'APPROVED'
    if (filter === 'REJECTED') return pass.status === 'REJECTED'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Passes</h1>
            <p className="text-gray-500 mt-1 font-normal">View and manage your gate passes</p>
          </div>
          <button
            onClick={() => navigate('/student/apply-pass')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm"
          >
            + Apply New Pass
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex justify-between items-start">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4 text-lg leading-none">×</button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-1 border-b border-gray-200">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition ${
                filter === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Passes List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading passes...</p>
          </div>
        ) : filteredPasses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-700 text-lg font-semibold">No passes found</p>
            <p className="text-gray-400 text-sm mt-1 font-normal">Start by applying for a new pass</p>
            <button
              onClick={() => navigate('/student/apply-pass')}
              className="mt-5 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm"
            >
              Apply Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPasses.map(pass => (
              <div key={pass.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">

                  {/* Pass header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{getPassTypeIcon(pass.pass_type)}</span>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {pass.pass_type === 'DAILY' ? 'Daily Pass' : 'Long Leave'}
                          <span className="ml-2 text-xs font-normal text-gray-400">#{pass.id}</span>
                        </h3>
                        <p className="text-gray-500 text-sm mt-0.5 font-normal">{pass.reason}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(pass.status)}`}>
                      {getStatusText(pass.status)}
                    </span>
                  </div>

                  {/* Quick info row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Destination</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{pass.destination || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                        {pass.pass_type === 'DAILY' ? 'Pass Date' : 'Leaving'}
                      </p>
                      <p className="font-semibold text-gray-800 mt-0.5">
                        {pass.pass_type === 'DAILY'
                          ? formatDate(pass.pass_date)
                          : formatDate(pass.leaving_date || pass.from_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                        {pass.pass_type === 'DAILY' ? 'Applied On' : 'Returning'}
                      </p>
                      <p className="font-semibold text-gray-800 mt-0.5">
                        {pass.pass_type === 'DAILY'
                          ? formatDate(pass.createdAt)
                          : formatDate(pass.returning_date || pass.to_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Hostel Staff</p>
                      <p className="font-semibold text-gray-800 mt-0.5">
                        {pass.hostelStaff?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Rejection reason banner */}
                  {pass.status === 'REJECTED' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm">
                      <span className="font-semibold text-red-700">Rejection Reason: </span>
                      <span className="text-red-600 font-normal">
                        {pass.Approvals?.find(a => a.status === 'REJECTED')?.remarks || 'No reason provided'}
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => togglePassDetails(pass.id)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-semibold text-sm flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d={expandedPass === pass.id ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                      {expandedPass === pass.id ? 'Hide Details' : 'View Details'}
                    </button>

                    {/* QR button — approved only */}
                    {pass.status === 'APPROVED' && (
                      <button
                        onClick={() => handleLoadQR(pass.id)}
                        disabled={qrLoading[pass.id]}
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition font-semibold text-sm flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {qrLoading[pass.id] ? (
                          <span className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full inline-block"></span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        )}
                        {qrData[pass.id] ? 'QR Loaded' : 'View QR'}
                      </button>
                    )}

                    {/* PDF download — approved only */}
                    {pass.status === 'APPROVED' && (
                      <button
                        onClick={() => handleDownloadPDF(pass.id)}
                        disabled={pdfLoading[pass.id]}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition font-semibold text-sm flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {pdfLoading[pass.id] ? (
                          <span className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full inline-block"></span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        {pdfLoading[pass.id] ? 'Downloading...' : 'Download PDF'}
                      </button>
                    )}

                    {/* Delete — pending only */}
                    {canDeletePass(pass) && (
                      <button
                        onClick={() => setShowDeleteConfirm(pass.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-semibold text-sm flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>

                  {/* QR Code preview */}
                  {pass.status === 'APPROVED' && qrData[pass.id] && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center">
                      <p className="text-sm font-semibold text-purple-800 mb-3">QR Code — Show at Security Gate</p>
                      <img
                        src={qrData[pass.id].qrImage}
                        alt="QR Code"
                        className="w-40 h-40 rounded-lg border border-purple-200 shadow-sm"
                      />
                      <p className="text-xs text-purple-500 mt-2 font-normal">Scan this at the gate for verification</p>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedPass === pass.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Basic Info */}
                        <div>
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic Information</h5>
                          <div className="space-y-2 text-sm">
                            {[
                              ['Pass ID', `#${pass.id}`],
                              ['Type', pass.pass_type === 'DAILY' ? 'Daily Pass' : 'Long Leave'],
                              ['Reason', pass.reason],
                              ['Destination', pass.destination],
                            ].map(([label, value]) => (
                              <div key={label} className="flex justify-between">
                                <span className="text-gray-500">{label}:</span>
                                <span className="font-medium text-gray-900 text-right max-w-xs">{value}</span>
                              </div>
                            ))}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Status:</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(pass.status)}`}>
                                {getStatusText(pass.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date Info */}
                        <div>
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Date & Time</h5>
                          <div className="space-y-2 text-sm">
                            {pass.pass_type === 'DAILY' ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Pass Date:</span>
                                  <span className="font-medium text-gray-900">{formatDate(pass.pass_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Exit Time:</span>
                                  <span className="font-medium text-gray-900">{pass.exit_time || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Expected Return:</span>
                                  <span className="font-medium text-gray-900">{pass.expected_return_time || 'Not specified'}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Leaving Date:</span>
                                  <span className="font-medium text-gray-900">{formatDate(pass.leaving_date || pass.from_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Returning Date:</span>
                                  <span className="font-medium text-gray-900">{formatDate(pass.returning_date || pass.to_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Parent Contact:</span>
                                  <span className="font-medium text-gray-900">{pass.parent_contact || 'Not provided'}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Applied On:</span>
                              <span className="font-medium text-gray-900">{formatDate(pass.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Approval Info */}
                        <div className="md:col-span-2">
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Approval Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Coordinator:</span>
                                <span className="font-medium text-gray-900">
                                  {pass.pass_type === 'DAILY'
                                    ? <span className="text-gray-400 italic text-xs">N/A — Daily Pass</span>
                                    : (pass.coordinator?.name || 'Not assigned')}
                                </span>
                              </div>
                              {pass.pass_type === 'LONG_LEAVE' && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Coordinator Status:</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    pass.status === 'PENDING_COORDINATOR' ? 'bg-yellow-100 text-yellow-800'
                                    : pass.status === 'REJECTED' ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                  }`}>
                                    {pass.status === 'PENDING_COORDINATOR' ? 'Pending'
                                      : pass.status === 'REJECTED' ? 'Rejected' : 'Approved'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Hostel Staff:</span>
                                <span className="font-medium text-gray-900">
                                  {pass.hostelStaff?.name || 'Not assigned'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Hostel Status:</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  pass.status === 'PENDING_HOSTEL' ? 'bg-yellow-100 text-yellow-800'
                                  : pass.status === 'PENDING_COORDINATOR' ? 'bg-gray-100 text-gray-500'
                                  : pass.status === 'REJECTED' ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                                }`}>
                                  {pass.status === 'PENDING_HOSTEL' ? 'Pending'
                                    : pass.status === 'PENDING_COORDINATOR' ? 'Awaiting Coordinator'
                                    : pass.status === 'REJECTED' ? 'Rejected'
                                    : 'Approved'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Pass</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6 font-normal">
              Are you sure you want to delete this pass? This action cannot be undone. Only pending passes can be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-semibold text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePass(showDeleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Deleting...</>
                ) : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPasses
