import express from 'express'
import { getAllCoordinators, getCoordinatorsByDepartment, getAllHostelStaff } from '../controllers/coordinator.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// Get all active coordinators (any authenticated user — needed for student pass form)
router.get('/', authenticate, getAllCoordinators)

// Get coordinators by department
router.get('/department/:departmentId', authenticate, getCoordinatorsByDepartment)

// Get all active hostel staff (any authenticated user — needed for student pass form)
router.get('/hostel-staff', authenticate, getAllHostelStaff)

export default router
