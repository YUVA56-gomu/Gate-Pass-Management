import * as authService from '../services/auth.service.js'
import { sendSuccess, sendError } from '../utils/response.js'

/**
 * Register new student
 * POST /auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    const result = await authService.registerStudent({
      name,
      email,
      password,
      phone
    })

    return sendSuccess(res, result, 'Student registered successfully', 201)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Login user
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await authService.login(email, password)

    return sendSuccess(res, result, 'Login successful', 200)
  } catch (error) {
    return sendError(res, error.message, 401)
  }
}

/**
 * Get current user
 * GET /auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await authService.getCurrentUser(userId)

    return sendSuccess(res, user, 'User retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 404)
  }
}

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = async (req, res) => {
  try {
    // Token is invalidated on client side
    // Server doesn't maintain token blacklist in this implementation
    return sendSuccess(res, { message: 'Logout successful' }, 'Logout successful', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Change password
 * POST /auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id
    const { oldPassword, newPassword } = req.body

    const result = await authService.changePassword(userId, oldPassword, newPassword)

    return sendSuccess(res, result, 'Password changed successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Create user (Admin only)
 * POST /auth/users
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body

    const user = await authService.createUser({
      name,
      email,
      password,
      phone,
      role
    })

    return sendSuccess(res, user, 'User created successfully', 201)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get all users (Admin only)
 * GET /auth/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { User } = await import('../models/index.js')

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    })

    return sendSuccess(res, users, 'Users retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 500)
  }
}

/**
 * Get user by ID (Admin only)
 * GET /auth/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const { User, Student } = await import('../models/index.js')

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Student,
          attributes: [
            'id',
            'usn',
            'program_type',
            'year_of_study',
            'semester',
            'gender',
            'hostel_name',
            'hostel_type',
            'room_number',
            'parent_phone',
            'emergency_contact'
          ]
        }
      ]
    })

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    return sendSuccess(res, user, 'User retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 500)
  }
}

/**
 * Update user (Admin only)
 * PUT /auth/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, is_active, role } = req.body

    const user = await authService.updateUser(id, {
      name,
      phone,
      is_active,
      role
    })

    return sendSuccess(res, user, 'User updated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Deactivate user (Admin only)
 * POST /auth/users/:id/deactivate
 */
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params

    const result = await authService.deactivateUser(id)

    return sendSuccess(res, result, 'User deactivated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Activate user (Admin only)
 * POST /auth/users/:id/activate
 */
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params

    const result = await authService.activateUser(id)

    return sendSuccess(res, result, 'User activated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export default {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser
}
