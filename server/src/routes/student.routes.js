import express from 'express'
import * as studentController from '../controllers/student.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * Student Profile Routes
 */

// Get student profile
router.get('/profile', authorize('STUDENT'), studentController.getProfile)

// Create student profile
router.post('/profile', authorize('STUDENT'), studentController.createProfile)

// Update student profile
router.put('/profile', authorize('STUDENT'), studentController.updateProfile)

// Check profile completion
router.get('/profile/check', authorize('STUDENT'), studentController.checkProfileCompletion)

export default router
