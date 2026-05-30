import API from './axios'

export const reportAPI = {
  getDashboardStats: () => API.get('/reports/stats'),
  getPassReport: (filters) => API.get('/reports/passes', { params: filters }),
  getUserReport: (filters) => API.get('/reports/users', { params: filters }),
  getGateLogReport: (filters) => API.get('/reports/gate-logs', { params: filters })
}
