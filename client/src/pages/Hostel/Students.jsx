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
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchStudents(searchQuery)
    }, 300)

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
      console.log('[Students] Fetching students with query:', query)
      const response = await hostelAPI.getStudents(query)
      console.log('[Students] API response:', response)
      console.log('[Students] Students count:', response.data?.length)
      setStudents(response.data || [])
    } catch (err) {
      console.error('[Students] Error:', err)
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
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-500 mt-1 font-normal">View all registered students and their hostel information</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, USN, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-normal"
            />
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg font-semibold">No students found</p>
            <p className="text-gray-400 text-sm mt-1 font-normal">
              {searchQuery ? 'Try adjusting your search criteria' : 'No student profiles have been created yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {students.length} Student{students.length !== 1 ? 's' : ''} Found
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">USN</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hostel</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {student.User?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{student.User?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {student.usn || <span className="text-gray-400 italic">Not set</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.Department?.name || <span className="text-gray-400 italic">Not set</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.program_type ? (student.program_type === 'UG' ? 'Undergraduate' : 'Postgraduate') : <span className="text-gray-400 italic">N/A</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.year_of_study ? `Year ${student.year_of_study}` : <span className="text-gray-400 italic">N/A</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.hostel_name || <span className="text-gray-400 italic">Not set</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.room_number || <span className="text-gray-400 italic">Not set</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.User?.phone || student.parent_phone || <span className="text-gray-400 italic">N/A</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-semibold"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedStudent.User?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedStudent.User?.name}</h2>
                  <p className="text-sm text-gray-500">{selectedStudent.usn || 'USN not set'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Email', value: selectedStudent.User?.email },
                { label: 'Phone', value: selectedStudent.User?.phone || selectedStudent.parent_phone },
                { label: 'Department', value: selectedStudent.Department?.name },
                { label: 'Program', value: selectedStudent.program_type === 'UG' ? 'Undergraduate' : selectedStudent.program_type === 'PG' ? 'Postgraduate' : null },
                { label: 'Year of Study', value: selectedStudent.year_of_study ? `Year ${selectedStudent.year_of_study}` : null },
                { label: 'Semester', value: selectedStudent.semester ? `Semester ${selectedStudent.semester}` : null },
                { label: 'Hostel Name', value: selectedStudent.hostel_name },
                { label: 'Room Number', value: selectedStudent.room_number },
                { label: 'Parent Phone', value: selectedStudent.parent_phone },
                { label: 'Emergency Contact', value: selectedStudent.emergency_contact },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
                  <span className="text-sm font-medium text-gray-900">{value || <span className="text-gray-400 italic font-normal">Not set</span>}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm"
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
