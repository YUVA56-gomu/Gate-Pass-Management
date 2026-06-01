import { sendSuccess, sendError } from '../utils/response.js'
import * as reportService from '../services/report.service.js'

/**
 * Get overall system statistics
 * GET /reports/overview
 */
export const getOverview = async (req, res) => {
  try {
    const stats = await reportService.getOverallStats()
    return sendSuccess(res, stats, 'Overall statistics retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get department-wise pass statistics
 * GET /reports/departments
 */
export const getDepartments = async (req, res) => {
  try {
    const stats = await reportService.getDepartmentStats()
    return sendSuccess(res, stats, 'Department statistics retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get monthly pass statistics
 * GET /reports/monthly
 */
export const getMonthly = async (req, res) => {
  try {
    const stats = await reportService.getMonthlyStats()
    return sendSuccess(res, stats, 'Monthly statistics retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get pass type statistics
 * GET /reports/pass-types
 */
export const getPassTypes = async (req, res) => {
  try {
    const stats = await reportService.getPassTypeStats()
    return sendSuccess(res, stats, 'Pass type statistics retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get security statistics
 * GET /reports/security
 */
export const getSecurity = async (req, res) => {
  try {
    const stats = await reportService.getSecurityStats()
    return sendSuccess(res, stats, 'Security statistics retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get coordinator performance statistics
 * GET /reports/coordinators
 */
export const getCoordinators = async (req, res) => {
  try {
    const stats = await reportService.getCoordinatorPerformance()
    return sendSuccess(res, stats, 'Coordinator performance retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get hostel staff performance statistics
 * GET /reports/hostel-staff
 */
export const getHostelStaff = async (req, res) => {
  try {
    const stats = await reportService.getHostelStaffPerformance()
    return sendSuccess(res, stats, 'Hostel staff performance retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Export report as CSV
 * GET /reports/export/csv?type=overall|departments|monthly|passTypes|coordinators|hostelStaff
 */
export const exportCSV = async (req, res) => {
  try {
    const { type } = req.query

    if (!type) {
      return sendError(res, 'Report type is required', 400)
    }

    const validTypes = [
      'overview',
      'departments',
      'monthly',
      'pass-types',
      'security',
      'coordinators',
      'hostel-staff'
    ]

    if (!validTypes.includes(type)) {
      return sendError(res, 'Invalid report type', 400)
    }

    // map frontend type -> service type
    const typeMap = {
      overview: 'overall',
      departments: 'departments',
      monthly: 'monthly',
      'pass-types': 'passTypes',
      security: 'security',
      coordinators: 'coordinators',
      'hostel-staff': 'hostelStaff'
    }

    const csvContent = await reportService.exportDataAsCSV(
      typeMap[type]
    )

    res.setHeader('Content-Type', 'text/csv')

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${type}-${new Date()
        .toISOString()
        .split('T')[0]}.csv"`
    )

    return res.send(csvContent)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Export report as PDF (prepare data)
 * GET /reports/export/pdf?type=overall|departments|monthly|passTypes|security|coordinators|hostelStaff
 */
export const exportPDF = async (req, res) => {
  try {
    const { type } = req.query

    if (!type) {
      return sendError(res, 'Report type is required', 400)
    }

    const validTypes = [
      'overview',
      'departments',
      'monthly',
      'pass-types',
      'security',
      'coordinators',
      'hostel-staff'
    ]

    if (!validTypes.includes(type)) {
      return sendError(res, 'Invalid report type', 400)
    }

    // map frontend type -> service type
    const typeMap = {
      overview: 'overall',
      departments: 'departments',
      monthly: 'monthly',
      'pass-types': 'passTypes',
      security: 'security',
      coordinators: 'coordinators',
      'hostel-staff': 'hostelStaff'
    }

    const pdfData = await reportService.exportDataAsPDF(
      typeMap[type]
    )

    return sendSuccess(
      res,
      pdfData,
      'PDF data prepared successfully',
      200
    )
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export default {
  getOverview,
  getDepartments,
  getMonthly,
  getPassTypes,
  getSecurity,
  getCoordinators,
  getHostelStaff,
  exportCSV,
  exportPDF
}
