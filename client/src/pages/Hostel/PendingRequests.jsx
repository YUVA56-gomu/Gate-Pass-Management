import React, { useState, useEffect } from 'react'
import * as hostelAPI from '../../api/hostel.api'

const PendingRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [modalData, setModalData] = useState({
    remarks: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  // Fetch pending passes on mount
  useEffect(() => {
    fetchPendingPasses()
  }, [])

  const fetchPendingPasses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await hostelAPI.getPendingPasses()
      setRequests(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending passes')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleApproveClick = (request) => {
    setSelectedRequest(request)
    setModalData({ remarks: '' })
    setModalError('')
    setShowApprovalModal(true)
  }

  const handleRejectClick = (request) => {
    setSelectedRequest(request)
    setModalData({ remarks: '' })
    setModalError('')
    setShowRejectModal(true)
  }

  const handleApprove = async () => {
    setModalError('')

    if (!selectedRequest) return

    setSubmitting(true)

    try {
      await hostelAPI.approvePass(selectedRequest.id, modalData.remarks)
      setShowApprovalModal(false)
      setSelectedRequest(null)
      setModalData({ remarks: '' })
      // Refresh list
      await fetchPendingPasses()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to approve pass')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    setModalError('')

    if (!modalData.remarks?.trim()) {
      setModalError('Remarks are mandatory for rejection')
      return
    }

    if (!selectedRequest) return

    setSubmitting(true)

    try {
      await hostelAPI.rejectPass(selectedRequest.id, modalData.remarks)
      setShowRejectModal(false)
      setSelectedRequest(null)
      setModalData({ remarks: '' })
      // Refresh list
      await fetchPendingPasses()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to reject pass')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Passes</h1>
          <p className="text-gray-600 mt-2">Review and approve/reject pending passes</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Requests Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending passes...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">No pending passes</p>
            <p className="text-gray-500 text-sm mt-1">All passes have been processed</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">USN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">From Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">To Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Applied Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {request.Student?.User?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.Student?.usn}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.Student?.Department?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.type === 'LONG_LEAVE' ? '📋 Long Leave' : '📅 Daily'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.destination}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(request.from_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(request.to_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleApproveClick(request)}
                          className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(request)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition font-medium"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Approve Pass</h2>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 text-sm">{modalError}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Student:</strong> {selectedRequest?.Student?.User?.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>USN:</strong> {selectedRequest?.Student?.usn}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Type:</strong> {selectedRequest?.type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks (Optional)
              </label>
              <textarea
                value={modalData.remarks}
                onChange={(e) => setModalData({ remarks: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add any remarks..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium"
              >
                {submitting ? 'Approving...' : 'Approve Pass'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Pass</h2>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 text-sm">{modalError}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Student:</strong> {selectedRequest?.Student?.User?.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>USN:</strong> {selectedRequest?.Student?.usn}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Type:</strong> {selectedRequest?.type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks (Required) *
              </label>
              <textarea
                value={modalData.remarks}
                onChange={(e) => setModalData({ remarks: e.target.value })}
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  !modalData.remarks?.trim() && modalError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Provide reason for rejection..."
              />
              <p className="text-xs text-gray-500 mt-1">Remarks are mandatory for rejection</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting || !modalData.remarks?.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition font-medium"
              >
                {submitting ? 'Rejecting...' : 'Reject Pass'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingRequests
