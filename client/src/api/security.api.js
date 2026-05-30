import axios from './axios'

/**
 * Scan QR Token
 * POST /security/scan
 */
export const scanQRToken = async (token) => {
  try {
    const response = await axios.post('/security/scan', { token })
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to scan QR token' }
  }
}

/**
 * Get Today's Logs
 * GET /security/logs/today
 */
export const getTodayLogs = async () => {
  try {
    const response = await axios.get('/security/logs/today')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get today\'s logs' }
  }
}

/**
 * Get All Logs with Filters
 * GET /security/logs?filter=ALL|OUT|IN|TODAY
 */
export const getAllLogs = async (filter = 'ALL') => {
  try {
    const response = await axios.get('/security/logs', {
      params: { filter }
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get logs' }
  }
}

/**
 * Get Dashboard Statistics
 * GET /security/dashboard
 */
export const getDashboardStats = async () => {
  try {
    const response = await axios.get('/security/dashboard')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get dashboard statistics' }
  }
}

export default {
  scanQRToken,
  getTodayLogs,
  getAllLogs,
  getDashboardStats
}
