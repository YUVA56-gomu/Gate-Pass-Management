import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'
import * as adminController from '../controllers/admin.controller.js'

const router = express.Router()

/**
 * All admin routes require authentication and ADMIN role
 */

/**
 * GET /admin/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', authenticate, isAdmin, adminController.getDashboard)

/**
 * GET /admin/users?filter=ALL|STUDENT|COORDINATOR|HOSTEL_STAFF|SECURITY|ADMIN
 * Get all users with optional filtering
 */
router.get('/users', authenticate, isAdmin, adminController.getAllUsers)

/**
 * GET /admin/users/:id
 * Get user by ID
 */
router.get('/users/:id', authenticate, isAdmin, adminController.getUserById)

/**
 * POST /admin/users
 * Create new user (staff account)
 */
router.post('/users', authenticate, isAdmin, adminController.createUser)

/**
 * PUT /admin/users/:id
 * Update user
 */
router.put('/users/:id', authenticate, isAdmin, adminController.updateUser)

/**
 * PUT /admin/users/:id/activate
 * Activate user
 */
router.put('/users/:id/activate', authenticate, isAdmin, adminController.activateUser)

/**
 * PUT /admin/users/:id/deactivate
 * Deactivate user
 */
router.put('/users/:id/deactivate', authenticate, isAdmin, adminController.deactivateUser)

/**
 * PUT /admin/users/:id/reset-password
 * Reset user password
 */
router.put('/users/:id/reset-password', authenticate, isAdmin, adminController.resetUserPassword)

/**
 * GET /admin/activity-logs?limit=50
 * Get activity logs
 */
router.get('/activity-logs', authenticate, isAdmin, adminController.getActivityLogs)

export default router
