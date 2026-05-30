import { authService } from '../services/auth.service.js'
import { successResponse, errorResponse } from '../utils/response.js'

export const authController = {
  register: async (req, res) => {
    try {
      const user = await authService.register(req.body)
      successResponse(res, user, 'Registration successful', 201)
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body
      const { user, token } = await authService.login(email, password)
      successResponse(res, { user, token }, 'Login successful')
    } catch (error) {
      errorResponse(res, error.message, 401)
    }
  },

  verify: async (req, res) => {
    try {
      const user = await authService.verifyToken(req.user.id)
      successResponse(res, { user }, 'Token verified')
    } catch (error) {
      errorResponse(res, error.message, 401)
    }
  }
}
