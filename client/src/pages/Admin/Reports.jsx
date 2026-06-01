import jsPDF from'jspdf'
import { useState, useEffect } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import Notification from '../../components/common/Notification'
import {
  getOverallStats,
  getDepartmentStats,
  getMonthlyStats,
  getPassTypeStats,
  getSecurityStats,
  getCoordinatorStats,
  getHostelStaffStats,
  exportReportAsCSV,
  exportReportAsPDF
} from '../../api/report.api'

function Reports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Data states
  const [overallStats, setOverallStats] = useState(null)
  const [departmentStats, setDepartmentStats] = useState(null)
  const [monthlyStats, setMonthlyStats] = useState(null)
  const [passTypeStats, setPassTypeStats] = useState(null)
  const [securityStats, setSecurityStats] = useState(null)
  const [coordinatorStats, setCoordinatorStats] = useState(null)
  const [hostelStaffStats, setHostelStaffStats] = useState(null)

  useEffect(() => {
    loadReportData()
  }, [activeTab])

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      switch (activeTab) {
        case 'overview':
          const overallResponse = await getOverallStats()
          if (overallResponse.success) {
            setOverallStats(overallResponse.data)
          } else {
            setError(overallResponse.message)
          }
          break

        case 'departments':
          const deptResponse = await getDepartmentStats()
          if (deptResponse.success) {
            setDepartmentStats(deptResponse.data)
          } else {
            setError(deptResponse.message)
          }
          break

        case 'monthly':
          const monthlyResponse = await getMonthlyStats()
          if (monthlyResponse.success) {
            setMonthlyStats(monthlyResponse.data)
          } else {
            setError(monthlyResponse.message)
          }
          break

        case 'passTypes':
          const passTypeResponse = await getPassTypeStats()
          if (passTypeResponse.success) {
            setPassTypeStats(passTypeResponse.data)
          } else {
            setError(passTypeResponse.message)
          }
          break

        case 'security':
          const securityResponse = await getSecurityStats()
          if (securityResponse.success) {
            setSecurityStats(securityResponse.data)
          } else {
            setError(securityResponse.message)
          }
          break

        case 'coordinators':
          const coordResponse = await getCoordinatorStats()
          if (coordResponse.success) {
            setCoordinatorStats(coordResponse.data)
          } else {
            setError(coordResponse.message)
          }
          break

        case 'hostelStaff':
          const hostelResponse = await getHostelStaffStats()
          if (hostelResponse.success) {
            setHostelStaffStats(hostelResponse.data)
          } else {
            setError(hostelResponse.message)
          }
          break

        default:
          break
      }
    } catch (err) {
      setError(err.message || 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      setError(null)
      setSuccess(null)
      await exportReportAsCSV(activeTab)
      setSuccess('Report exported as CSV successfully')
    } catch (err) {
      setError(err.message || 'Failed to export report')
    }
  }

  const handleExportPDF = async () => {
  try {
    setError(null)
    setSuccess(null)

    const response = await exportReportAsPDF(activeTab)

    if (!response.success) {
      setError(response.message)
      return
    }

    const report = response.data

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(`${activeTab.toUpperCase()} REPORT`, 20, 20)

    doc.setFontSize(10)
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      20,
      30
    )

    let y = 50

    const addContent = (data, indent = 0) => {
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          doc.text(`${index + 1}.`, 20 + indent, y)
          y += 8
          addContent(item, indent + 5)
        })
      } else if (
        typeof data === 'object' &&
        data !== null
      ) {
        Object.entries(data).forEach(([key, value]) => {
          if (
            typeof value === 'object' &&
            value !== null
          ) {
            doc.text(
              `${key}:`,
              20 + indent,
              y
            )
            y += 8
            addContent(value, indent + 5)
          } else {
            doc.text(
              `${key}: ${value}`,
              20 + indent,
              y
            )
            y += 8
          }

          // Prevent page overflow
          if (y > 270) {
            doc.addPage()
            y = 20
          }
        })
      }
    }

    addContent(report.data)

    doc.save(`${activeTab}-report.pdf`)

    setSuccess('PDF exported successfully')
  } catch (err) {
    console.error(err)
    setError(
      err.message ||
        'Failed to export report as PDF'
    )
  }
}
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          {error && <Notification type="error" message={error} />}
          {success && <Notification type="success" message={success} />}

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">System statistics and performance metrics</p>
          </div>

          {/* Export Buttons */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Export as CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Export as PDF
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 flex gap-2 flex-wrap bg-white rounded-lg shadow p-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'departments', label: 'Departments' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'passTypes', label: 'Pass Types' },
              { id: 'security', label: 'Security' },
              { id: 'coordinators', label: 'Coordinators' },
              { id: 'hostelStaff', label: 'Hostel Staff' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded font-medium transition duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading report data...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && overallStats && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Overall System Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-2">Users</h3>
                      <div className="space-y-1 text-sm">
                        <p>Students: <span className="font-bold">{overallStats.users.totalStudents}</span></p>
                        <p>Coordinators: <span className="font-bold">{overallStats.users.totalCoordinators}</span></p>
                        <p>Hostel Staff: <span className="font-bold">{overallStats.users.totalHostelStaff}</span></p>
                        <p>Security Staff: <span className="font-bold">{overallStats.users.totalSecurityStaff}</span></p>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-2">Passes</h3>
                      <div className="space-y-1 text-sm">
                        <p>Total: <span className="font-bold">{overallStats.passes.totalPasses}</span></p>
                        <p>Approved: <span className="font-bold">{overallStats.passes.approvedPasses}</span></p>
                        <p>Rejected: <span className="font-bold">{overallStats.passes.rejectedPasses}</span></p>
                        <p>Pending: <span className="font-bold">{overallStats.passes.pendingPasses}</span></p>
                        <p>Completed: <span className="font-bold">{overallStats.passes.completedPasses}</span></p>
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-800 mb-2">Security</h3>
                      <div className="space-y-1 text-sm">
                        <p>Students Outside: <span className="font-bold">{overallStats.security.studentsOutside}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Departments Tab */}
              {activeTab === 'departments' && departmentStats && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Department-wise Statistics</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Department</th>
                          <th className="px-4 py-2 text-left">Students</th>
                          <th className="px-4 py-2 text-left">Total Passes</th>
                          <th className="px-4 py-2 text-left">Approved</th>
                          <th className="px-4 py-2 text-left">Rejected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentStats.map((dept, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{dept.departmentName}</td>
                            <td className="px-4 py-2">{dept.totalStudents}</td>
                            <td className="px-4 py-2">{dept.totalPasses}</td>
                            <td className="px-4 py-2 text-green-600 font-bold">{dept.approvedPasses}</td>
                            <td className="px-4 py-2 text-red-600 font-bold">{dept.rejectedPasses}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Monthly Tab */}
              {activeTab === 'monthly' && monthlyStats && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Monthly Statistics</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Month</th>
                          <th className="px-4 py-2 text-left">Total Passes</th>
                          <th className="px-4 py-2 text-left">Approved</th>
                          <th className="px-4 py-2 text-left">Rejected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyStats.map((month, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{month.month}</td>
                            <td className="px-4 py-2">{month.totalPasses}</td>
                            <td className="px-4 py-2 text-green-600 font-bold">{month.approvedPasses}</td>
                            <td className="px-4 py-2 text-red-600 font-bold">{month.rejectedPasses}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pass Types Tab */}
              {activeTab === 'passTypes' && passTypeStats && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Pass Type Statistics</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Pass Type</th>
                          <th className="px-4 py-2 text-left">Total</th>
                          <th className="px-4 py-2 text-left">Approved</th>
                          <th className="px-4 py-2 text-left">Rejected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passTypeStats.map((type, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2 font-bold">{type.passType}</td>
                            <td className="px-4 py-2">{type.totalCount}</td>
                            <td className="px-4 py-2 text-green-600 font-bold">{type.approvedCount}</td>
                            <td className="px-4 py-2 text-red-600 font-bold">{type.rejectedCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && securityStats && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Security Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-600">Today's OUT Scans</p>
                      <p className="text-3xl font-bold text-blue-600">{securityStats.todayOutScans}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600">Today's IN Scans</p>
                      <p className="text-3xl font-bold text-green-600">{securityStats.todayInScans}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-600">Completed Passes</p>
                      <p className="text-3xl font-bold text-purple-600">{securityStats.completedPasses}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-gray-600">Students Outside</p>
                      <p className="text-3xl font-bold text-orange-600">{securityStats.studentsOutside}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Recent Activity</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Student</th>
                          <th className="px-4 py-2 text-left">USN</th>
                          <th className="px-4 py-2 text-left">Pass Type</th>
                          <th className="px-4 py-2 text-left">Action</th>
                          <th className="px-4 py-2 text-left">Scanned By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityStats.recentActivity.map((activity, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{activity.studentName}</td>
                            <td className="px-4 py-2">{activity.studentUSN}</td>
                            <td className="px-4 py-2">{activity.passType}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                activity.action === 'OUT' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {activity.action}
                              </span>
                            </td>
                            <td className="px-4 py-2">{activity.scannedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Coordinators Tab */}
              {activeTab === 'coordinators' && coordinatorStats && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Coordinator Performance</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Coordinator</th>
                          <th className="px-4 py-2 text-left">Approvals</th>
                          <th className="px-4 py-2 text-left">Rejections</th>
                          <th className="px-4 py-2 text-left">Pending</th>
                          <th className="px-4 py-2 text-left">Avg Time (min)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coordinatorStats.map((coord, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{coord.coordinatorName}</td>
                            <td className="px-4 py-2 text-green-600 font-bold">{coord.approvals}</td>
                            <td className="px-4 py-2 text-red-600 font-bold">{coord.rejections}</td>
                            <td className="px-4 py-2 text-orange-600 font-bold">{coord.pending}</td>
                            <td className="px-4 py-2">{coord.avgProcessingTimeMinutes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Hostel Staff Tab */}
              {activeTab === 'hostelStaff' && hostelStaffStats && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Hostel Staff Performance</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Hostel Staff</th>
                          <th className="px-4 py-2 text-left">Approvals</th>
                          <th className="px-4 py-2 text-left">Rejections</th>
                          <th className="px-4 py-2 text-left">Pending</th>
                          <th className="px-4 py-2 text-left">Avg Time (min)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hostelStaffStats.map((staff, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{staff.hostelStaffName}</td>
                            <td className="px-4 py-2 text-green-600 font-bold">{staff.approvals}</td>
                            <td className="px-4 py-2 text-red-600 font-bold">{staff.rejections}</td>
                            <td className="px-4 py-2 text-orange-600 font-bold">{staff.pending}</td>
                            <td className="px-4 py-2">{staff.avgProcessingTimeMinutes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
