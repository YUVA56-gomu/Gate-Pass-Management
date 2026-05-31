import { User, Student } from '../models/index.js'
import { hashPassword, comparePassword } from '../utils/bcrypt.js'
import { generateToken } from '../utils/jwt.js'

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {Error} If email is invalid
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @throws {Error} If password doesn't meet requirements
 */
const validatePasswordStrength = (password) => {
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
}

/**
 * Normalize email (trim and lowercase)
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email
 */
const normalizeEmail = (email) => {
  return email.trim().toLowerCase()
}

/**
 * Register new student
 * @param {object} data - Registration data
 * @returns {Promise<object>} User and token
 */
export const registerStudent = async (data) => {
  const { name, email, password, phone } = data

  // Validate required fields
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required')
  }

  // Validate name is not empty
  if (name.trim().length === 0) {
    throw new Error('Name cannot be empty')
  }

  // Normalize and validate email
  const normalizedEmail = normalizeEmail(email)
  if (normalizedEmail.length === 0) {
    throw new Error('Email cannot be empty')
  }
  validateEmail(normalizedEmail)

  // Validate password strength
  validatePasswordStrength(password)

  // Check if email already exists
  const existingUser = await User.findOne({ where: { email: normalizedEmail } })
  if (existingUser) {
    throw new Error('Email already registered')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user with STUDENT role
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone ? phone.trim() : null,
    role: 'STUDENT',
    is_active: true
  })

  // Create Student record with default null values for profile fields
  // These will be filled in when student completes their profile
  const student = await Student.create({
    user_id: user.id,
    usn: null,
    department_id: null,
    program_type: null,
    year_of_study: null,
    semester: null,
    gender: null,
    hostel_name: null,
    hostel_type: null,
    room_number: null,
    parent_phone: null,
    emergency_contact: null
  })

  // Generate token
  const token = generateToken(user.id, user.role, user.email)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active
    },
    student: {
      id: student.id,
      user_id: student.user_id
    },
    token,
    message: 'Student registered successfully. Please complete your profile after login.'
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User and token
 */
export const login = async (email, password) => {
  // Validate required fields
  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  // Validate email is not empty
  if (email.trim().length === 0) {
    throw new Error('Email cannot be empty')
  }

  if (password.trim().length === 0) {
    throw new Error('Password cannot be empty')
  }

  // Normalize email
  const normalizedEmail = normalizeEmail(email)
  validateEmail(normalizedEmail)

  // Find user by email
  const user = await User.findOne({ where: { email: normalizedEmail } })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Check if user is active
  if (!user.is_active) {
    throw new Error('User account is inactive')
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }

  // Update last login
  await user.update({ last_login: new Date() })

  // Generate token
  const token = generateToken(user.id, user.role, user.email)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      last_login: user.last_login
    },
    token
  }
}

/**
 * Get current user
 * @param {number} userId - User ID
 * @returns {Promise<object>} User data
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // If user is a student, include student profile if available
  let response = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active,
    last_login: user.last_login,
    createdAt: user.createdAt
  }

  // Include student profile if role is STUDENT
  if (user.role === 'STUDENT') {
    const student = await Student.findOne({ where: { user_id: userId } })
    if (student) {
      response.student = {
        id: student.id,
        usn: student.usn,
        program_type: student.program_type,
        year_of_study: student.year_of_study,
        semester: student.semester,
        gender: student.gender,
        hostel_name: student.hostel_name,
        hostel_type: student.hostel_type,
        room_number: student.room_number,
        parent_phone: student.parent_phone,
        emergency_contact: student.emergency_contact
      }
    }
  }

  return response
}

/**
 * Create user (Admin only)
 * @param {object} data - User data
 * @returns {Promise<object>} Created user
 */
export const createUser = async (data) => {
  const { name, email, password, phone, role } = data

  // Validate required fields
  if (!name || !email || !password || !role) {
    throw new Error('Name, email, password, and role are required')
  }

  // Validate name is not empty
  if (name.trim().length === 0) {
    throw new Error('Name cannot be empty')
  }

  // Validate role - ADMIN role cannot be created through API
  const validRoles = ['COORDINATOR', 'HOSTEL_STAFF', 'SECURITY']
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}. ADMIN accounts must be created manually.`)
  }

  // Normalize and validate email
  const normalizedEmail = normalizeEmail(email)
  if (normalizedEmail.length === 0) {
    throw new Error('Email cannot be empty')
  }
  validateEmail(normalizedEmail)

  // Validate password strength
  validatePasswordStrength(password)

  // Check if email already exists
  const existingUser = await User.findOne({ where: { email: normalizedEmail } })
  if (existingUser) {
    throw new Error('Email already registered')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone ? phone.trim() : null,
    role,
    is_active: true
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active
  }
}

/**
 * Update user (Admin only)
 * @param {number} userId - User ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated user
 */
export const updateUser = async (userId, data) => {
  const user = await User.findByPk(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const { name, phone, is_active, role } = data

  // Validate role if provided - ADMIN role cannot be assigned through API
  if (role) {
    const validRoles = ['COORDINATOR', 'HOSTEL_STAFF', 'SECURITY']
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}. ADMIN role cannot be assigned through API.`)
    }
  }

  // Update user
  await user.update({
    ...(name && { name: name.trim() }),
    ...(phone && { phone: phone.trim() }),
    ...(is_active !== undefined && { is_active }),
    ...(role && { role })
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_active: user.is_active
  }
}

/**
 * Change password
 * @param {number} userId - User ID
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Success message
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  // Validate required fields
  if (!oldPassword || !newPassword) {
    throw new Error('Old password and new password are required')
  }

  if (oldPassword.trim().length === 0 || newPassword.trim().length === 0) {
    throw new Error('Passwords cannot be empty')
  }

  // Validate new password strength
  validatePasswordStrength(newPassword)

  // Find user
  const user = await User.findByPk(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Compare old password
  const isPasswordValid = await comparePassword(oldPassword, user.password)
  if (!isPasswordValid) {
    throw new Error('Old password is incorrect')
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword)

  // Update password
  await user.update({ password: hashedPassword })

  return { message: 'Password changed successfully' }
}

/**
 * Deactivate user (Admin only)
 * @param {number} userId - User ID
 * @returns {Promise<object>} Success message
 */
export const deactivateUser = async (userId) => {
  const user = await User.findByPk(userId)
  if (!user) {
    throw new Error('User not found')
  }

  await user.update({ is_active: false })

  return { message: 'User deactivated successfully' }
}

/**
 * Activate user (Admin only)
 * @param {number} userId - User ID
 * @returns {Promise<object>} Success message
 */
export const activateUser = async (userId) => {
  const user = await User.findByPk(userId)
  if (!user) {
    throw new Error('User not found')
  }

  await user.update({ is_active: true })

  return { message: 'User activated successfully' }
}

export default {
  registerStudent,
  login,
  getCurrentUser,
  createUser,
  updateUser,
  changePassword,
  deactivateUser,
  activateUser
}
