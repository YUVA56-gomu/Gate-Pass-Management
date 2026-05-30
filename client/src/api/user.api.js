import API from './axios'

export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  getAllUsers: () => API.get('/users'),
  createUser: (data) => API.post('/users', data),
  updateUser: (id, data) => API.put(`/users/${id}`, data),
  deleteUser: (id) => API.delete(`/users/${id}`)
}
