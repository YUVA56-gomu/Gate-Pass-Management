import express from 'express'
import { passController } from '../controllers/pass.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = express.Router()

router.use(authMiddleware)

// Student pass routes
router.post('/', authorize('STUDENT'), passController.createPass)
router.get('/my', authorize('STUDENT'), passController.getMyPasses)

// Get pass by ID (accessible by student who owns it, coordinators, hostel staff, security, admin)
router.get('/:id', passController.getPassById)

export default router
