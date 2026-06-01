import jsPDF from 'jspdf'
import { useState, useEffect } from 'react'
import { DashboardShell } from '../../components/layouts/DashboardShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatsCard } from '../../components/ui/StatsCard'
import {
  getOverallStats, getDepartmentStats, getMonthlyStats, getPassTypeStats,
  getSecurityStats, getCoordinatorStats, getHostelStaffStats,
  exportReportAsCSV, exportReportAsPDF
} from '../../api/report.api'

const TABS = [
  { id: 'overview',     label: 'Overview'     },
  { id: 'departments',  label: 'Departments'  },
  { id: 'monthly',      label: 'Monthly'      },
  { id: 'passTypes',    label: 'Pass Types'   },
  { id: 'security',     label: 'Security'     },
  { id: 'coordinators', label: 'Coordinators' },
  { id: 'hostelStaff',  label: 'Hostel Staff' },
]

function ReportTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Reports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [data, setData] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError(null)
        const fetchers = {
          overview:     getOverallStats,
          departments:  getDepartmentStats,
          monthly:      getMonthlyStats,
          passTypes:    getPassTypeStats,
          security:     getSecurityStats,
          coordinators: getCoordinatorStats,
          hostelStaff:  getHostelStaffStats,
        }
        const res = await fetchers[activeTab]()
        if (res.success) setData(prev => ({ ...prev, [activeTab]: res.data }))
        else setError(res.message)
      } catch (err) { setError(err.message || 'Failed to load report data') }
      finally { setLoading(false) }
    }
    load()
  }, [activeTab])

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t) }
  }, [success])

  const handleExportCSV = async () => {
    try { await exportReportAsCSV(activeTab); setSuccess('Report exported as CSV') }
    catch (err) { setError(err.message || 'Failed to export') }
  }

  const handleExportPDF = async () => {
    try {
      const res = await exportReportAsPDF(activeTab)
      if (!res.success) { setError(res.message); return }
      const doc = new jsPDF()
      doc.setFontSize(18); doc.text(`${activeTab.toUpperCase()} REPORT`, 20, 20)
      doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30)
      let y = 50
      const addContent = (d, indent = 0) => {
        if (Array.isArray(d)) { d.forEach((item, i) => { doc.text(`${i+1}.`, 20+indent, y); y+=8; addContent(item, indent+5) }) }
        else if (typeof d === 'object' && d !== null) {
          Object.entries(d).forEach(([k, v]) => {
            if (typeof v === 'object' && v !== null) { doc.text(`${k}:`, 20+indent, y); y+=8; addContent(v, indent+5) }
            else { doc.text(`${k}: ${v}`, 20+indent, y); y+=8 }
            if (y > 270) { doc.addPage(); y = 20 }
          })
        }
      }
      addContent(res.data.data)
      doc.save(`${activeTab}-report.pdf`)
      setSuccess('PDF exported successfully')
    } catch (err) { setError(err.message || 'Failed to export PDF') }
  }

  const d = data[activeTab]

  return (
    <DashboardShell>
      <PageHeader
        title="Reports & Analytics"
        subtitle="System statistics and performance metrics"
        actions={
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="btn-secondary text-sm py-2">
              Export CSV
            </button>
            <button onClick={handleExportPDF} className="btn-secondary text-sm py-2">
              Export PDF
            </button>
          </div>
        }
      />

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{success}</div>}

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-slate-200/80 p-1 flex-wrap shadow-sm">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="spinner" /></div>
        ) : !d ? (
          <div className="text-center py-12 text-slate-400 text-sm">No data available</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="font-bold text-slate-800">Overall System Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <h3 className="font-semibold text-slate-700 text-sm mb-2">Users</h3>
                    {[['Students', d.users?.totalStudents], ['Coordinators', d.users?.totalCoordinators], ['Hostel Staff', d.users?.totalHostelStaff], ['Security', d.users?.totalSecurityStaff]].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm py-1"><span className="text-slate-500">{l}</span><span className="font-bold text-slate-800">{v || 0}</span></div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <h3 className="font-semibold text-slate-700 text-sm mb-2">Passes</h3>
                    {[['Total', d.passes?.totalPasses], ['Approved', d.passes?.approvedPasses], ['Rejected', d.passes?.rejectedPasses], ['Pending', d.passes?.pendingPasses], ['Completed', d.passes?.completedPasses]].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm py-1"><span className="text-slate-500">{l}</span><span className="font-bold text-slate-800">{v || 0}</span></div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                    <h3 className="font-semibold text-slate-700 text-sm mb-2">Security</h3>
                    <div className="flex justify-between text-sm py-1"><span className="text-slate-500">Students Outside</span><span className="font-bold text-slate-800">{d.security?.studentsOutside || 0}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'departments' && d && (
              <div>
                <h2 className="font-bold text-slate-800 mb-4">Department-wise Statistics</h2>
                <ReportTable
                  headers={['Department', 'Students', 'Total Passes', 'Approved', 'Rejected']}
                  rows={d.map(dept => [dept.departmentName, dept.totalStudents, dept.totalPasses,
                    <span key="a" className="text-emerald-600 font-bold">{dept.approvedPasses}</span>,
                    <span key="r" className="text-red-600 font-bold">{dept.rejectedPasses}</span>
                  ])}
                />
              </div>
            )}

            {activeTab === 'monthly' && d && (
              <div>
                <h2 className="font-bold text-slate-800 mb-4">Monthly Statistics</h2>
                <ReportTable
                  headers={['Month', 'Total Passes', 'Approved', 'Rejected']}
                  rows={d.map(m => [m.month, m.totalPasses,
                    <span key="a" className="text-emerald-600 font-bold">{m.approvedPasses}</span>,
                    <span key="r" className="text-red-600 font-bold">{m.rejectedPasses}</span>
                  ])}
                />
              </div>
            )}

            {activeTab === 'passTypes' && d && (
              <div>
                <h2 className="font-bold text-slate-800 mb-4">Pass Type Statistics</h2>
                <ReportTable
                  headers={['Pass Type', 'Total', 'Approved', 'Rejected']}
                  rows={d.map(t => [<span key="t" className="font-bold">{t.passType}</span>, t.totalCount,
                    <span key="a" className="text-emerald-600 font-bold">{t.approvedCount}</span>,
                    <span key="r" className="text-red-600 font-bold">{t.rejectedCount}</span>
                  ])}
                />
              </div>
            )}

            {activeTab === 'security' && d && (
              <div className="space-y-5">
                <h2 className="font-bold text-slate-800">Security Statistics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatsCard label="OUT Scans Today" value={d.todayOutScans} color="orange" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>} />
                  <StatsCard label="IN Scans Today"  value={d.todayInScans}  color="emerald" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>} />
                  <StatsCard label="Completed"       value={d.completedPasses} color="blue" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                  <StatsCard label="Outside"         value={d.studentsOutside} color="amber" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                </div>
                {d.recentActivity?.length > 0 && (
                  <ReportTable
                    headers={['Student', 'USN', 'Pass Type', 'Action', 'Scanned By']}
                    rows={d.recentActivity.map(a => [a.studentName, a.studentUSN, a.passType,
                      <span key="act" className={`badge ${a.action === 'OUT' ? 'badge-warning' : 'badge-success'}`}>{a.action}</span>,
                      a.scannedBy
                    ])}
                  />
                )}
              </div>
            )}

            {activeTab === 'coordinators' && d && (
              <div>
                <h2 className="font-bold text-slate-800 mb-4">Coordinator Performance</h2>
                <ReportTable
                  headers={['Coordinator', 'Approvals', 'Rejections', 'Pending', 'Avg Time (min)']}
                  rows={d.map(c => [c.coordinatorName,
                    <span key="a" className="text-emerald-600 font-bold">{c.approvals}</span>,
                    <span key="r" className="text-red-600 font-bold">{c.rejections}</span>,
                    <span key="p" className="text-amber-600 font-bold">{c.pending}</span>,
                    c.avgProcessingTimeMinutes
                  ])}
                />
              </div>
            )}

            {activeTab === 'hostelStaff' && d && (
              <div>
                <h2 className="font-bold text-slate-800 mb-4">Hostel Staff Performance</h2>
                <ReportTable
                  headers={['Hostel Staff', 'Approvals', 'Rejections', 'Pending', 'Avg Time (min)']}
                  rows={d.map(s => [s.hostelStaffName,
                    <span key="a" className="text-emerald-600 font-bold">{s.approvals}</span>,
                    <span key="r" className="text-red-600 font-bold">{s.rejections}</span>,
                    <span key="p" className="text-amber-600 font-bold">{s.pending}</span>,
                    s.avgProcessingTimeMinutes
                  ])}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

export default Reports
