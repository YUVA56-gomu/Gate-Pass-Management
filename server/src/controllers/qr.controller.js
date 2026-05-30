import * as qrService from '../services/qr.service.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { Pass, Student, User } from '../models/index.js'

/**
 * Generate QR Token for a pass
 * POST /qr/generate/:passId
 * Only HOSTEL_STAFF and ADMIN can generate QR tokens
 */
export const generateQRToken = async (req, res) => {
  try {
    const { passId } = req.params

    // Validation: passId provided
    if (!passId) {
      return sendError(res, 'Pass ID is required', 400)
    }

    const qrToken = await qrService.generateQRToken(passId)

    return sendSuccess(res, qrToken, 'QR token generated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Generate QR Code image for a token
 * POST /qr/code
 */
export const generateQRCode = async (req, res) => {
  try {
    const { token } = req.body

    // Validation: token provided
    if (!token) {
      return sendError(res, 'Token is required', 400)
    }

    const qrImage = await qrService.generateQRCode(token)

    return sendSuccess(res, { qrImage }, 'QR code generated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Verify QR Token
 * POST /qr/verify
 */
export const verifyQRToken = async (req, res) => {
  try {
    const { token } = req.body

    // Validation: token provided
    if (!token) {
      return sendError(res, 'Token is required', 400)
    }

    const verificationResult = await qrService.verifyQRToken(token)

    return sendSuccess(res, verificationResult, 'QR token verified successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get QR Token and Image for a pass
 * GET /qr/pass/:passId
 * Students can only access their own passes
 */
export const getQRForPass = async (req, res) => {
  try {
    const { passId } = req.params

    // Validation: passId provided
    if (!passId) {
      return sendError(res, 'Pass ID is required', 400)
    }

    // Authorization: Check if user can access this pass
    // Students can only access their own passes
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
        return sendError(res, 'You do not have permission to access this pass', 403)
      }
    }

    const qrData = await qrService.getQRForPass(passId)

    return sendSuccess(res, qrData, 'QR data retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Deactivate QR Token for a pass
 * PUT /qr/deactivate/:passId
 */
export const deactivateQR = async (req, res) => {
  try {
    const { passId } = req.params

    // Validation: passId provided
    if (!passId) {
      return sendError(res, 'Pass ID is required', 400)
    }

    // Authorization: Only HOSTEL_STAFF and ADMIN can deactivate
    if (!['HOSTEL_STAFF', 'ADMIN'].includes(req.user.role)) {
      return sendError(res, 'You do not have permission to deactivate QR tokens', 403)
    }

    const result = await qrService.deactivateQR(passId)

    return sendSuccess(res, result, 'QR token deactivated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get QR Token details
 * GET /qr/token/:token
 */
export const getQRTokenDetails = async (req, res) => {
  try {
    const { token } = req.params

    // Validation: token provided
    if (!token) {
      return sendError(res, 'Token is required', 400)
    }

    // Authorization: Only SECURITY and ADMIN can view token details
    if (!['SECURITY', 'ADMIN'].includes(req.user.role)) {
      return sendError(res, 'You do not have permission to view token details', 403)
    }

    const qrToken = await qrService.getQRTokenDetails(token)

    return sendSuccess(res, qrToken, 'QR token details retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export const qrController = {
  generateQRToken,
  generateQRCode,
  verifyQRToken,
  getQRForPass,
  deactivateQR,
  getQRTokenDetails
}

export default qrController
