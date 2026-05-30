import express from 'express'
import { approvalController } from '../controllers/approval.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * Coordinator Approval Routes
 */

// Get pending long leave requests
router.get('/pending', authorize('COORDINATOR'), approvalController.getPendingRequests)

// Approve long leave request
router.put('/:id/approve', authorize('COORDINATOR'), approvalController.approveRequest)

// Reject long leave request
router.put('/:id/reject', authorize('COORDINATOR'), approvalController.rejectRequest)

// Get approval history
router.get('/history', authorize('COORDINATOR'), approvalController.getHistory)

export default router
