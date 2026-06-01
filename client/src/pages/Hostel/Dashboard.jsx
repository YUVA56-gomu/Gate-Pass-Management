import { useState, useEffect } from 'react'
import { useNotification } from '../../hooks/useNotification'
import * as hostelAPI from '../../api/hostel.api'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { StatsCard } from '../../components/ui/StatsCard'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'

const TABS = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'pending',   label: 'Pending',  badge: true },
  { id: 'allpasses', label: 'All Passes' },
  { id: 'students',  label: 'Students' },
]

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CoordBadge({ pass }) {
  if (pass.pass_type === 'DAILY') return <span className="text-xs text-slate-400">N/A</span>
  if (pass.status === 'PENDING_COORDINATOR') return <span className="badge badge-warning">Pending</span>
  return <span className="badge badge-success">Approved</span>
}

export function Dashboard() {
  const { addNotification } = useNotification()
  const [stats, setStats] = useState({ pending: 0, approvedToday: 0, rejectedToday: 0, studentsOutside: 0 })
  const [pendingPasses, setPendingPasses] = useState([])
  const [allPasses, setAllPasses] = useState([])
  const [students, setStudents] = useState([])
  const [todayOverview, setTodayOverview] = useState({ entriesIn: 0, exitsOut: 0, currentlyOutside: 0, expectedReturnsToday: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedPass, setSelectedPass] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectRemarks, setRejectRemarks] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [dash, pending, allP, studs, outside, overview] = await Promise.all([
        hostelAPI.getDashboard(),
        hostelAPI.getPendingPasses(),
        hostelAPI.getAllPasses('ALL'),
        hostelAPI.getStudents(),
        hostelAPI.getStudentsOutside(),
        hostelAPI.getTodayOverview()
      ])
      if (dash.success)     setStats(dash.data.stats || {})
      if (pending.success)  setPendingPasses(pending.data || [])
      if (allP.success)     setAllPasses(allP.data || [])
      if (studs.success)    setStudents(studs.data || [])
      if (overview.success) setTodayOverview(overview.data || {})
    } catch (err) {
      addNotification('Failed to load dashboard data', 'error')
    } finally { setLoading(false) }
  }

  const handleApprove = async (passId) => {
    try {
      const res = await hostelAPI.approvePass(passId, '')
      if (!res?.success) { addNotification(res?.message || 'Failed to approve', 'error'); return }
      await fetchData(); setShowModal(false); setRejectRemarks('')
      addNotification('Pass approved successfully', 'success')
    } catch (err) { addNotification(err.response?.data?.message || 'Failed to approve', 'error') }
  }

  const handleReject = async (passId) => {
    if (!rejectRemarks?.trim()) { addNotification('Remarks are required for rejection', 'error'); return }
    try {
      const res = await hostelAPI.rejectPass(passId, rejectRemarks)
      if (!res?.success) { addNotification(res?.message || 'Failed to reject', 'error'); return }
      await fetchData(); setShowModal(false); setRejectRemarks('')
      addNotification('Pass rejected', 'success')
    } catch (err) { addNotification(err.response?.data?.message || 'Failed to reject', 'error') }
  }

  const filteredStudents = students.filter(s =>
    s.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const PendingTable = ({ passes, limit }) => {
    const data = limit ? passes.slice(0, limit) : passes
    if (data.length === 0) return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="font-medium text-slate-600">No pending requests</p>
        <p className="text-sm text-slate-400 mt-1">All caught up!</p>
      </div>
    )
    return (
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th><th>Pass Type</th><th>Coordinator</th>
              <th>Reason</th><th>Dates</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(pass => (
              <tr key={pass.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {pass.Student?.User?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{pass.Student?.User?.name || '—'}</p>
                      <p className="text-xs text-slate-400 font-mono">{pass.Student?.usn || ''}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${pass.pass_type === 'LONG_LEAVE' ? 'badge-purple' : 'badge-info'}`}>
                    {pass.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
                  </span>
                </td>
                <td><CoordBadge pass={pass} /></td>
                <td><span className="text-sm text-slate-600 line-clamp-1 max-w-xs">{pass.reason || '—'}</span></td>
                <td>
                  <span className="text-sm text-slate-600">
                    {pass.pass_type === 'DAILY'
                      ? fmt(pass.pass_date)
                      : `${fmt(pass.leaving_date || pass.from_date)} → ${fmt(pass.returning_date || pass.to_date)}`}
                  </span>
                </td>
                <td>
                  {pass.status === 'PENDING_COORDINATOR' ? (
                    <span className="text-xs text-slate-400 italic">Awaiting Coordinator</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleApprove(pass.id)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200" title="Approve">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button onClick={() => { setSelectedPass(pass); setShowModal(true) }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200" title="Reject">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button onClick={() => { setSelectedPass(pass); setShowModal(true) }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200" title="View">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <DashboardShell>
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-sm">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}>
            {tab.label}
            {tab.badge && stats.pending > 0 && (
              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                activeTab === tab.id ? 'bg-white text-slate-900' : 'bg-red-500 text-white'
              }`}>
                {stats.pending > 9 ? '9+' : stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Pending Requests"  value={stats.pending || 0}        color="amber"   loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatsCard label="Approved Today"    value={stats.approvedToday || 0}  color="emerald" loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        />
        <StatsCard label="Rejected Today"    value={stats.rejectedToday || 0}  color="red"     loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
        />
        <StatsCard label="Students Outside"  value={stats.studentsOutside || 0} color="violet" loading={loading}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Pending Requests</h3>
                <button onClick={() => setActiveTab('pending')} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">View all →</button>
              </div>
              <PendingTable passes={pendingPasses} limit={5} />
            </div>
          </div>
          <div className="space-y-4">
            {/* Today's Overview */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Today's Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Entries (IN)', value: todayOverview.entriesIn, color: 'text-emerald-600' },
                  { label: 'Exits (OUT)', value: todayOverview.exitsOut, color: 'text-orange-600' },
                  { label: 'Currently Outside', value: todayOverview.currentlyOutside, color: 'text-violet-600' },
                  { label: 'Expected Returns', value: todayOverview.expectedReturnsToday, color: 'text-blue-600' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className={`text-xl font-bold ${item.color}`}>{item.value || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Notice */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">Important</p>
              <ul className="space-y-1.5 text-xs text-amber-700">
                <li>• Verify all details before approving passes</li>
                <li>• Long leave requires Coordinator approval first</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">All Pending Requests</h3>
          </div>
          <PendingTable passes={pendingPasses} />
        </div>
      )}

      {activeTab === 'allpasses' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">All Passes</h3>
          </div>
          {allPasses.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No passes found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Pass ID</th><th>Student</th><th>Type</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {allPasses.map(pass => (
                    <tr key={pass.id}>
                      <td><span className="font-mono text-xs text-slate-500">#{pass.id}</span></td>
                      <td><span className="font-medium text-slate-800">{pass.Student?.User?.name || '—'}</span></td>
                      <td>
                        <span className={`badge ${pass.pass_type === 'LONG_LEAVE' ? 'badge-purple' : 'badge-info'}`}>
                          {pass.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'}
                        </span>
                      </td>
                      <td><span className="text-sm text-slate-500">{fmt(pass.updatedAt)}</span></td>
                      <td><StatusBadge status={pass.status} /></td>
                      <td>
                        <button onClick={() => { setSelectedPass(pass); setShowModal(true) }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <h3 className="font-semibold text-slate-800 text-sm">Student Directory</h3>
            <input type="text" placeholder="Search by name, USN, or department..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="input-field max-w-xs text-sm py-2" />
          </div>
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No students found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>USN</th><th>Department</th><th>Hostel</th><th>Room</th><th>Email</th></tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s.id}>
                      <td><span className="font-medium text-slate-800">{s.User?.name || '—'}</span></td>
                      <td><span className="font-mono text-xs text-slate-500">{s.usn || '—'}</span></td>
                      <td><span className="text-sm text-slate-600">{s.Department?.name || '—'}</span></td>
                      <td><span className="text-sm text-slate-600">{s.hostel_name || '—'}</span></td>
                      <td><span className="text-sm text-slate-600">{s.room_number || '—'}</span></td>
                      <td><span className="text-sm text-slate-500">{s.User?.email || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pass Detail / Reject Modal */}
      <Modal
        isOpen={showModal && !!selectedPass}
        onClose={() => { setShowModal(false); setSelectedPass(null); setRejectRemarks('') }}
        title="Pass Details"
        size="md"
        footer={
          selectedPass?.status === 'PENDING_HOSTEL' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Rejection Remarks <span className="text-slate-400 text-xs">(required for rejection)</span>
                </label>
                <textarea value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)}
                  placeholder="Enter reason for rejection..." rows={2}
                  className="input-field resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleApprove(selectedPass.id)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors">
                  Approve Pass
                </button>
                <button onClick={() => handleReject(selectedPass.id)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">
                  Reject Pass
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              This pass has been {selectedPass?.status?.toLowerCase()} and cannot be modified.
            </div>
          )
        }
      >
        {selectedPass && (
          <div className="space-y-4">
            {(selectedPass.status === 'APPROVED' || selectedPass.status === 'REJECTED') && (
              <div className={`p-3 rounded-xl border-2 ${selectedPass.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                <StatusBadge status={selectedPass.status} />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Student</p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
                {[
                  ['Name', selectedPass.Student?.User?.name],
                  ['USN', selectedPass.Student?.usn],
                  ['Department', selectedPass.Student?.Department?.name],
                  ['Semester', selectedPass.Student?.semester],
                  ['Parent Contact', selectedPass.parent_contact],
                ].map(([l, v]) => v && (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-500">{l}:</span>
                    <span className="font-medium text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Pass Info</p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
                {[
                  ['Type', selectedPass.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily Pass'],
                  ['Reason', selectedPass.reason],
                  ['Destination', selectedPass.destination],
                  selectedPass.pass_type === 'DAILY'
                    ? ['Pass Date', fmt(selectedPass.pass_date)]
                    : ['Leaving', fmt(selectedPass.leaving_date || selectedPass.from_date)],
                  selectedPass.pass_type !== 'DAILY'
                    ? ['Returning', fmt(selectedPass.returning_date || selectedPass.to_date)]
                    : null,
                ].filter(Boolean).map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-500">{l}:</span>
                    <span className="font-medium text-slate-800 text-right max-w-xs">{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  )
}

export default Dashboard
