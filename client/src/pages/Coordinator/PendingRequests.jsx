import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { approvalAPI } from '../../api/approval.api'
import { useNotification } from '../../hooks/useNotification'

function PendingRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await approvalAPI.getPendingRequests()
      setRequests(response.data)
    } catch (error) {
      addNotification('Failed to fetch requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await approvalAPI.approveRequest(id, 'Approved by coordinator')
      addNotification('Request approved', 'success')
      fetchRequests()
    } catch (error) {
      addNotification('Failed to approve request', 'error')
    }
  }

  const handleReject = async (id) => {
    try {
      await approvalAPI.rejectRequest(id, 'Rejected by coordinator')
      addNotification('Request rejected', 'success')
      fetchRequests()
    } catch (error) {
      addNotification('Failed to reject request', 'error')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="coordinator" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Pending Requests</h1>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t">
                    <td className="px-6 py-3">{req.student_name}</td>
                    <td className="px-6 py-3">{req.pass_type}</td>
                    <td className="px-6 py-3">{req.reason}</td>
                    <td className="px-6 py-3 space-x-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </td>
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

export default PendingRequests
