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

function fmtTime(t) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const d = new Date(); d.setHours(+h, +m)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function CoordBadge({ pass }) {
  if (pass.pass_type === 'DAILY') return <span className="text-xs text-slate-400">N/A</span>
  if (pass.status === 'PENDING_COORDINATOR') return <span className="badge badge-warning">Pending</span>
  return <span className="badge badge-success">Approved</span>
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide flex-shrink-0 w-36">{label}</span>
      <span className="text-sm text-slate-800 font-medium text-right">{value || '—'}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-1">
        {children}
      </div>
    </div>
  )
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
  const [searchTerm, setSearchTerm] = useState('')

  // Modal state — shared between pending table and all-passes view
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('details') // 'details' | 'approve' | 'reject'
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [dash, pending, allP, studs, overview] = await Promise.all([
        hostelAPI.getDashboard(),
        hostelAPI.getPendingPasses(),
        hostelAPI.getAllPasses('ALL'),
        hostelAPI.getStudents(),
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

  const openDetails = (pass) => { setSelected(pass); setView('details'); setRemarks(''); setModalError('') }
  const closeModal  = () => { setSelected(null); setView('details'); setRemarks(''); setModalError('') }

  const handleApprove = async () => {
    setModalError(''); setSubmitting(true)
    try {
      const res = await hostelAPI.approvePass(selected.id, remarks)
      if (!res?.success) { setModalError(res?.message || 'Failed to approve'); return }
      closeModal(); addNotification('Pass approved successfully', 'success'); fetchData()
    } catch (err) { setModalError(err.response?.data?.message || 'Failed to approve') }
    finally { setSubmitting(false) }
  }

  const handleReject = async () => {
    if (!remarks?.trim()) { setModalError('Remarks are required for rejection'); return }
    setModalError(''); setSubmitting(true)
    try {
      const res = await hostelAPI.rejectPass(selected.id, remarks)
      if (!res?.success) { setModalError(res?.message || 'Failed to reject'); return }
      closeModal(); addNotification('Pass rejected', 'success'); fetchData()
    } catch (err) { setModalError(err.response?.data?.message || 'Failed to reject') }
    finally { setSubmitting(false) }
  }

  const filteredStudents = students.filter(s =>
    s.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Reusable pending table — "View Details" opens the rich modal
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
              <th>Destination</th><th>Dates</th><th>Actions</th>
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
                <td><span className="text-sm text-slate-600">{pass.destination || '—'}</span></td>
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
                    <button onClick={() => openDetails(pass)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200">
                      View Details
                    </button>
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 text-sm mb-4">Today's Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Entries (IN)',      value: todayOverview.entriesIn,          color: 'text-emerald-600' },
                  { label: 'Exits (OUT)',        value: todayOverview.exitsOut,           color: 'text-orange-600' },
                  { label: 'Currently Outside', value: todayOverview.currentlyOutside,   color: 'text-violet-600' },
                  { label: 'Expected Returns',  value: todayOverview.expectedReturnsToday, color: 'text-blue-600' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className={`text-xl font-bold ${item.color}`}>{item.value || 0}</span>
                  </div>
                ))}
              </div>
            </div>
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
                        <button onClick={() => openDetails(pass)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200">
                          View Details
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

      {/* ── Rich Details / Approve / Reject Modal ── */}
      <Modal
        isOpen={!!selected}
        onClose={closeModal}
        title={
          view === 'approve' ? 'Approve Pass' :
          view === 'reject'  ? 'Reject Pass'  :
          'Gate Pass Details'
        }
        size="md"
        footer={
          view === 'details' ? (
            selected?.status === 'PENDING_HOSTEL' ? (
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 btn-secondary py-2.5">Close</button>
                <button onClick={() => { setView('reject'); setRemarks(''); setModalError('') }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors">
                  Reject
                </button>
                <button onClick={() => { setView('approve'); setRemarks(''); setModalError('') }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors">
                  Approve
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 btn-secondary py-2.5">Close</button>
              </div>
            )
          ) : view === 'approve' ? (
            <div className="flex gap-3">
              <button onClick={() => setView('details')} className="flex-1 btn-secondary py-2.5">Back</button>
              <button onClick={handleApprove} disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {submitting ? 'Approving...' : 'Confirm Approve'}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setView('details')} className="flex-1 btn-secondary py-2.5">Back</button>
              <button onClick={handleReject} disabled={submitting || !remarks?.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                {submitting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          )
        }
      >

        {selected && view === 'details' && (
          <div className="space-y-3">
            {selected.status && selected.status !== 'PENDING_HOSTEL' && (
              <div className={`p-3 rounded-xl border-2 ${selected.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                <StatusBadge status={selected.status} />
              </div>
            )}
            <Section title="Student Information">
              <DetailRow label="Full Name"    value={selected.Student?.User?.name} />
              <DetailRow label="USN"          value={selected.Student?.usn} />
              <DetailRow label="Department"   value={selected.Student?.Department?.name} />
              <DetailRow label="Program"      value={selected.Student?.program_type} />
              <DetailRow label="Year / Sem"   value={selected.Student?.year_of_study && selected.Student?.semester ? `Year ${selected.Student.year_of_study} — Sem ${selected.Student.semester}` : null} />
              <DetailRow label="Email"        value={selected.Student?.User?.email} />
              <DetailRow label="Phone"        value={selected.Student?.User?.phone} />
            </Section>
            <Section title="Hostel Information">
              <DetailRow label="Hostel"       value={selected.Student?.hostel_name} />
              <DetailRow label="Room No."     value={selected.Student?.room_number} />
              <DetailRow label="Parent Phone" value={selected.Student?.parent_phone || selected.parent_contact} />
            </Section>
            <Section title="Pass Details">
              <DetailRow label="Pass Type"    value={selected.pass_type === 'LONG_LEAVE' ? 'Long Leave' : 'Daily'} />
              <DetailRow label="Destination"  value={selected.destination} />
              <DetailRow label="Reason"       value={selected.reason} />
              {selected.pass_type === 'DAILY' ? (
                <>
                  <DetailRow label="Pass Date"   value={fmt(selected.pass_date)} />
                  <DetailRow label="Exit Time"   value={fmtTime(selected.exit_time)} />
                  <DetailRow label="Return Time" value={fmtTime(selected.expected_return_time)} />
                </>
              ) : (
                <>
                  <DetailRow label="Leaving Date"   value={fmt(selected.leaving_date || selected.from_date)} />
                  <DetailRow label="Returning Date" value={fmt(selected.returning_date || selected.to_date)} />
                  <DetailRow label="Parent Contact" value={selected.parent_contact || selected.Student?.parent_phone} />
                </>
              )}
              <DetailRow label="Applied On"   value={fmt(selected.createdAt)} />
            </Section>
          </div>
        )}

        {selected && view === 'approve' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              You are about to <strong>approve</strong> the pass for <strong>{selected.Student?.User?.name}</strong> ({selected.Student?.usn}).
            </div>
            {modalError && <p className="text-xs text-red-600">{modalError}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                placeholder="Add any remarks..." className="input-field resize-none" />
            </div>
          </div>
        )}

        {selected && view === 'reject' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              You are about to <strong>reject</strong> the pass for <strong>{selected.Student?.User?.name}</strong> ({selected.Student?.usn}).
            </div>
            {modalError && <p className="text-xs text-red-600">{modalError}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Remarks <span className="text-red-500">*</span></label>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                placeholder="Provide reason for rejection..."
                className={`input-field resize-none ${!remarks?.trim() && modalError ? 'border-red-400' : ''}`} />
              <p className="text-xs text-slate-400 mt-1">Required for rejection</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  )
}

export default Dashboard
