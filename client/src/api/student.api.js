import axiosInstance from './axios'

/**
 * Get student profile
 * @returns {Promise<object>} Student profile data
 */
export const getStudentProfile = async () => {
  const response = await axiosInstance.get('/student/profile')
  return response.data
}

/**
 * Create student profile
 * @param {object} data - Profile data
 * @returns {Promise<object>} Created profile
 */
export const createStudentProfile = async (data) => {
  const response = await axiosInstance.post('/student/profile', data)
  return response.data
}

/**
 * Update student profile
 * @param {object} data - Profile data to update
 * @returns {Promise<object>} Updated profile
 */
export const updateStudentProfile = async (data) => {
  const response = await axiosInstance.put('/student/profile', data)
  return response.data
}

/**
 * Check if student profile is complete
 * @returns {Promise<object>} Profile completion status
 */
export const checkProfileCompletion = async () => {
  const response = await axiosInstance.get('/student/profile/check')
  return response.data
}

export default {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
  checkProfileCompletion
}
