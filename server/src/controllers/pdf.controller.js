import * as pdfService from '../services/pdf.service.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { Pass, Student, User } from '../models/index.js'
import fs from 'fs'

/**
 * Generate PDF for a pass
 * POST /pdf/generate/:passId
 */
export const generatePDF = async (req, res) => {
  try {
    const { passId } = req.params

    // Validation: passId provided
    if (!passId) {
      return sendError(res, 'Pass ID is required', 400)
    }

    // Authorization: Check if user can generate PDF for this pass
    if (req.user.role === 'STUDENT') {
      // Fetch pass with student and user details to verify ownership
      const pass = await Pass.findByPk(passId, {
        include: [
          {
            model: Student,
            include: [
              {
                model: User,
                attributes: ['id']
              }
            ]
          }
        ]
      })

      // Verify pass exists and student owns it
      if (!pass || !pass.Student || pass.Student.User.id !== req.user.id) {
        return sendError(res, 'You do not have permission to generate PDF for this pass', 403)
      }
    }

    const pdfData = await pdfService.generatePDF(passId)

    return sendSuccess(res, pdfData, 'PDF generated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Download PDF file
 * GET /pdf/download/:passId
 */
export const downloadPDF = async (req, res) => {
  try {
    const { passId } = req.params

    // Validation: passId provided
    if (!passId) {
      return sendError(res, 'Pass ID is required', 400)
    }

    // Authorization: Check if user can download PDF for this pass
    if (req.user.role === 'STUDENT') {
      // Fetch pass with student and user details to verify ownership
      const pass = await Pass.findByPk(passId, {
        include: [
          {
            model: Student,
            include: [
              {
                model: User,
                attributes: ['id']
              }
            ]
          }
        ]
      })

      // Verify pass exists and student owns it
      if (!pass || !pass.Student || pass.Student.User.id !== req.user.id) {
        return sendError(res, 'You do not have permission to download PDF for this pass', 403)
      }
    }

    const pdfData = await pdfService.downloadPDF(passId)

    // Check if file exists
    if (!fs.existsSync(pdfData.filePath)) {
      return sendError(res, 'PDF file not found', 404)
    }

    // Send file
    res.download(pdfData.filePath, pdfData.fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err)
      }
    })
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get PDF metadata
 * GET /pdf/:passId
 */
export const getPDFMetadata = async (req, res) => {
  try {
    const { passId } = req.params

    // Validation: passId provided
    if (!passId) {
      return sendError(res, 'Pass ID is required', 400)
    }

    // Authorization: Check if user can access PDF metadata for this pass
    if (req.user.role === 'STUDENT') {
      // Fetch pass with student and user details to verify ownership
      const pass = await Pass.findByPk(passId, {
        include: [
          {
            model: Student,
            include: [
              {
                model: User,
                attributes: ['id']
              }
            ]
          }
        ]
      })

      // Verify pass exists and student owns it
      if (!pass || !pass.Student || pass.Student.User.id !== req.user.id) {
        return sendError(res, 'You do not have permission to access PDF metadata for this pass', 403)
      }
    }

    const metadata = await pdfService.getPDFMetadata(passId)

    return sendSuccess(res, metadata, 'PDF metadata retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export const pdfController = {
  generatePDF,
  downloadPDF,
  getPDFMetadata
}

export default pdfController
