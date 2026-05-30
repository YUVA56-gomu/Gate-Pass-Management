import { useEffect, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import API from '../../api/axios'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await API.get('/notifications')
      setNotifications(response.data)
    } catch (error) {
      console.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Notifications</h1>
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold">{notif.title}</h3>
                <p className="text-gray-600">{notif.message}</p>
                <small className="text-gray-400">{new Date(notif.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Notifications
