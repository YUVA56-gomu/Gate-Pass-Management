import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import { passAPI } from '../../api/pass.api'
import { useNotification } from '../../hooks/useNotification'

function MyPasses() {
  const [passes, setPasses] = useState([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  useEffect(() => {
    fetchPasses()
  }, [])

  const fetchPasses = async () => {
    try {
      const response = await passAPI.getMyPasses()
      setPasses(response.data)
    } catch (error) {
      addNotification('Failed to fetch passes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (id) => {
    try {
      const response = await passAPI.downloadPDF(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `pass-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
    } catch (error) {
      addNotification('Failed to download PDF', 'error')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">My Passes</h1>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">From Date</th>
                  <th className="px-6 py-3 text-left">To Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((pass) => (
                  <tr key={pass.id} className="border-t">
                    <td className="px-6 py-3">{pass.type}</td>
                    <td className="px-6 py-3">{pass.status}</td>
                    <td className="px-6 py-3">{pass.from_date}</td>
                    <td className="px-6 py-3">{pass.to_date}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDownloadPDF(pass.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Download PDF
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

export default MyPasses
