import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { reportAPI } from '../../api/report.api'

function Reports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await reportAPI.getDashboardStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Reports</h1>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-6 rounded shadow">
                <h2 className="text-lg font-semibold">Total Users</h2>
                <p className="text-3xl font-bold">{stats.total_users}</p>
              </div>
              <div className="bg-green-100 p-6 rounded shadow">
                <h2 className="text-lg font-semibold">Total Passes</h2>
                <p className="text-3xl font-bold">{stats.total_passes}</p>
              </div>
              <div className="bg-yellow-100 p-6 rounded shadow">
                <h2 className="text-lg font-semibold">Approved Passes</h2>
                <p className="text-3xl font-bold">{stats.approved_passes}</p>
              </div>
              <div className="bg-purple-100 p-6 rounded shadow">
                <h2 className="text-lg font-semibold">Total Scans</h2>
                <p className="text-3xl font-bold">{stats.total_scans}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Reports
