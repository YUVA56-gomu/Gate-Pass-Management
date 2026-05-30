import { sendError } from '../utils/response.js'

/**
 * Check if user has required role
 * @param {...string} allowedRoles - Allowed roles
 * @returns {Function} Middleware function
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403)
    }

    next()
  }
}

/**
 * Check if user is STUDENT
 */
export const isStudent = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'User not authenticated', 401)
  }

  if (req.user.role !== 'STUDENT') {
    return sendError(res, 'Only students can access this resource', 403)
  }

  next()
}

/**
 * Check if user is COORDINATOR
 */
export const isCoordinator = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'User not authenticated', 401)
  }

  if (req.user.role !== 'COORDINATOR') {
    return sendError(res, 'Only coordinators can access this resource', 403)
  }

  next()
}

/**
 * Check if user is HOSTEL_STAFF
 */
export const isHostelStaff = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'User not authenticated', 401)
  }

  if (req.user.role !== 'HOSTEL_STAFF') {
    return sendError(res, 'Only hostel staff can access this resource', 403)
  }

  next()
}

/**
 * Check if user is SECURITY
 */
export const isSecurity = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'User not authenticated', 401)
  }

  if (req.user.role !== 'SECURITY') {
    return sendError(res, 'Only security staff can access this resource', 403)
  }

  next()
}

/**
 * Check if user is ADMIN
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'User not authenticated', 401)
  }

  if (req.user.role !== 'ADMIN') {
    return sendError(res, 'Only admins can access this resource', 403)
  }

  next()
}

/**
 * Check if user is ADMIN or COORDINATOR
 */
export const isAdminOrCoordinator = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'User not authenticated', 401)
  }

  if (!['ADMIN', 'COORDINATOR'].includes(req.user.role)) {
    return sendError(res, 'Only admins and coordinators can access this resource', 403)
  }

  next()
}

/**
 * Check if user is ADMIN or HOSTEL_STAFF
 */
export const isAdminOrHostelStaff = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'User not authenticated', 401)
  }

  if (!['ADMIN', 'HOSTEL_STAFF'].includes(req.user.role)) {
    return sendError(res, 'Only admins and hostel staff can access this resource', 403)
  }

  next()
}

export default {
  authorize,
  isStudent,
  isCoordinator,
  isHostelStaff,
  isSecurity,
  isAdmin,
  isAdminOrCoordinator,
  isAdminOrHostelStaff
}
