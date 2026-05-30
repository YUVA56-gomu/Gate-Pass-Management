import axiosInstance from './axios'

/**
 * Get pending long leave requests
 * @returns {Promise<object>} List of pending requests
 */
export const getPendingRequests = async () => {
  const response = await axiosInstance.get('/approvals/pending')
  return response.data
}

/**
 * Approve long leave request
 * @param {number} approvalId - Approval ID
 * @param {string} remarks - Optional remarks
 * @returns {Promise<object>} Approval record
 */
export const approveRequest = async (approvalId, remarks = null) => {
  const response = await axiosInstance.put(`/approvals/${approvalId}/approve`, {
    remarks
  })
  return response.data
}

/**
 * Reject long leave request
 * @param {number} approvalId - Approval ID
 * @param {string} remarks - Rejection remarks (required)
 * @returns {Promise<object>} Approval record
 */
export const rejectRequest = async (approvalId, remarks) => {
  const response = await axiosInstance.put(`/approvals/${approvalId}/reject`, {
    remarks
  })
  return response.data
}

/**
 * Get approval history
 * @returns {Promise<object>} List of approvals handled by coordinator
 */
export const getApprovalHistory = async () => {
  const response = await axiosInstance.get('/approvals/history')
  return response.data
}

export default {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getApprovalHistory
}
