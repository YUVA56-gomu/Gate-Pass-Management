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
  const url = `/hostel/passes/${passId}/approve`
  console.log('[HOSTEL API] PUT', url, { remarks })
  const response = await axiosInstance.put(url, { remarks })
  console.log('[HOSTEL API] Approve response:', response.status, response.data)
  return response.data
}

/**
 * Reject pass
 * @param {number} passId - Pass ID
 * @param {string} remarks - Rejection remarks (required)
 * @returns {Promise<object>} Approval record
 */
export const rejectPass = async (passId, remarks) => {
  const url = `/hostel/passes/${passId}/reject`
  console.log('[HOSTEL API] PUT', url, { remarks: remarks ? '(provided)' : '(empty)' })
  const response = await axiosInstance.put(url, { remarks })
  console.log('[HOSTEL API] Reject response:', response.status, response.data)
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

/**
 * Get approved passes
 * @returns {Promise<object>} List of approved passes
 */
export const getApprovedPasses = async () => {
  const response = await axiosInstance.get('/hostel/approved')
  return response.data
}

/**
 * Get students currently outside
 * @returns {Promise<object>} List of students currently outside
 */
export const getStudentsOutside = async () => {
  const response = await axiosInstance.get('/hostel/students-outside')
  return response.data
}

/**
 * Get today's overview statistics
 * @returns {Promise<object>} Today's overview data (entries, exits, currently outside, expected returns)
 */
export const getTodayOverview = async () => {
  const response = await axiosInstance.get('/hostel/today-overview')
  return response.data
}

export default {
  getPendingPasses,
  approvePass,
  rejectPass,
  getAllPasses,
  getStudents,
  getDashboard,
  getApprovedPasses,
  getStudentsOutside,
  getTodayOverview
}
