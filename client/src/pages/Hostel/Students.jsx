import React, { useState, useEffect, useRef } from 'react'
import * as hostelAPI from '../../api/hostel.api'

const Students = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const debounceTimer = useRef(null)

  // Fetch students on mount
  useEffect(() => {
    fetchStudents('')
  }, [])

  // Debounced search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer for debounced search (300ms)
    debounceTimer.current = setTimeout(() => {
      fetchStudents(searchQuery)
    }, 300)

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery])

  const fetchStudents = async (query) => {
    try {
      setLoading(true)
      setError('')
      const response = await hostelAPI.getStudents(query)
      setStudents(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (student) => {
    setSelectedStudent(student)
    setShowDetailsModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-600 mt-2">Search and view student information</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, USN, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
            </svg>
            <p className="text-gray-600 text-lg">No students found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">USN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hostel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.User?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.usn}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.Department?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.program_type === 'UG' ? 'Undergraduate' : 'Postgraduate'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Year {student.year_of_study}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.hostel_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.room_number}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition font-medium"
                        >
                          View Details
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

      {/* Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Details</h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase">Name</p>
                <p className="text-sm font-medium text-gray-900">{selectedStudent.User?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="text-sm text-gray-600">{selectedStudent.User?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">USN</p>
                <p className="text-sm text-gray-600">{selectedStudent.usn}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Department</p>
                <p className="text-sm text-gray-600">{selectedStudent.Department?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Program Type</p>
                <p className="text-sm text-gray-600">
                  {selectedStudent.program_type === 'UG' ? 'Undergraduate' : 'Postgraduate'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Year of Study</p>
                <p className="text-sm text-gray-600">Year {selectedStudent.year_of_study}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Semester</p>
                <p className="text-sm text-gray-600">Semester {selectedStudent.semester}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Hostel Name</p>
                <p className="text-sm text-gray-600">{selectedStudent.hostel_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Room Number</p>
                <p className="text-sm text-gray-600">{selectedStudent.room_number}</p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students
