import express from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/role.middleware.js'
import * as reportController from '../controllers/report.controller.js'

const router = express.Router()

/**
 * All report routes require authentication and ADMIN role
 */

/**
 * GET /reports/overview
 * Get overall system statistics
 */
router.get('/overview', authenticate, isAdmin, reportController.getOverview)

/**
 * GET /reports/departments
 * Get department-wise pass statistics
 */
router.get('/departments', authenticate, isAdmin, reportController.getDepartments)

/**
 * GET /reports/monthly
 * Get monthly pass statistics
 */
router.get('/monthly', authenticate, isAdmin, reportController.getMonthly)

/**
 * GET /reports/pass-types
 * Get pass type statistics
 */
router.get('/pass-types', authenticate, isAdmin, reportController.getPassTypes)

/**
 * GET /reports/security
 * Get security statistics
 */
router.get('/security', authenticate, isAdmin, reportController.getSecurity)

/**
 * GET /reports/coordinators
 * Get coordinator performance statistics
 */
router.get('/coordinators', authenticate, isAdmin, reportController.getCoordinators)

/**
 * GET /reports/hostel-staff
 * Get hostel staff performance statistics
 */
router.get('/hostel-staff', authenticate, isAdmin, reportController.getHostelStaff)

/**
 * GET /reports/export/csv?type=overall|departments|monthly|passTypes|coordinators|hostelStaff
 * Export report as CSV
 */
router.get('/export/csv', authenticate, isAdmin, reportController.exportCSV)

/**
 * GET /reports/export/pdf?type=overall|departments|monthly|passTypes|security|coordinators|hostelStaff
 * Export report as PDF (prepare data)
 */
router.get('/export/pdf', authenticate, isAdmin, reportController.exportPDF)

export default router
