import * as hostelService from '../services/hostel.service.js'
import { sendSuccess, sendError } from '../utils/response.js'

/**
 * Get pending passes for hostel staff
 * GET /hostel/pending
 */
export const getPendingPasses = async (req, res) => {
  try {
    // Only hostel staff can view pending passes
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can view pending passes', 403)
    }

    const passes = await hostelService.getPendingPasses()

    return sendSuccess(res, passes, 'Pending passes retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Approve pass
 * PUT /hostel/passes/:id/approve
 */
export const approvePass = async (req, res) => {
  try {
    console.log('[HOSTEL CONTROLLER] PUT approve', {
      passId: req.params.id,
      userId: req.user?.id,
      role: req.user?.role
    })

    // Only hostel staff can approve
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can approve passes', 403)
    }

    const { id } = req.params
    const { remarks } = req.body

    const approval = await hostelService.approvePass(id, req.user.id, remarks)

    console.log('[HOSTEL CONTROLLER] Approve success, passId:', id)
    return sendSuccess(res, approval, 'Pass approved successfully', 200)
  } catch (error) {
    console.error('[HOSTEL CONTROLLER] Approve error:', error.message)
    return sendError(res, error.message, 400)
  }
}

/**
 * Reject pass
 * PUT /hostel/passes/:id/reject
 */
export const rejectPass = async (req, res) => {
  try {
    console.log('[HOSTEL CONTROLLER] PUT reject', {
      passId: req.params.id,
      userId: req.user?.id,
      role: req.user?.role
    })

    // Only hostel staff can reject
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can reject passes', 403)
    }

    const { id } = req.params
    const { remarks } = req.body

    // Remarks are mandatory for rejection
    if (!remarks || !remarks.trim()) {
      return sendError(res, 'Remarks are mandatory for rejection', 400)
    }

    const approval = await hostelService.rejectPass(id, req.user.id, remarks)

    console.log('[HOSTEL CONTROLLER] Reject success, passId:', id)
    return sendSuccess(res, approval, 'Pass rejected successfully', 200)
  } catch (error) {
    console.error('[HOSTEL CONTROLLER] Reject error:', error.message)
    return sendError(res, error.message, 400)
  }
}

/**
 * Get all passes with optional filter
 * GET /hostel/passes?filter=ALL|DAILY|LONG_LEAVE|APPROVED|REJECTED|PENDING_HOSTEL
 */
export const getAllPasses = async (req, res) => {
  try {
    // Only hostel staff can view passes
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can view passes', 403)
    }

    const { filter = 'ALL' } = req.query

    const passes = await hostelService.getAllPasses(filter)

    return sendSuccess(res, passes, 'Passes retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get students directory
 * GET /hostel/students?search=query
 */
export const getStudents = async (req, res) => {
  try {
    // Only hostel staff can view students
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can view students', 403)
    }

    const { search = '' } = req.query

    const students = await hostelService.getStudents(search)

    return sendSuccess(res, students, 'Students retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get dashboard statistics
 * GET /hostel/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    // Only hostel staff can view dashboard
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can view dashboard', 403)
    }

    const stats = await hostelService.getDashboardStats()
    const recentActivity = await hostelService.getRecentActivity(req.user.id)

    return sendSuccess(
      res,
      {
        stats,
        recentActivity
      },
      'Dashboard data retrieved successfully',
      200
    )
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get approved passes
 * GET /hostel/approved
 */
export const getApprovedPasses = async (req, res) => {
  try {
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can view approved passes', 403)
    }

    const passes = await hostelService.getApprovedPasses()

    return sendSuccess(res, passes, 'Approved passes retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get students currently outside
 * GET /hostel/students-outside
 */
export const getStudentsOutside = async (req, res) => {
  try {
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can view students outside', 403)
    }

    const students = await hostelService.getStudentsOutside()

    return sendSuccess(res, students, 'Students outside retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get today's overview statistics
 * GET /hostel/today-overview
 */
export const getTodayOverview = async (req, res) => {
  try {
    if (req.user.role !== 'HOSTEL_STAFF') {
      return sendError(res, 'Only hostel staff can view today\'s overview', 403)
    }

    const overview = await hostelService.getTodayOverview()

    return sendSuccess(res, overview, 'Today\'s overview retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export const hostelController = {
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

export default hostelController
