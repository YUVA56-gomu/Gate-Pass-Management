import * as pdfService from '../services/pdf.service.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { Pass, Student, User } from '../models/index.js'
import fs from 'fs'

// Verify student owns the pass
const verifyStudentOwnership = async (passId, userId) => {
  const pass = await Pass.findByPk(passId, {
    include: [{ model: Student, include: [{ model: User, attributes: ['id'] }] }]
  })
  if (!pass || !pass.Student || pass.Student.User.id !== userId) return false
  return true
}

/**
 * POST /pdf/generate/:passId
 * Generate (or regenerate) PDF for an approved pass
 */
export const generatePDF = async (req, res) => {
  try {
    const { passId } = req.params

    if (req.user.role === 'STUDENT') {
      const ok = await verifyStudentOwnership(passId, req.user.id)
      if (!ok) return sendError(res, 'You do not have permission to generate PDF for this pass', 403)
    }

    const result = await pdfService.generatePDF(passId)
    return sendSuccess(res, { fileName: result.fileName, generatedAt: result.generatedAt }, 'PDF generated successfully', 200)
  } catch (error) {
    console.error('[PDF CONTROLLER] generatePDF error:', error.message)
    return sendError(res, error.message, 400)
  }
}

/**
 * GET /pdf/download/:passId
 * Download PDF — auto-generates if not yet created
 */
export const downloadPDF = async (req, res) => {
  try {
    const { passId } = req.params

    if (req.user.role === 'STUDENT') {
      const ok = await verifyStudentOwnership(passId, req.user.id)
      if (!ok) return sendError(res, 'You do not have permission to download this PDF', 403)
    }

    // getPDFFilePath auto-generates if missing
    const { filePath, fileName } = await pdfService.getPDFFilePath(passId)

    if (!fs.existsSync(filePath)) {
      return sendError(res, 'PDF could not be generated', 500)
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Length', fs.statSync(filePath).size)
    fs.createReadStream(filePath).pipe(res)
  } catch (error) {
    console.error('[PDF CONTROLLER] downloadPDF error:', error.message)
    return sendError(res, error.message, 400)
  }
}

/**
 * GET /pdf/:passId
 * Get PDF metadata
 */
export const getPDFMetadata = async (req, res) => {
  try {
    const { passId } = req.params

    if (req.user.role === 'STUDENT') {
      const ok = await verifyStudentOwnership(passId, req.user.id)
      if (!ok) return sendError(res, 'You do not have permission to access this pass', 403)
    }

    const metadata = await pdfService.getPDFMetadata(passId)
    return sendSuccess(res, metadata, 'PDF metadata retrieved', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export const pdfController = { generatePDF, downloadPDF, getPDFMetadata }
export default pdfController
