import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'

/**
 * Generate JWT token
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @param {string} email - User email
 * @returns {string} JWT token
 */
export const generateToken = (userId, role, email) => {
  return jwt.sign(
    { id: userId, role, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  )
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired')
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token')
    }
    throw error
  }
}

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
export const decodeToken = (token) => {
  return jwt.decode(token)
}

export default { generateToken, verifyToken, decodeToken }
