import express from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'

const router = express.Router()

/**
 * Public Routes
 */

// Register new student
router.post('/register', authController.register)

// Login
router.post('/login', authController.login)

/**
 * Protected Routes - Requires Authentication
 */

// Get current user
router.get('/me', authenticate, authController.getCurrentUser)

// Logout
router.post('/logout', authenticate, authController.logout)

// Change password
router.post('/change-password', authenticate, authController.changePassword)

/**
 * Admin Routes - Requires Admin Role
 */

// Create user (Admin only)
router.post('/users', authenticate, isAdmin, authController.createUser)

// Get all users (Admin only)
router.get('/users', authenticate, isAdmin, authController.getAllUsers)

// Get user by ID (Admin only)
router.get('/users/:id', authenticate, isAdmin, authController.getUserById)

// Update user (Admin only)
router.put('/users/:id', authenticate, isAdmin, authController.updateUser)

// Deactivate user (Admin only)
router.post('/users/:id/deactivate', authenticate, isAdmin, authController.deactivateUser)

// Activate user (Admin only)
router.post('/users/:id/activate', authenticate, isAdmin, authController.activateUser)

export default router
