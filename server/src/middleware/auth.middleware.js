import { verifyToken } from '../utils/jwt.js'
import { sendError } from '../utils/response.js'

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return sendError(res, 'No token provided', 401)
    }

    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return sendError(res, error.message || 'Authentication failed', 401)
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (token) {
      const decoded = verifyToken(token)
      req.user = decoded
    }

    next()
  } catch (error) {
    // Continue without user if token is invalid
    next()
  }
}

/**
 * Role-based access control middleware
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403)
    }

    next()
  }
}

export const authMiddleware = authenticate

export default { authenticate, optionalAuth, roleMiddleware, authMiddleware }
