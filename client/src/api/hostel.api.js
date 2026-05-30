import axiosInstance from './axios'

/**
 * Get pending passes (PENDING_HOSTEL status)
 * @returns {Promise<object>} List of pending passes
 */
export const getPendingPasses = async () => {
  const response = await axiosInstance.get('/hostel/pending')
  return response.data
}

/**
 * Approve pass
 * @param {number} passId - Pass ID
 * @param {string} remarks - Optional remarks
 * @returns {Promise<object>} Approval record
 */
export const approvePass = async (passId, remarks = null) => {
  const response = await axiosInstance.put(`/hostel/passes/${passId}/approve`, {
    remarks
  })
  return response.data
}

/**
 * Reject pass
 * @param {number} passId - Pass ID
 * @param {string} remarks - Rejection remarks (required)
 * @returns {Promise<object>} Approval record
 */
export const rejectPass = async (passId, remarks) => {
  const response = await axiosInstance.put(`/hostel/passes/${passId}/reject`, {
    remarks
  })
  return response.data
}

/**
 * Get all passes with optional filter
 * @param {string} filter - Filter type (ALL, DAILY, LONG_LEAVE, APPROVED, REJECTED, PENDING_HOSTEL)
 * @returns {Promise<object>} List of passes
 */
export const getAllPasses = async (filter = 'ALL') => {
  const response = await axiosInstance.get('/hostel/passes', {
    params: { filter }
  })
  return response.data
}

/**
 * Get students directory
 * @param {string} search - Search query (name, USN, or department)
 * @returns {Promise<object>} List of students
 */
export const getStudents = async (search = '') => {
  const response = await axiosInstance.get('/hostel/students', {
    params: { search }
  })
  return response.data
}

/**
 * Get dashboard statistics
 * @returns {Promise<object>} Dashboard data with stats and recent activity
 */
export const getDashboard = async () => {
  const response = await axiosInstance.get('/hostel/dashboard')
  return response.data
}

export default {
  getPendingPasses,
  approvePass,
  rejectPass,
  getAllPasses,
  getStudents,
  getDashboard
}
