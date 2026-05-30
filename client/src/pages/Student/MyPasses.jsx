import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as passAPI from '../../api/pass.api'

export const MyPasses = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.message || '')
  const [filter, setFilter] = useState('ALL')

  // Fetch passes on mount
  useEffect(() => {
    fetchPasses()
  }, [])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
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
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'PENDING_HOSTEL': 'bg-yellow-100 text-yellow-800',
      'PENDING_COORDINATOR': 'bg-blue-100 text-blue-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'COMPLETED': 'bg-purple-100 text-purple-800'
    }

    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPassTypeIcon = (type) => {
    return type === 'DAILY' ? '📅' : '📋'
  }

  // Filter passes
  const filteredPasses = passes.filter((pass) => {
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
            <p className="text-gray-600 mt-2">View and manage your gate passes</p>
          </div>
          <button
            onClick={() => navigate('/student/apply-pass')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Apply New Pass
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                filter === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Passes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading passes...</p>
          </div>
        ) : filteredPasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">No passes found</p>
            <p className="text-gray-500 text-sm mt-1">Start by applying for a new pass</p>
            <button
              onClick={() => navigate('/student/apply-pass')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Apply Now
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPasses.map((pass) => (
              <div key={pass.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getPassTypeIcon(pass.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {pass.type === 'DAILY' ? 'Daily Pass' : 'Long Leave'}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{pass.reason}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(pass.status)}`}>
                      {pass.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Destination</p>
                      <p className="font-medium text-gray-900">{pass.destination}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">From Date</p>
                      <p className="font-medium text-gray-900">{formatDate(pass.from_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">To Date</p>
                      <p className="font-medium text-gray-900">{formatDate(pass.to_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Applied On</p>
                      <p className="font-medium text-gray-900">{formatDate(pass.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/student/passes/${pass.id}`)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
                    >
                      View Details
                    </button>
                    {/* PDF and QR buttons will be added later */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPasses
