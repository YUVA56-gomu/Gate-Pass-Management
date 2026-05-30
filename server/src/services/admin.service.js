import { Op } from 'sequelize'
import { User, Student, Pass, ActivityLog, Department } from '../models/index.js'
import { hashPassword } from '../utils/bcrypt.js'

/**
 * Get dashboard statistics
 * Calculates from actual database records (no hardcoded values)
 */
export const getDashboardStats = async () => {
  try {
    // Count users by role
    const totalStudents = await User.count({
      where: { role: 'STUDENT' }
    })

    const totalCoordinators = await User.count({
      where: { role: 'COORDINATOR' }
    })

    const totalHostelStaff = await User.count({
      where: { role: 'HOSTEL_STAFF' }
    })

    const totalSecurityStaff = await User.count({
      where: { role: 'SECURITY' }
    })

    const totalAdmins = await User.count({
      where: { role: 'ADMIN' }
    })

    // Count passes by status
    const totalPasses = await Pass.count()

    const approvedPasses = await Pass.count({
      where: { status: 'APPROVED' }
    })

    const rejectedPasses = await Pass.count({
      where: { status: 'REJECTED' }
    })

    // Count students outside (OUT exists AND IN missing today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get GateLog model dynamically
    const { GateLog } = await import('../models/index.js')

    const studentsOutside = await GateLog.findAll({
      attributes: ['pass_id'],
      where: {
        action: 'OUT',
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      raw: true
    })

    const outPassIds = studentsOutside.map(log => log.pass_id)
    let studentsOutsideCount = 0

    if (outPassIds.length > 0) {
      const inLogs = await GateLog.findAll({
        attributes: ['pass_id'],
        where: {
          pass_id: {
            [Op.in]: outPassIds
          },
          action: 'IN',
          scanned_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        raw: true
      })

      const inPassIds = inLogs.map(log => log.pass_id)
      studentsOutsideCount = outPassIds.filter(id => !inPassIds.includes(id)).length
    }

    return {
      users: {
        totalStudents,
        totalCoordinators,
        totalHostelStaff,
        totalSecurityStaff,
        totalAdmins
      },
      passes: {
        totalPasses,
        approvedPasses,
        rejectedPasses
      },
      security: {
        studentsOutside: studentsOutsideCount
      }
    }
  } catch (error) {
    throw new Error(`Failed to get dashboard stats: ${error.message}`)
  }
}

/**
 * Get all users with optional filtering
 */
export const getAllUsers = async (filter = 'ALL') => {
  try {
    const where = {}

    // Apply role filter
    if (filter !== 'ALL') {
      where.role = filter
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'last_login', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.is_active ? 'ACTIVE' : 'INACTIVE',
      lastLogin: user.last_login,
      createdAt: user.createdAt
    }))
  } catch (error) {
    throw new Error(`Failed to get users: ${error.message}`)
  }
}

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'phone', 'is_active', 'last_login', 'createdAt', 'updatedAt']
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.is_active ? 'ACTIVE' : 'INACTIVE',
      lastLogin: user.last_login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`)
  }
}

/**
 * Create new user (staff account)
 * Admin can create: COORDINATOR, HOSTEL_STAFF, SECURITY, ADMIN
 * Students use registration flow
 */
export const createUser = async (data) => {
  try {
    const { name, email, password, role, phone } = data

    // Validation: Name provided
    if (!name || !name.trim()) {
      throw new Error('Name is required')
    }

    // Validation: Email provided
    if (!email || !email.trim()) {
      throw new Error('Email is required')
    }

    // Validation: Password provided
    if (!password || !password.trim()) {
      throw new Error('Password is required')
    }

    // Validation: Role provided
    if (!role) {
      throw new Error('Role is required')
    }

    // Validation: Only staff roles allowed (not STUDENT)
    const allowedRoles = ['COORDINATOR', 'HOSTEL_STAFF', 'SECURITY', 'ADMIN']
    if (!allowedRoles.includes(role)) {
      throw new Error('Invalid role. Only COORDINATOR, HOSTEL_STAFF, SECURITY, and ADMIN are allowed')
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }

    // Validation: Email unique
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      throw new Error('Email already exists')
    }

    // Validation: Password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role,
      phone: phone || null,
      is_active: true
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: 'ACTIVE',
      createdAt: user.createdAt
    }
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }
}

/**
 * Update user
 */
export const updateUser = async (userId, data) => {
  try {
    const { name, email, phone } = data

    const user = await User.findByPk(userId)

    if (!user) {
      throw new Error('User not found')
    }

    // Validation: Cannot change role through update
    if (data.role) {
      throw new Error('Role cannot be changed through update endpoint')
    }

    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim()
    }

    // Update email if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format')
      }

      const existingUser = await User.findOne({
        where: {
          email: email.toLowerCase(),
          id: { [Op.ne]: userId }
        }
      })

      if (existingUser) {
        throw new Error('Email already exists')
      }

      user.email = email.toLowerCase()
    }

    // Update phone if provided
    if (phone !== undefined) {
      user.phone = phone || null
    }

    await user.save()

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.is_active ? 'ACTIVE' : 'INACTIVE',
      updatedAt: user.updatedAt
    }
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`)
  }
}

/**
 * Activate user
 */
export const activateUser = async (userId) => {
  try {
    const user = await User.findByPk(userId)

    if (!user) {
      throw new Error('User not found')
    }

    if (user.is_active) {
      throw new Error('User is already active')
    }

    user.is_active = true
    await user.save()

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: 'ACTIVE',
      updatedAt: user.updatedAt
    }
  } catch (error) {
    throw new Error(`Failed to activate user: ${error.message}`)
  }
}

/**
 * Deactivate user
 */
export const deactivateUser = async (userId) => {
  try {
    const user = await User.findByPk(userId)

    if (!user) {
      throw new Error('User not found')
    }

    if (!user.is_active) {
      throw new Error('User is already inactive')
    }

    user.is_active = false
    await user.save()

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: 'INACTIVE',
      updatedAt: user.updatedAt
    }
  } catch (error) {
    throw new Error(`Failed to deactivate user: ${error.message}`)
  }
}

/**
 * Reset user password
 * Generates temporary password
 */
export const resetUserPassword = async (userId) => {
  try {
    const user = await User.findByPk(userId)

    if (!user) {
      throw new Error('User not found')
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12)

    // Hash temporary password
    const hashedPassword = await hashPassword(tempPassword)

    user.password = hashedPassword
    await user.save()

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      temporaryPassword: tempPassword,
      message: 'Password has been reset. User should change it on first login.'
    }
  } catch (error) {
    throw new Error(`Failed to reset password: ${error.message}`)
  }
}

/**
 * Get activity logs
 */
export const getActivityLogs = async (limit = 50) => {
  try {
    const logs = await ActivityLog.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit
    })

    return logs.map(log => ({
      id: log.id,
      user: {
        id: log.User.id,
        name: log.User.name,
        email: log.User.email,
        role: log.User.role
      },
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      oldValues: log.old_values,
      newValues: log.new_values,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      timestamp: log.createdAt
    }))
  } catch (error) {
    throw new Error(`Failed to get activity logs: ${error.message}`)
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
