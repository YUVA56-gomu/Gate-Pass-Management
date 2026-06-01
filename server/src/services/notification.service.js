import { User, Notification, Pass, Student } from '../models/index.js'

/**
 * Notification Types ENUM
 * Used for creating different types of notifications
 * Correction 4: Standardized to use singular form (NEW_REQUEST instead of NEW_REQUESTS)
 */
export const NOTIFICATION_TYPES = {
  PASS_SUBMITTED: 'PASS_SUBMITTED',
  COORDINATOR_APPROVED: 'COORDINATOR_APPROVED',
  COORDINATOR_REJECTED: 'COORDINATOR_REJECTED',
  HOSTEL_APPROVED: 'HOSTEL_APPROVED',
  HOSTEL_REJECTED: 'HOSTEL_REJECTED',
  QR_GENERATED: 'QR_GENERATED',
  PASS_COMPLETED: 'PASS_COMPLETED',
  NEW_REQUEST: 'NEW_REQUEST',
  SYSTEM: 'SYSTEM'
}

/**
 * Create a notification for a user
 * @param {number} userId - User ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {number} relatedPassId - Related pass ID (optional)
 * @returns {Promise<Notification>}
 * Correction 5: Added validation for related_pass_id to avoid orphan references
 * Correction 6: Ensures read_at is null for new notifications
 */
export const createNotification = async (userId, type, title, message, relatedPassId = null) => {
  try {
    // Validate related pass if provided
    if (relatedPassId) {
      const pass = await Pass.findByPk(relatedPassId)
      if (!pass) {
        throw new Error('Related pass not found')
      }
    }

    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      related_pass_id: relatedPassId,
      is_read: false,
      read_at: null // Correction 6: Explicitly set to null for unread notifications
    })

    return notification
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }
}

/**
 * Get all notifications for a user
 * @param {number} userId - User ID
 * @param {object} options - Query options (limit, offset, unreadOnly)
 * @returns {Promise<Array>}
 * Correction 7: Added pagination validation to prevent negative values
 */
export const getUserNotifications = async (userId, options = {}) => {
  try {
    // Correction 7: Validate and sanitize pagination parameters
    let { limit = 20, offset = 0, unreadOnly = false } = options
    
    // Ensure limit and offset are positive integers
    limit = Math.max(1, Math.min(parseInt(limit) || 20, 100)) // Max 100 per request
    offset = Math.max(0, parseInt(offset) || 0)

    const where = { user_id: userId }
    if (unreadOnly) {
      where.is_read = false
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: Pass,
          attributes: ['id', 'pass_type', 'status', 'from_date', 'to_date'],
          as: 'relatedPass'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return notifications
  } catch (error) {
    throw new Error(`Failed to retrieve notifications: ${error.message}`)
  }
}

/**
 * Get unread notification count for a user
 * @param {number} userId - User ID
 * @returns {Promise<number>}
 */
export const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    })

    return count
  } catch (error) {
    throw new Error(`Failed to get unread count: ${error.message}`)
  }
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<Notification>}
 * Correction 1: Fixed security issue - verify ownership BEFORE marking as read
 * Correction 3: Added ownership validation in service layer (defense-in-depth)
 * Correction 6: Ensures read_at is set only when marking as read
 */
export const markAsRead = async (notificationId, userId) => {
  try {
    // Correction 1 & 3: Fetch notification first
    const notification = await Notification.findByPk(notificationId)

    // Correction 1 & 3: Verify notification exists
    if (!notification) {
      throw new Error('Notification not found')
    }

    // Correction 3: Verify ownership in service layer (defense-in-depth)
    if (notification.user_id !== userId) {
      throw new Error('Unauthorized')
    }

    // Correction 6: Set read_at timestamp when marking as read
    notification.is_read = true
    notification.read_at = new Date()
    await notification.save()

    return notification
  } catch (error) {
    throw new Error(`Failed to update notification: ${error.message}`)
  }
}

/**
 * Mark all notifications as read for a user
 * @param {number} userId - User ID
 * @returns {Promise<number>} - Number of notifications updated
 */
export const markAllAsRead = async (userId) => {
  try {
    const [count] = await Notification.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          user_id: userId,
          is_read: false
        }
      }
    )

    return count
  } catch (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`)
  }
}

/**
 * Delete a notification
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID (for ownership validation)
 * @returns {Promise<boolean>}
 * Correction 2: Fixed security issue - verify ownership BEFORE deleting
 * Correction 3: Added ownership validation in service layer (defense-in-depth)
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    // Correction 2 & 3: Fetch notification first
    const notification = await Notification.findByPk(notificationId)

    // Correction 2 & 3: Verify notification exists
    if (!notification) {
      throw new Error('Notification not found')
    }

    // Correction 3: Verify ownership in service layer (defense-in-depth)
    if (notification.user_id !== userId) {
      throw new Error('Unauthorized')
    }

    // Correction 2: Delete only after ownership verified
    const result = await Notification.destroy({
      where: { id: notificationId }
    })

    return result > 0
  } catch (error) {
    throw new Error(`Failed to delete notification: ${error.message}`)
  }
}

/**
 * Delete all notifications for a user
 * @param {number} userId - User ID
 * @returns {Promise<number>} - Number of notifications deleted
 */
export const deleteAllNotifications = async (userId) => {
  try {
    const count = await Notification.destroy({
      where: { user_id: userId }
    })

    return count
  } catch (error) {
    throw new Error(`Failed to delete all notifications: ${error.message}`)
  }
}

/**
 * Notify student when pass is submitted
 * @param {number} studentId - Student ID
 * @param {number} passId - Pass ID
 * @returns {Promise<Notification>}
 */
export const notifyPassSubmitted = async (studentId, passId) => {
  try {
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, attributes: ['id'] }]
    })

    if (!student) {
      throw new Error('Student not found')
    }

    return await createNotification(
      student.User.id,
      NOTIFICATION_TYPES.PASS_SUBMITTED,
      'Pass Submitted',
      'Your pass request has been submitted successfully.',
      passId
    )
  } catch (error) {
    throw new Error(`Failed to notify pass submitted: ${error.message}`)
  }
}

/**
 * Notify student when coordinator approves pass
 * @param {number} studentId - Student ID
 * @param {number} passId - Pass ID
 * @returns {Promise<Notification>}
 */
export const notifyCoordinatorApproved = async (studentId, passId) => {
  try {
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, attributes: ['id'] }]
    })

    if (!student) {
      throw new Error('Student not found')
    }

    return await createNotification(
      student.User.id,
      NOTIFICATION_TYPES.COORDINATOR_APPROVED,
      'Coordinator Approved',
      'Your pass request has been approved by the coordinator.',
      passId
    )
  } catch (error) {
    throw new Error(`Failed to notify coordinator approved: ${error.message}`)
  }
}

/**
 * Notify student when coordinator rejects pass
 * @param {number} studentId - Student ID
 * @param {number} passId - Pass ID
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Notification>}
 */
export const notifyCoordinatorRejected = async (studentId, passId, rejectionReason = '') => {
  try {
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, attributes: ['id'] }]
    })

    if (!student) {
      throw new Error('Student not found')
    }

    const message = rejectionReason
      ? `Your pass request has been rejected by the coordinator. Reason: ${rejectionReason}`
      : 'Your pass request has been rejected by the coordinator.'

    return await createNotification(
      student.User.id,
      NOTIFICATION_TYPES.COORDINATOR_REJECTED,
      'Coordinator Rejected',
      message,
      passId
    )
  } catch (error) {
    throw new Error(`Failed to notify coordinator rejected: ${error.message}`)
  }
}

/**
 * Notify student when hostel staff approves pass
 * @param {number} studentId - Student ID
 * @param {number} passId - Pass ID
 * @returns {Promise<Notification>}
 */
export const notifyHostelApproved = async (studentId, passId) => {
  try {
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, attributes: ['id'] }]
    })

    if (!student) {
      throw new Error('Student not found')
    }

    return await createNotification(
      student.User.id,
      NOTIFICATION_TYPES.HOSTEL_APPROVED,
      'Pass Approved',
      'Your pass request has been approved by hostel staff.',
      passId
    )
  } catch (error) {
    throw new Error(`Failed to notify hostel approved: ${error.message}`)
  }
}

/**
 * Notify student when hostel staff rejects pass
 * @param {number} studentId - Student ID
 * @param {number} passId - Pass ID
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Notification>}
 */
export const notifyHostelRejected = async (studentId, passId, rejectionReason = '') => {
  try {
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, attributes: ['id'] }]
    })

    if (!student) {
      throw new Error('Student not found')
    }

    const message = rejectionReason
      ? `Your pass request has been rejected by hostel staff. Reason: ${rejectionReason}`
      : 'Your pass request has been rejected by hostel staff.'

    return await createNotification(
      student.User.id,
      NOTIFICATION_TYPES.HOSTEL_REJECTED,
      'Pass Rejected',
      message,
      passId
    )
  } catch (error) {
    throw new Error(`Failed to notify hostel rejected: ${error.message}`)
  }
}

/**
 * Notify student when QR code is generated
 * @param {number} studentId - Student ID
 * @param {number} passId - Pass ID
 * @returns {Promise<Notification>}
 */
export const notifyQRGenerated = async (studentId, passId) => {
  try {
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, attributes: ['id'] }]
    })

    if (!student) {
      throw new Error('Student not found')
    }

    return await createNotification(
      student.User.id,
      NOTIFICATION_TYPES.QR_GENERATED,
      'QR Generated',
      'Your gate pass QR code is ready.',
      passId
    )
  } catch (error) {
    throw new Error(`Failed to notify QR generated: ${error.message}`)
  }
}

/**
 * Notify student when pass is completed
 * @param {number} studentId - Student ID
 * @param {number} passId - Pass ID
 * @returns {Promise<Notification>}
 */
export const notifyPassCompleted = async (studentId, passId) => {
  try {
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, attributes: ['id'] }]
    })

    if (!student) {
      throw new Error('Student not found')
    }

    return await createNotification(
      student.User.id,
      NOTIFICATION_TYPES.PASS_COMPLETED,
      'Pass Completed',
      'Your gate pass journey has been completed successfully.',
      passId
    )
  } catch (error) {
    throw new Error(`Failed to notify pass completed: ${error.message}`)
  }
}

/**
 * Notify coordinators about new pending requests
 * @param {number} passId - Pass ID
 * @returns {Promise<Array>}
 * Correction 4: Updated to use NEW_REQUEST (singular) instead of NEW_REQUESTS
 */
export const notifyNewCoordinatorRequests = async (passId) => {
  try {
    const coordinators = await User.findAll({
      where: { role: 'COORDINATOR' },
      attributes: ['id']
    })

    const notifications = await Promise.all(
      coordinators.map(coordinator =>
        createNotification(
          coordinator.id,
          NOTIFICATION_TYPES.NEW_REQUEST,
          'New Request',
          'A new pass request is pending your approval.',
          passId
        )
      )
    )

    return notifications
  } catch (error) {
    throw new Error(`Failed to notify new coordinator requests: ${error.message}`)
  }
}

/**
 * Notify hostel staff about new pending requests
 * @param {number} passId - Pass ID
 * @returns {Promise<Array>}
 * Correction 4: Updated to use NEW_REQUEST (singular) instead of NEW_REQUESTS
 */
export const notifyNewHostelRequests = async (passId) => {
  try {
    const hostelStaff = await User.findAll({
      where: { role: 'HOSTEL_STAFF' },
      attributes: ['id']
    })

    const notifications = await Promise.all(
      hostelStaff.map(staff =>
        createNotification(
          staff.id,
          NOTIFICATION_TYPES.NEW_REQUEST,
          'New Request',
          'A new pass request is pending your approval.',
          passId
        )
      )
    )

    return notifications
  } catch (error) {
    throw new Error(`Failed to notify new hostel requests: ${error.message}`)
  }
}

/**
 * Send system notification to all users
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<Array>}
 */
export const sendSystemNotification = async (title, message) => {
  try {
    const users = await User.findAll({
      attributes: ['id']
    })

    const notifications = await Promise.all(
      users.map(user =>
        createNotification(
          user.id,
          NOTIFICATION_TYPES.SYSTEM,
          title,
          message
        )
      )
    )

    return notifications
  } catch (error) {
    throw new Error(`Failed to send system notification: ${error.message}`)
  }
}

export default {
  NOTIFICATION_TYPES,
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  notifyPassSubmitted,
  notifyCoordinatorApproved,
  notifyCoordinatorRejected,
  notifyHostelApproved,
  notifyHostelRejected,
  notifyQRGenerated,
  notifyPassCompleted,
  notifyNewCoordinatorRequests,
  notifyNewHostelRequests,
  sendSystemNotification
}
