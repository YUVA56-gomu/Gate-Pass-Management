import axiosInstance from './axios'

/**
 * Create a new pass
 * @param {object} data - Pass data
 * @returns {Promise<object>} Created pass
 */
export const createPass = async (data) => {
  const response = await axiosInstance.post('/passes', data)
  return response.data
}

/**
 * Get all passes for current student
 * @returns {Promise<object>} List of student passes
 */
export const getMyPasses = async () => {
  const response = await axiosInstance.get('/passes/my')
  return response.data
}

/**
 * Get pass by ID
 * @param {number} passId - Pass ID
 * @returns {Promise<object>} Pass details
 */
export const getPassById = async (passId) => {
  const response = await axiosInstance.get(`/passes/${passId}`)
  return response.data
}

/**
 * Delete a pass
 * @param {number} passId - Pass ID
 * @returns {Promise<object>} Delete confirmation
 */
export const deletePass = async (passId) => {
  const response = await axiosInstance.delete(`/passes/${passId}`)
  return response.data
}

export default {
  createPass,
  getMyPasses,
  getPassById
}
