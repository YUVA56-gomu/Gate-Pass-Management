import API from './axios'

export const securityAPI = {
  scanQR: (qrCode) => API.post('/security/scan', { qrCode }),
  markIN: (passId) => API.post(`/security/mark-in/${passId}`),
  markOUT: (passId) => API.post(`/security/mark-out/${passId}`),
  getScanLogs: () => API.get('/security/logs')
}
