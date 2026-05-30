import express from 'express'
import { securityController } from '../controllers/security.controller.js'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)
router.use(roleMiddleware(['security']))

router.post('/scan', securityController.scanQR)
router.post('/mark-in/:passId', securityController.markIN)
router.post('/mark-out/:passId', securityController.markOUT)
router.get('/logs', securityController.getScanLogs)

export default router
