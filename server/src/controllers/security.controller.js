import { sendSuccess, sendError } from '../utils/response.js'
import * as securityService from '../services/security.service.js'

/**
 * Get Students Currently Outside
 * GET /security/outside
 */
export const getStudentsOutside = async (req, res) => {
  try {
    const students = await securityService.getStudentsOutside()
    return sendSuccess(res, students, 'Students outside retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Scan QR Token
 * POST /security/scan
 */
export const scanQR = async (req, res) => {
  try {
    const { token } = req.body
    const securityUserId = req.user.id

    // Validation: Token provided
    if (!token) {
      return sendError(res, 'Token is required', 400)
    }

    // Call service
    const result = await securityService.scanQRToken(token, securityUserId)

    return sendSuccess(res, result, 'QR scanned successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get Today's Logs
 * GET /security/logs/today
 */
export const getTodayLogs = async (req, res) => {
  try {
    const logs = await securityService.getTodayLogs()

    return sendSuccess(res, logs, 'Today\'s logs retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get All Logs with Filters
 * GET /security/logs?filter=ALL|OUT|IN|TODAY
 */
export const getAllLogs = async (req, res) => {
  try {
    const { filter = 'ALL' } = req.query

    // Validation: Valid filter
    const validFilters = ['ALL', 'OUT', 'IN', 'TODAY']
    if (!validFilters.includes(filter)) {
      return sendError(res, 'Invalid filter. Use: ALL, OUT, IN, or TODAY', 400)
    }

    const logs = await securityService.getAllLogs(filter)

    return sendSuccess(res, logs, 'Logs retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get Dashboard Statistics
 * GET /security/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const stats = await securityService.getDashboardStats()

    return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export default {
  scanQR,
  getTodayLogs,
  getAllLogs,
  getDashboard
}
