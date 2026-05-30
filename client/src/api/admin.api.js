import axios from './axios'

/**
 * Get dashboard statistics
 * GET /admin/dashboard
 */
export const getDashboardStats = async () => {
  try {
    const response = await axios.get('/admin/dashboard')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get dashboard statistics' }
  }
}

/**
 * Get all users with optional filtering
 * GET /admin/users?filter=ALL|STUDENT|COORDINATOR|HOSTEL_STAFF|SECURITY|ADMIN
 */
export const getAllUsers = async (filter = 'ALL') => {
  try {
    const response = await axios.get('/admin/users', {
      params: { filter }
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get users' }
  }
}

/**
 * Get user by ID
 * GET /admin/users/:id
 */
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/admin/users/${userId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get user' }
  }
}

/**
 * Create new user (staff account)
 * POST /admin/users
 */
export const createUser = async (userData) => {
  try {
    const response = await axios.post('/admin/users', userData)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create user' }
  }
}

/**
 * Update user
 * PUT /admin/users/:id
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`/admin/users/${userId}`, userData)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update user' }
  }
}

/**
 * Activate user
 * PUT /admin/users/:id/activate
 */
export const activateUser = async (userId) => {
  try {
    const response = await axios.put(`/admin/users/${userId}/activate`)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to activate user' }
  }
}

/**
 * Deactivate user
 * PUT /admin/users/:id/deactivate
 */
export const deactivateUser = async (userId) => {
  try {
    const response = await axios.put(`/admin/users/${userId}/deactivate`)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to deactivate user' }
  }
}

/**
 * Reset user password
 * PUT /admin/users/:id/reset-password
 */
export const resetUserPassword = async (userId) => {
  try {
    const response = await axios.put(`/admin/users/${userId}/reset-password`)
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to reset password' }
  }
}

/**
 * Get activity logs
 * GET /admin/activity-logs?limit=50
 */
export const getActivityLogs = async (limit = 50) => {
  try {
    const response = await axios.get('/admin/activity-logs', {
      params: { limit }
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get activity logs' }
  }
}

export default {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
  getActivityLogs
}
