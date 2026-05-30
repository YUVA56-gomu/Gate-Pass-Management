import axios from './axios'

/**
 * Get all notifications for current user
 * GET /notifications
 */
export const getNotifications = async (limit = 20, offset = 0, unreadOnly = false) => {
  try {
    const response = await axios.get('/notifications', {
      params: { limit, offset, unreadOnly }
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get notifications' }
  }
}

/**
 * Get unread notification count
 * GET /notifications/unread/count
 */
export const getUnreadCount = async () => {
  try {
    const response = await axios.get('/notifications/unread/count')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get unread count' }
  }
}

/**
 * Mark notification as read
 * PUT /notifications/:id/read
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`/notifications/${notificationId}/read`)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to mark notification as read' }
  }
}

/**
 * Mark all notifications as read
 * PUT /notifications/read-all
 */
export const markAllAsRead = async () => {
  try {
    const response = await axios.put('/notifications/read-all')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to mark all notifications as read' }
  }
}

/**
 * Delete a notification
 * DELETE /notifications/:id
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(`/notifications/${notificationId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete notification' }
  }
}

/**
 * Delete all notifications
 * DELETE /notifications
 */
export const deleteAllNotifications = async () => {
  try {
    const response = await axios.delete('/notifications')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to delete all notifications' }
  }
}

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
}
