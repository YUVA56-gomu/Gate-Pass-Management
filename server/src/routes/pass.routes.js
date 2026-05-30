import express from 'express'
import { passController } from '../controllers/pass.controller.js'
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/', roleMiddleware(['student']), passController.createPass)
router.get('/my-passes', roleMiddleware(['student']), passController.getMyPasses)
router.get('/:id', passController.getPassById)
router.get('/:id/pdf', passController.downloadPDF)
router.get('/:id/qr', passController.getQRCode)

export default router
