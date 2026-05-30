import { sendSuccess, sendError } from '../utils/response.js'
import * as adminService from '../services/admin.service.js'

/**
 * Get dashboard statistics
 * GET /admin/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats()
    return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get all users with optional filtering
 * GET /admin/users?filter=ALL|STUDENT|COORDINATOR|HOSTEL_STAFF|SECURITY|ADMIN
 */
export const getAllUsers = async (req, res) => {
  try {
    const { filter = 'ALL' } = req.query

    // Validation: Valid filter
    const validFilters = ['ALL', 'STUDENT', 'COORDINATOR', 'HOSTEL_STAFF', 'SECURITY', 'ADMIN']
    if (!validFilters.includes(filter)) {
      return sendError(res, 'Invalid filter. Use: ALL, STUDENT, COORDINATOR, HOSTEL_STAFF, SECURITY, or ADMIN', 400)
    }

    const users = await adminService.getAllUsers(filter)
    return sendSuccess(res, users, 'Users retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get user by ID
 * GET /admin/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    // Validation: ID provided
    if (!id) {
      return sendError(res, 'User ID is required', 400)
    }

    const user = await adminService.getUserById(id)
    return sendSuccess(res, user, 'User retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Create new user (staff account)
 * POST /admin/users
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body

    // Validation: Required fields
    if (!name || !email || !password || !role) {
      return sendError(res, 'Name, email, password, and role are required', 400)
    }

    const user = await adminService.createUser({
      name,
      email,
      password,
      role,
      phone
    })

    return sendSuccess(res, user, 'User created successfully', 201)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Update user
 * PUT /admin/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone } = req.body

    // Validation: ID provided
    if (!id) {
      return sendError(res, 'User ID is required', 400)
    }

    const user = await adminService.updateUser(id, {
      name,
      email,
      phone
    })

    return sendSuccess(res, user, 'User updated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Activate user
 * PUT /admin/users/:id/activate
 */
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params

    // Validation: ID provided
    if (!id) {
      return sendError(res, 'User ID is required', 400)
    }

    const user = await adminService.activateUser(id)
    return sendSuccess(res, user, 'User activated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Deactivate user
 * PUT /admin/users/:id/deactivate
 */
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params

    // Validation: ID provided
    if (!id) {
      return sendError(res, 'User ID is required', 400)
    }

    const user = await adminService.deactivateUser(id)
    return sendSuccess(res, user, 'User deactivated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Reset user password
 * PUT /admin/users/:id/reset-password
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params

    // Validation: ID provided
    if (!id) {
      return sendError(res, 'User ID is required', 400)
    }

    const result = await adminService.resetUserPassword(id)
    return sendSuccess(res, result, 'Password reset successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get activity logs
 * GET /admin/activity-logs?limit=50
 */
export const getActivityLogs = async (req, res) => {
  try {
    const { limit = 50 } = req.query

    // Validation: Limit is a number
    const parsedLimit = parseInt(limit)
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
      return sendError(res, 'Limit must be a number between 1 and 500', 400)
    }

    const logs = await adminService.getActivityLogs(parsedLimit)
    return sendSuccess(res, logs, 'Activity logs retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export default {
  getDashboard,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
  getActivityLogs
}
