import { useState, useEffect } from 'react'
import Navbar from '../../components/common/Navbar'
import Sidebar from '../../components/common/Sidebar'
import Notification from '../../components/common/Notification'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../../api/notification.api'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [filter, setFilter] = useState('all') // all, unread
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  // Correction 10: Auto-refresh every 60 seconds
  useEffect(() => {
    loadNotifications()
    loadUnreadCount()

    // Set up auto-refresh interval
    const refreshInterval = setInterval(() => {
      loadNotifications()
      loadUnreadCount()
    }, 60000) // 60 seconds

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval)
  }, [filter, offset])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getNotifications(limit, offset, filter === 'unread')
      if (response.success) {
        setNotifications(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount()
      if (response.success) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (err) {
      console.error('Failed to load unread count:', err)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      setError(null)
      const response = await markAsRead(notificationId)
      if (response.success) {
        setSuccess('Notification marked as read')
        loadNotifications()
        loadUnreadCount()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err.message || 'Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setError(null)
      const response = await markAllAsRead()
      if (response.success) {
        setSuccess('All notifications marked as read')
        loadNotifications()
        loadUnreadCount()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err.message || 'Failed to mark all notifications as read')
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      setError(null)
      const response = await deleteNotification(notificationId)
      if (response.success) {
        setSuccess('Notification deleted')
        loadNotifications()
        loadUnreadCount()
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete notification')
    }
  }

  const handleDeleteAllNotifications = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        setError(null)
        const response = await deleteAllNotifications()
        if (response.success) {
          setSuccess('All notifications deleted')
          loadNotifications()
          loadUnreadCount()
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError(err.message || 'Failed to delete all notifications')
      }
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PASS_SUBMITTED':
        return '📝'
      case 'COORDINATOR_APPROVED':
      case 'HOSTEL_APPROVED':
        return '✅'
      case 'COORDINATOR_REJECTED':
      case 'HOSTEL_REJECTED':
        return '❌'
      case 'QR_GENERATED':
        return '📱'
      case 'PASS_COMPLETED':
        return '🎉'
      case 'NEW_REQUEST':
        return '📬'
      case 'SYSTEM':
        return 'ℹ️'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'PASS_SUBMITTED':
        return 'bg-blue-50 border-blue-200'
      case 'COORDINATOR_APPROVED':
      case 'HOSTEL_APPROVED':
        return 'bg-green-50 border-green-200'
      case 'COORDINATOR_REJECTED':
      case 'HOSTEL_REJECTED':
        return 'bg-red-50 border-red-200'
      case 'QR_GENERATED':
        return 'bg-purple-50 border-purple-200'
      case 'PASS_COMPLETED':
        return 'bg-yellow-50 border-yellow-200'
      case 'NEW_REQUEST':
        return 'bg-orange-50 border-orange-200'
      case 'SYSTEM':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto p-6">
          {error && <Notification type="error" message={error} />}
          {success && <Notification type="success" message={success} />}

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                <p className="text-gray-600 mt-2">
                  You have <span className="font-bold text-blue-600">{unreadCount}</span> unread notifications
                </p>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Mark All as Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAllNotifications}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Delete All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 bg-white rounded-lg shadow p-2">
            <button
              onClick={() => {
                setFilter('all')
                setOffset(0)
              }}
              className={`px-4 py-2 rounded font-medium transition duration-200 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => {
                setFilter('unread')
                setOffset(0)
              }}
              className={`px-4 py-2 rounded font-medium transition duration-200 ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg">No notifications yet</p>
              <p className="text-gray-500 mt-2">You'll see notifications here when you have updates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-lg p-4 flex justify-between items-start ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <h3 className="font-bold text-gray-800">{notification.title}</h3>
                      {!notification.is_read && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {notifications.length > 0 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={notifications.length < limit}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
