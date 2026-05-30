import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import API from '../../api/axios'

function AllPasses() {
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPasses()
  }, [])

  const fetchPasses = async () => {
    try {
      const response = await API.get('/passes')
      setPasses(response.data)
    } catch (error) {
      console.error('Failed to fetch passes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="hostel_staff" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">All Passes</h1>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">From Date</th>
                  <th className="px-6 py-3 text-left">To Date</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((pass) => (
                  <tr key={pass.id} className="border-t">
                    <td className="px-6 py-3">{pass.student_name}</td>
                    <td className="px-6 py-3">{pass.type}</td>
                    <td className="px-6 py-3">{pass.status}</td>
                    <td className="px-6 py-3">{pass.from_date}</td>
                    <td className="px-6 py-3">{pass.to_date}</td>
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

export default AllPasses
