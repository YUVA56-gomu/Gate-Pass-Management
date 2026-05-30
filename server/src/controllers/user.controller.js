import { userRepository } from '../repositories/user.repository.js'
import { hashPassword } from '../utils/bcrypt.js'
import { successResponse, errorResponse } from '../utils/response.js'

export const userController = {
  getProfile: async (req, res) => {
    try {
      const user = await userRepository.findById(req.user.id)
      successResponse(res, user, 'Profile retrieved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  updateProfile: async (req, res) => {
    try {
      await userRepository.update(req.user.id, req.body)
      const user = await userRepository.findById(req.user.id)
      successResponse(res, user, 'Profile updated')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await userRepository.findAll()
      successResponse(res, users, 'Users retrieved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  createUser: async (req, res) => {
    try {
      const hashedPassword = await hashPassword(req.body.password)
      const user = await userRepository.create({
        ...req.body,
        password: hashedPassword
      })
      successResponse(res, user, 'User created', 201)
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  updateUser: async (req, res) => {
    try {
      await userRepository.update(req.params.id, req.body)
      const user = await userRepository.findById(req.params.id)
      successResponse(res, user, 'User updated')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  deleteUser: async (req, res) => {
    try {
      await userRepository.delete(req.params.id)
      successResponse(res, null, 'User deleted')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  }
}
