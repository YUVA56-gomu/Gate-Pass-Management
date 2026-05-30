import express from 'express'
import { reportController } from '../controllers/report.controller.js'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.use(roleMiddleware(['admin']))

router.get('/stats', reportController.getDashboardStats)

export default router
