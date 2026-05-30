import express from 'express'
import { hostelController } from '../controllers/hostel.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * Hostel Staff Routes
 */

// Get pending passes (PENDING_HOSTEL status)
router.get('/pending', authorize('HOSTEL_STAFF'), hostelController.getPendingPasses)

// Approve pass
router.put('/passes/:id/approve', authorize('HOSTEL_STAFF'), hostelController.approvePass)

// Reject pass
router.put('/passes/:id/reject', authorize('HOSTEL_STAFF'), hostelController.rejectPass)

// Get all passes with optional filter
router.get('/passes', authorize('HOSTEL_STAFF'), hostelController.getAllPasses)

// Get students directory
router.get('/students', authorize('HOSTEL_STAFF'), hostelController.getStudents)

// Get dashboard statistics
router.get('/dashboard', authorize('HOSTEL_STAFF'), hostelController.getDashboard)

export default router
