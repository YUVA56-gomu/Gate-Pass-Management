import express from 'express'
import { pdfController } from '../controllers/pdf.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * PDF Routes
 */

// Generate PDF for a pass
// Students can generate PDF for their own passes
// Hostel Staff and Admin can generate PDF for any pass
router.post('/generate/:passId', authorize('STUDENT', 'HOSTEL_STAFF', 'ADMIN'), pdfController.generatePDF)

// Download PDF file
// Students can download their own pass PDFs
// Hostel Staff and Admin can download any pass PDF
router.get('/download/:passId', authorize('STUDENT', 'HOSTEL_STAFF', 'ADMIN'), pdfController.downloadPDF)

// Get PDF metadata
// Students can access metadata for their own passes
// Hostel Staff and Admin can access metadata for any pass
router.get('/:passId', authorize('STUDENT', 'HOSTEL_STAFF', 'ADMIN'), pdfController.getPDFMetadata)

export default router
