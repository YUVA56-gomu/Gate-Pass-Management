import { userRepository } from '../repositories/user.repository.js'
import { hashPassword, comparePassword } from '../utils/bcrypt.js'
import { generateToken } from '../utils/jwt.js'

export const authService = {
  register: async (data) => {
    const existingUser = await userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('Email already exists')
    }

    const hashedPassword = await hashPassword(data.password)
    const user = await userRepository.create({
      ...data,
      password: hashedPassword
    })

    return user
  },

  login: async (email, password) => {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    const token = generateToken(user)
    return { user, token }
  },

  verifyToken: async (userId) => {
    const user = await userRepository.findById(userId)
    return user
  }
}
