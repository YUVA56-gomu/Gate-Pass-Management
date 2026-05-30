import API from './axios'

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (email, password) => API.post('/auth/login', { email, password }),
  verify: () => API.get('/auth/verify'),
  logout: () => API.post('/auth/logout')
}
