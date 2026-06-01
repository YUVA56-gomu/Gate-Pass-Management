import express from 'express'
import { createPass, deletePass, getMyPasses, getPassById } from '../controllers/pass.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = express.Router()

router.use(authenticate)

// Student pass routes
router.post('/', authorize('STUDENT'), createPass)
router.get('/my', authorize('STUDENT'), getMyPasses)
router.delete('/:passId', authorize('STUDENT'), deletePass)

// Get pass by ID (accessible by student who owns it, coordinators, hostel staff, security, admin)
router.get('/:id', getPassById)

export default router
