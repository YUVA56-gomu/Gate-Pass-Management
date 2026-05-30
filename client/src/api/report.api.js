import axios from './axios'

/**
 * Get overall system statistics
 * GET /reports/overview
 */
export const getOverallStats = async () => {
  try {
    const response = await axios.get('/reports/overview')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get overall statistics' }
  }
}

/**
 * Get department-wise pass statistics
 * GET /reports/departments
 */
export const getDepartmentStats = async () => {
  try {
    const response = await axios.get('/reports/departments')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get department statistics' }
  }
}

/**
 * Get monthly pass statistics
 * GET /reports/monthly
 */
export const getMonthlyStats = async () => {
  try {
    const response = await axios.get('/reports/monthly')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get monthly statistics' }
  }
}

/**
 * Get pass type statistics
 * GET /reports/pass-types
 */
export const getPassTypeStats = async () => {
  try {
    const response = await axios.get('/reports/pass-types')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get pass type statistics' }
  }
}

/**
 * Get security statistics
 * GET /reports/security
 */
export const getSecurityStats = async () => {
  try {
    const response = await axios.get('/reports/security')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get security statistics' }
  }
}

/**
 * Get coordinator performance statistics
 * GET /reports/coordinators
 */
export const getCoordinatorStats = async () => {
  try {
    const response = await axios.get('/reports/coordinators')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get coordinator statistics' }
  }
}

/**
 * Get hostel staff performance statistics
 * GET /reports/hostel-staff
 */
export const getHostelStaffStats = async () => {
  try {
    const response = await axios.get('/reports/hostel-staff')
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get hostel staff statistics' }
  }
}

/**
 * Export report as CSV
 * GET /reports/export/csv?type=...
 */
export const exportReportAsCSV = async (reportType) => {
  try {
    const response = await axios.get('/reports/export/csv', {
      params: { type: reportType },
      responseType: 'blob'
    })

    // Create blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)

    return { success: true, message: 'Report exported successfully' }
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to export report' }
  }
}

/**
 * Export report as PDF (get data)
 * GET /reports/export/pdf?type=...
 */
export const exportReportAsPDF = async (reportType) => {
  try {
    const response = await axios.get('/reports/export/pdf', {
      params: { type: reportType }
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to export report as PDF' }
  }
}

export default {
  getOverallStats,
  getDepartmentStats,
  getMonthlyStats,
  getPassTypeStats,
  getSecurityStats,
  getCoordinatorStats,
  getHostelStaffStats,
  exportReportAsCSV,
  exportReportAsPDF
}
