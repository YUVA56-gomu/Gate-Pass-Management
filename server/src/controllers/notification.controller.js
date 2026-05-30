import { sendSuccess, sendError } from '../utils/response.js'
import * as notificationService from '../services/notification.service.js'

/**
 * Get all notifications for current user
 * GET /notifications
 * Correction 7: Added pagination validation
 * Correction 8: Standardized error handling
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 20, offset = 0, unreadOnly = false } = req.query

    // Correction 7: Validate pagination parameters
    const validLimit = Math.max(1, Math.min(parseInt(limit) || 20, 100))
    const validOffset = Math.max(0, parseInt(offset) || 0)

    const notifications = await notificationService.getUserNotifications(userId, {
      limit: validLimit,
      offset: validOffset,
      unreadOnly: unreadOnly === 'true'
    })

    return sendSuccess(res, notifications, 'Notifications retrieved successfully', 200)
  } catch (error) {
    // Correction 8: Standardized error handling
    return sendError(res, error.message, 400)
  }
}

/**
 * Get unread notification count for current user
 * GET /notifications/unread/count
 * Correction 8: Standardized error handling
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id

    const count = await notificationService.getUnreadCount(userId)

    return sendSuccess(res, { unreadCount: count }, 'Unread count retrieved successfully', 200)
  } catch (error) {
    // Correction 8: Standardized error handling
    return sendError(res, error.message, 400)
  }
}

/**
 * Mark notification as read
 * PUT /notifications/:id/read
 * Correction 1: Fixed security - verify ownership BEFORE marking as read
 * Correction 3: Pass userId to service for ownership validation
 * Correction 8: Standardized error handling
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Correction 1 & 3: Pass userId to service for ownership validation
    const notification = await notificationService.markAsRead(id, userId)

    return sendSuccess(res, notification, 'Notification marked as read', 200)
  } catch (error) {
    // Correction 8: Standardized error handling
    if (error.message === 'Notification not found') {
      return sendError(res, 'Notification not found', 404)
    }
    if (error.message === 'Unauthorized') {
      return sendError(res, 'Unauthorized', 403)
    }
    return sendError(res, error.message, 400)
  }
}

/**
 * Mark all notifications as read for current user
 * PUT /notifications/read-all
 * Correction 8: Standardized error handling
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    const count = await notificationService.markAllAsRead(userId)

    return sendSuccess(res, { updatedCount: count }, 'All notifications marked as read', 200)
  } catch (error) {
    // Correction 8: Standardized error handling
    return sendError(res, error.message, 400)
  }
}

/**
 * Delete a notification
 * DELETE /notifications/:id
 * Correction 2: Fixed security - verify ownership BEFORE deleting
 * Correction 3: Pass userId to service for ownership validation
 * Correction 8: Standardized error handling
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Correction 2 & 3: Pass userId to service for ownership validation
    const result = await notificationService.deleteNotification(id, userId)

    if (!result) {
      return sendError(res, 'Notification not found', 404)
    }

    return sendSuccess(res, { deleted: true }, 'Notification deleted successfully', 200)
  } catch (error) {
    // Correction 8: Standardized error handling
    if (error.message === 'Notification not found') {
      return sendError(res, 'Notification not found', 404)
    }
    if (error.message === 'Unauthorized') {
      return sendError(res, 'Unauthorized', 403)
    }
    return sendError(res, error.message, 400)
  }
}

/**
 * Delete all notifications for current user
 * DELETE /notifications
 * Correction 8: Standardized error handling
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    const count = await notificationService.deleteAllNotifications(userId)

    return sendSuccess(res, { deletedCount: count }, 'All notifications deleted successfully', 200)
  } catch (error) {
    // Correction 8: Standardized error handling
    return sendError(res, error.message, 400)
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
