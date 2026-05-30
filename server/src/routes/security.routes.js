import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isSecurity } from '../middleware/role.middleware.js'
import * as securityController from '../controllers/security.controller.js'

const router = express.Router()

/**
 * All security routes require authentication and SECURITY role
 */

/**
 * POST /security/scan
 * Scan QR Token and create gate log
 */
router.post('/scan', authenticate, isSecurity, securityController.scanQR)

/**
 * GET /security/logs/today
 * Get today's gate logs
 */
router.get('/logs/today', authenticate, isSecurity, securityController.getTodayLogs)

/**
 * GET /security/logs?filter=ALL|OUT|IN|TODAY
 * Get all gate logs with optional filters
 */
router.get('/logs', authenticate, isSecurity, securityController.getAllLogs)

/**
 * GET /security/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', authenticate, isSecurity, securityController.getDashboard)

export default router
