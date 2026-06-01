import { useState, useEffect, useRef } from 'react'
import * as hostelAPI from '../../api/hostel.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { Modal } from '../../components/ui/Modal'

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value || <span className="text-slate-400 italic font-normal">Not set</span>}</span>
    </div>
  )
}

export function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const debounceTimer = useRef(null)

  useEffect(() => { fetchStudents('') }, [])

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => fetchStudents(searchQuery), 300)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [searchQuery])

  const fetchStudents = async (query) => {
    try {
      setLoading(true); setError('')
      const res = await hostelAPI.getStudents(query)
      setStudents(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students')
    } finally { setLoading(false) }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Student Directory"
        subtitle="View all registered students and their hostel information"
      />

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {/* Search */}
      <div className="mb-5 relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search by name, USN, or department..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="input-field pl-10 max-w-md" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Header */}
        {!loading && students.length > 0 && (
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-600">
              {students.length} student{students.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center"><div className="spinner mx-auto mb-3" /><p className="text-sm text-slate-400">Loading students...</p></div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="font-medium text-slate-600">No students found</p>
            <p className="text-sm text-slate-400 mt-1">{searchQuery ? 'Try adjusting your search' : 'No student profiles yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>USN</th><th>Department</th><th>Year</th><th>Hostel</th><th>Room</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.User?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <span className="font-medium text-slate-800">{s.User?.name || '—'}</span>
                      </div>
                    </td>
                    <td><span className="font-mono text-xs text-slate-500">{s.usn || '—'}</span></td>
                    <td><span className="text-sm text-slate-600">{s.Department?.name || '—'}</span></td>
                    <td><span className="text-sm text-slate-600">{s.year_of_study ? `Year ${s.year_of_study}` : '—'}</span></td>
                    <td><span className="text-sm text-slate-600">{s.hostel_name || '—'}</span></td>
                    <td><span className="text-sm text-slate-600">{s.room_number || '—'}</span></td>
                    <td>
                      <button onClick={() => setSelected(s)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Student Details" size="sm"
        footer={
          <button onClick={() => setSelected(null)} className="w-full btn-primary py-2.5">Close</button>
        }>
        {selected && (
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {selected.User?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <p className="font-bold text-slate-900">{selected.User?.name}</p>
                <p className="text-sm text-slate-500">{selected.usn || 'USN not set'}</p>
              </div>
            </div>
            <div className="space-y-0">
              <InfoRow label="Email"            value={selected.User?.email} />
              <InfoRow label="Phone"            value={selected.User?.phone || selected.parent_phone} />
              <InfoRow label="Department"       value={selected.Department?.name} />
              <InfoRow label="Program"          value={selected.program_type === 'UG' ? 'Undergraduate' : selected.program_type === 'PG' ? 'Postgraduate' : selected.program_type} />
              <InfoRow label="Year of Study"    value={selected.year_of_study ? `Year ${selected.year_of_study}` : null} />
              <InfoRow label="Semester"         value={selected.semester ? `Semester ${selected.semester}` : null} />
              <InfoRow label="Hostel"           value={selected.hostel_name} />
              <InfoRow label="Room"             value={selected.room_number} />
              <InfoRow label="Parent Phone"     value={selected.parent_phone} />
              <InfoRow label="Emergency"        value={selected.emergency_contact} />
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  )
}

export default Students
