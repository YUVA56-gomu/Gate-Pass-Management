import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
import { sequelize } from '../config/db.js'
import { Pass, QRToken, Student, User, Department, Approval } from '../models/index.js'

/**
 * Generate QR Token for an approved pass
 * Uses transaction to prevent race conditions
 */
export const generateQRToken = async (passId) => {
  const transaction = await sequelize.transaction()

  try {
    // Fetch the pass with lock
    const pass = await Pass.findByPk(passId, { transaction, lock: true })

    // Validation: Pass exists
    if (!pass) {
      await transaction.rollback()
      throw new Error('Pass not found')
    }

    // Validation: Pass status must be APPROVED
    if (pass.status !== 'APPROVED') {
      await transaction.rollback()
      throw new Error('QR can only be generated for approved passes')
    }

    // Check if active QR already exists for this pass
    const existingQR = await QRToken.findOne({
      where: {
        pass_id: passId,
        is_active: true
      },
      transaction
    })

    // If active QR exists, return it
    if (existingQR) {
      await transaction.commit()
      return existingQR
    }

    // Deactivate any previous QR tokens for this pass
    await QRToken.update(
      { is_active: false },
      {
        where: {
          pass_id: passId
        },
        transaction
      }
    )

    // Generate UUID token
    const token = uuidv4()

    // Create QR token record
    const qrToken = await QRToken.create(
      {
        pass_id: passId,
        token: token,
        is_active: true,
        expires_at: null // Can be set later if needed
      },
      { transaction }
    )

    await transaction.commit()
    return qrToken
  } catch (error) {
    await transaction.rollback()
    throw new Error(`Failed to generate QR token: ${error.message}`)
  }
}

/**
 * Generate QR Code image from token
 */
export const generateQRCode = async (token) => {
  try {
    // Validation: Token exists
    if (!token) {
      throw new Error('Token is required')
    }

    // Create QR code data (only token, no sensitive data)
    const qrData = JSON.stringify({
      token: token
    })

    // Generate QR code as data URL (Base64)
    const qrImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    })

    return qrImage
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`)
  }
}

/**
 * Generate QR Code image as buffer
 */
export const generateQRCodeBuffer = async (token) => {
  try {
    // Validation: Token exists
    if (!token) {
      throw new Error('Token is required')
    }

    // Create QR code data (only token, no sensitive data)
    const qrData = JSON.stringify({
      token: token
    })

    // Generate QR code as buffer
    const qrBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    })

    return qrBuffer
  } catch (error) {
    throw new Error(`Failed to generate QR code buffer: ${error.message}`)
  }
}

/**
 * Verify QR Token and return pass details
 * Enhanced response structure with future-ready fields
 */
export const verifyQRToken = async (token) => {
  try {
    // Validation: Token provided
    if (!token) {
      throw new Error('Token is required')
    }

    // Find QR token record
    const qrToken = await QRToken.findOne({
      where: {
        token: token
      }
    })

    // Validation: QR token exists
    if (!qrToken) {
      throw new Error('Invalid QR token')
    }

    // Validation: QR token is active
    if (!qrToken.is_active) {
      throw new Error('QR token is inactive')
    }

    // Validation: QR token not expired (if expires_at is set)
    if (qrToken.expires_at && new Date(qrToken.expires_at) < new Date()) {
      throw new Error('QR token has expired')
    }

    // Fetch pass details
    const pass = await Pass.findByPk(qrToken.pass_id, {
      include: [
        {
          model: Student,
          attributes: ['id', 'usn', 'program_type', 'year_of_study', 'semester', 'hostel_name', 'room_number'],
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            },
            {
              model: Department,
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    })

    // Validation: Pass exists
    if (!pass) {
      throw new Error('Pass not found')
    }

    // Validation: Pass status is APPROVED
    if (pass.status !== 'APPROVED') {
      throw new Error('Pass is not approved')
    }

    // Fetch approval details
    const approval = await Approval.findOne({
      where: {
        pass_id: qrToken.pass_id,
        status: 'APPROVED'
      },
      order: [['approved_at', 'DESC']]
    })

    // Enhanced response structure with future-ready fields
    return {
      passDetails: {
        id: pass.id,
        student_id: pass.student_id,
        pass_type: pass.pass_type,
        status: pass.status,
        from_date: pass.from_date,
        to_date: pass.to_date,
        reason: pass.reason,
        destination: pass.destination,
        created_at: pass.created_at
      },
      studentDetails: {
        id: pass.Student.id,
        usn: pass.Student.usn,
        program_type: pass.Student.program_type,
        year_of_study: pass.Student.year_of_study,
        semester: pass.Student.semester,
        hostel_name: pass.Student.hostel_name,
        room_number: pass.Student.room_number,
        user: {
          id: pass.Student.User.id,
          name: pass.Student.User.name,
          email: pass.Student.User.email
        },
        department: {
          id: pass.Student.Department.id,
          name: pass.Student.Department.name,
          code: pass.Student.Department.code
        }
      },
      approvalDetails: approval ? {
        id: approval.id,
        approved_by: approval.approved_by,
        stage: approval.stage,
        status: approval.status,
        remarks: approval.remarks,
        approved_at: approval.approved_at
      } : null,
      qrMetadata: {
        token: qrToken.token,
        generatedAt: qrToken.createdAt,
        expiresAt: qrToken.expires_at,
        isActive: qrToken.is_active
      },
      scanStatus: null // Future: will be populated by Security module
    }
  } catch (error) {
    throw new Error(`Failed to verify QR token: ${error.message}`)
  }
}

/**
 * Get QR Token for a pass
 */
export const getQRForPass = async (passId) => {
  try {
    // Fetch the pass
    const pass = await Pass.findByPk(passId)

    // Validation: Pass exists
    if (!pass) {
      throw new Error('Pass not found')
    }

    // Validation: Pass status must be APPROVED
    if (pass.status !== 'APPROVED') {
      throw new Error('QR is only available for approved passes')
    }

    // Find active QR token
    const qrToken = await QRToken.findOne({
      where: {
        pass_id: passId,
        is_active: true
      }
    })

    // If no active QR, generate one
    let token = qrToken
    if (!qrToken) {
      token = await generateQRToken(passId)
    }

    // Generate QR image
    const qrImage = await generateQRCode(token.token)

    return {
      token: token.token,
      qrImage: qrImage,
      generatedAt: token.createdAt,
      expiresAt: token.expires_at
    }
  } catch (error) {
    throw new Error(`Failed to get QR for pass: ${error.message}`)
  }
}

/**
 * Deactivate QR Token for a pass
 */
export const deactivateQR = async (passId) => {
  try {
    // Fetch the pass
    const pass = await Pass.findByPk(passId)

    // Validation: Pass exists
    if (!pass) {
      throw new Error('Pass not found')
    }

    // Deactivate all QR tokens for this pass
    const result = await QRToken.update(
      { is_active: false },
      {
        where: {
          pass_id: passId
        }
      }
    )

    return {
      passId: passId,
      deactivatedCount: result[0]
    }
  } catch (error) {
    throw new Error(`Failed to deactivate QR: ${error.message}`)
  }
}

/**
 * Get QR Token details
 */
export const getQRTokenDetails = async (token) => {
  try {
    // Validation: Token provided
    if (!token) {
      throw new Error('Token is required')
    }

    // Find QR token record
    const qrToken = await QRToken.findOne({
      where: {
        token: token
      }
    })

    // Validation: QR token exists
    if (!qrToken) {
      throw new Error('QR token not found')
    }

    return qrToken
  } catch (error) {
    throw new Error(`Failed to get QR token details: ${error.message}`)
  }
}

export default {
  generateQRToken,
  generateQRCode,
  generateQRCodeBuffer,
  verifyQRToken,
  getQRForPass,
  deactivateQR,
  getQRTokenDetails
}
