import { passRepository } from '../repositories/pass.repository.js'
import { gateLogRepository } from '../repositories/gateLog.repository.js'
import { successResponse, errorResponse } from '../utils/response.js'

export const securityController = {
  scanQR: async (req, res) => {
    try {
      const { qrCode } = req.body
      const passData = JSON.parse(qrCode)
      const pass = await passRepository.findById(passData.id)
      
      if (!pass) {
        return errorResponse(res, 'Pass not found', 404)
      }

      successResponse(res, pass, 'QR scanned successfully')
    } catch (error) {
      errorResponse(res, 'Invalid QR code', 400)
    }
  },

  markIN: async (req, res) => {
    try {
      const { passId } = req.params
      await gateLogRepository.create({
        pass_id: passId,
        action: 'IN'
      })
      successResponse(res, null, 'Marked IN successfully')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  markOUT: async (req, res) => {
    try {
      const { passId } = req.params
      await gateLogRepository.create({
        pass_id: passId,
        action: 'OUT'
      })
      successResponse(res, null, 'Marked OUT successfully')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  getScanLogs: async (req, res) => {
    try {
      const logs = await gateLogRepository.findAll()
      successResponse(res, logs, 'Scan logs retrieved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  }
}
