import API from './axios'

export const passAPI = {
  applyPass: (data) => API.post('/passes', data),
  getMyPasses: () => API.get('/passes/my-passes'),
  getPassById: (id) => API.get(`/passes/${id}`),
  downloadPDF: (id) => API.get(`/passes/${id}/pdf`, { responseType: 'blob' }),
  getQRCode: (id) => API.get(`/passes/${id}/qr`)
}
