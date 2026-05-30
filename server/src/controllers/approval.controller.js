import * as approvalService from '../services/approval.service.js'
import { sendSuccess, sendError } from '../utils/response.js'

/**
 * Get pending long leave requests
 * GET /approvals/pending
 */
export const getPendingRequests = async (req, res) => {
  try {
    // Only coordinators can see pending long leave requests
    if (req.user.role !== 'COORDINATOR') {
      return sendError(res, 'Only coordinators can view pending long leave requests', 403)
    }

    const requests = await approvalService.getPendingLongLeaveRequests()

    return sendSuccess(res, requests, 'Pending requests retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Approve long leave request
 * PUT /approvals/:id/approve
 */
export const approveRequest = async (req, res) => {
  try {
    // Only coordinators can approve
    if (req.user.role !== 'COORDINATOR') {
      return sendError(res, 'Only coordinators can approve requests', 403)
    }

    const { id } = req.params
    const { remarks } = req.body

    const approval = await approvalService.approveLongLeaveRequest(id, req.user.id, remarks)

    return sendSuccess(res, approval, 'Request approved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Reject long leave request
 * PUT /approvals/:id/reject
 */
export const rejectRequest = async (req, res) => {
  try {
    // Only coordinators can reject
    if (req.user.role !== 'COORDINATOR') {
      return sendError(res, 'Only coordinators can reject requests', 403)
    }

    const { id } = req.params
    const { remarks } = req.body

    // Remarks are mandatory for rejection
    if (!remarks || !remarks.trim()) {
      return sendError(res, 'Remarks are mandatory for rejection', 400)
    }

    const approval = await approvalService.rejectLongLeaveRequest(id, req.user.id, remarks)

    return sendSuccess(res, approval, 'Request rejected successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get approval history
 * GET /approvals/history
 */
export const getHistory = async (req, res) => {
  try {
    // Only coordinators can view their history
    if (req.user.role !== 'COORDINATOR') {
      return sendError(res, 'Only coordinators can view approval history', 403)
    }

    const history = await approvalService.getCoordinatorApprovalHistory(req.user.id)

    return sendSuccess(res, history, 'Approval history retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export const approvalController = {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getHistory
}

export default approvalController
