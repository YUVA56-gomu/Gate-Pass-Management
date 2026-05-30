import express from 'express'
import { qrController } from '../controllers/qr.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * QR Token Routes
 */

// Generate QR Token for a pass
// Only HOSTEL_STAFF and ADMIN can generate QR tokens
// QR generation should happen only after final approval
router.post('/generate/:passId', authorize('HOSTEL_STAFF', 'ADMIN'), qrController.generateQRToken)

// Generate QR Code image from token
router.post('/code', authorize('STUDENT', 'HOSTEL_STAFF', 'ADMIN', 'SECURITY'), qrController.generateQRCode)

// Verify QR Token
// Only SECURITY and ADMIN can verify QR tokens
router.post('/verify', authorize('SECURITY', 'ADMIN'), qrController.verifyQRToken)

// Get QR Token and Image for a pass
// Students can access only their own passes
// Hostel Staff and Admin can access all passes
router.get('/pass/:passId', authorize('STUDENT', 'HOSTEL_STAFF', 'ADMIN'), qrController.getQRForPass)

// Deactivate QR Token for a pass
router.put('/deactivate/:passId', authorize('HOSTEL_STAFF', 'ADMIN'), qrController.deactivateQR)

// Get QR Token details
// Only SECURITY and ADMIN can view token details
router.get('/token/:token', authorize('SECURITY', 'ADMIN'), qrController.getQRTokenDetails)

export default router
