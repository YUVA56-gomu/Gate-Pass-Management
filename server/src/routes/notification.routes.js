import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import * as notificationController from '../controllers/notification.controller.js'

const router = express.Router()

/**
 * All notification routes require authentication
 */

/**
 * GET /notifications
 * Get all notifications for current user
 * Query params: limit, offset, unreadOnly
 */
router.get('/', authenticate, notificationController.getNotifications)

/**
 * GET /notifications/unread/count
 * Get unread notification count for current user
 */
router.get('/unread/count', authenticate, notificationController.getUnreadCount)

/**
 * PUT /notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticate, notificationController.markAsRead)

/**
 * PUT /notifications/read-all
 * Mark all notifications as read for current user
 */
router.put('/read-all', authenticate, notificationController.markAllAsRead)

/**
 * DELETE /notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticate, notificationController.deleteNotification)

/**
 * DELETE /notifications
 * Delete all notifications for current user
 */
router.delete('/', authenticate, notificationController.deleteAllNotifications)

export default router
