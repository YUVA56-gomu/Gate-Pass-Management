import React, { useState, useEffect } from 'react'
import * as approvalAPI from '../../api/approval.api'

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL') // ALL, APPROVED, REJECTED

  // Fetch approval history on mount
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await approvalAPI.getApprovalHistory()
      setHistory(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approval history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter history based on selected filter
  const filteredHistory = history.filter((item) => {
    if (filter === 'ALL') return true
    if (filter === 'APPROVED') return item.status === 'APPROVED'
    if (filter === 'REJECTED') return item.status === 'REJECTED'
    return true
  })

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Approved</span>
    }
    if (status === 'REJECTED') {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Rejected</span>
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{status}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Approval History</h1>
          <p className="text-gray-600 mt-2">View all long leave requests you have approved or rejected</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'APPROVED'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'REJECTED'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* History Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading approval history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">No approvals found</p>
            <p className="text-gray-500 text-sm mt-1">
              {filter === 'ALL' ? 'You have not processed any requests yet' : `No ${filter.toLowerCase()} requests found`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Pass ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">USN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Decision</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Remarks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{item.Pass?.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.Pass?.Student?.User?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.Pass?.Student?.usn}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.Pass?.Student?.Department?.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        {item.remarks ? (
                          <span title={item.remarks} className="truncate block">
                            {item.remarks}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(item.approved_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {!loading && history.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-600 text-sm">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900">{history.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600">{history.filter((h) => h.status === 'APPROVED').length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{history.filter((h) => h.status === 'REJECTED').length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
