import express from 'express'
import { approvalController } from '../controllers/approval.controller.js'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/pending', roleMiddleware(['coordinator', 'hostel_staff']), approvalController.getPendingRequests)
router.post('/:id/approve', roleMiddleware(['coordinator', 'hostel_staff']), approvalController.approveRequest)
router.post('/:id/reject', roleMiddleware(['coordinator', 'hostel_staff']), approvalController.rejectRequest)
router.get('/history', roleMiddleware(['coordinator', 'hostel_staff']), approvalController.getHistory)

export default router
