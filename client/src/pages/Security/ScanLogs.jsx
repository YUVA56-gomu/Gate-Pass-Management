import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { securityAPI } from '../../api/security.api'

function ScanLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await securityAPI.getScanLogs()
      setLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="security" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Scan Logs</h1>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Action</th>
                  <th className="px-6 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="px-6 py-3">{log.student_name}</td>
                    <td className="px-6 py-3">{log.action}</td>
                    <td className="px-6 py-3">{new Date(log.scanned_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ScanLogs
