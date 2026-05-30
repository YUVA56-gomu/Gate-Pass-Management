import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { approvalAPI } from '../../api/approval.api'

function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await approvalAPI.getHistory()
      setHistory(response.data)
    } catch (error) {
      console.error('Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="coordinator" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Approval History</h1>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-6 py-3">{item.student_name}</td>
                    <td className="px-6 py-3">{item.status}</td>
                    <td className="px-6 py-3">{new Date(item.created_at).toLocaleDateString()}</td>
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

export default History
