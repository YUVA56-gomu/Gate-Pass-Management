import API from './axios'

export const approvalAPI = {
  getPendingRequests: () => API.get('/approvals/pending'),
  approveRequest: (id, remarks) => API.post(`/approvals/${id}/approve`, { remarks }),
  rejectRequest: (id, remarks) => API.post(`/approvals/${id}/reject`, { remarks }),
  getHistory: () => API.get('/approvals/history')
}
