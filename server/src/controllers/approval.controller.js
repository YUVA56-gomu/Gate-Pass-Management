import { approvalService } from '../services/approval.service.js'
import { approvalRepository } from '../repositories/approval.repository.js'
import { successResponse, errorResponse } from '../utils/response.js'

export const approvalController = {
  getPendingRequests: async (req, res) => {
    try {
      const approvals = await approvalRepository.findPending()
      successResponse(res, approvals, 'Pending requests retrieved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  approveRequest: async (req, res) => {
    try {
      const { remarks } = req.body
      const approval = await approvalService.approveRequest(req.params.id, remarks)
      successResponse(res, approval, 'Request approved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  rejectRequest: async (req, res) => {
    try {
      const { remarks } = req.body
      const approval = await approvalService.rejectRequest(req.params.id, remarks)
      successResponse(res, approval, 'Request rejected')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  getHistory: async (req, res) => {
    try {
      const approvals = await approvalRepository.findAll()
      successResponse(res, approvals, 'History retrieved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  }
}
