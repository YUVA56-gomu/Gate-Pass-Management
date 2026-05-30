import axiosInstance from './axios'

/**
 * Register new student
 * @param {object} data - Registration data
 * @returns {Promise<object>} User and token
 */
export const registerStudent = async (data) => {
  const response = await axiosInstance.post('/auth/register', data)
  return response.data
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User and token
 */
export const loginUser = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', {
    email,
    password
  })
  return response.data
}

/**
 * Get current user
 * @returns {Promise<object>} Current user data
 */
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me')
  return response.data
}

/**
 * Logout user
 * @returns {Promise<object>} Logout response
 */
export const logoutUser = async () => {
  const response = await axiosInstance.post('/auth/logout')
  return response.data
}

/**
 * Change password
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Success response
 */
export const changePassword = async (oldPassword, newPassword) => {
  const response = await axiosInstance.post('/auth/change-password', {
    oldPassword,
    newPassword
  })
  return response.data
}

export default {
  registerStudent,
  loginUser,
  getCurrentUser,
  logoutUser,
  changePassword
}
