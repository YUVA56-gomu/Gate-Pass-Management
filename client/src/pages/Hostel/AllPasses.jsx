import React, { useState, useEffect } from 'react'
import * as hostelAPI from '../../api/hostel.api'

const AllPasses = () => {
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  // Fetch passes on mount and when filter changes
  useEffect(() => {
    fetchPasses()
  }, [filter])

  const fetchPasses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await hostelAPI.getAllPasses(filter)
      setPasses(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load passes')
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

  const getStatusBadge = (status) => {
    const statusColors = {
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'PENDING_HOSTEL': 'bg-yellow-100 text-yellow-800'
    }

    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeBadge = (type) => {
    return type === 'LONG_LEAVE' ? '📋 Long Leave' : '📅 Daily'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Passes</h1>
          <p className="text-gray-600 mt-2">View all passes with filtering options</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
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
            onClick={() => setFilter('DAILY')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'DAILY'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilter('LONG_LEAVE')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'LONG_LEAVE'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Long Leave
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
          <button
            onClick={() => setFilter('PENDING_HOSTEL')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'PENDING_HOSTEL'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
        </div>

        {/* Passes Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading passes...</p>
          </div>
        ) : passes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">No passes found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Pass ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {passes.map((pass) => (
                    <tr key={pass.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{pass.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pass.Student?.User?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getTypeBadge(pass.type)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(pass.status)}`}>
                          {pass.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(pass.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {!loading && passes.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-600 text-sm">Total Passes</p>
              <p className="text-2xl font-bold text-gray-900">{passes.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600">{passes.filter((p) => p.status === 'APPROVED').length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{passes.filter((p) => p.status === 'REJECTED').length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllPasses
