import { passService } from '../services/pass.service.js'
import { passRepository } from '../repositories/pass.repository.js'
import { successResponse, errorResponse } from '../utils/response.js'
import fs from 'fs'

export const passController = {
  createPass: async (req, res) => {
    try {
      const pass = await passService.createPass({
        ...req.body,
        student_id: req.user.id
      })
      successResponse(res, pass, 'Pass created successfully', 201)
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  getMyPasses: async (req, res) => {
    try {
      const passes = await passService.getStudentPasses(req.user.id)
      successResponse(res, passes, 'Passes retrieved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  getPassById: async (req, res) => {
    try {
      const pass = await passService.getPassById(req.params.id)
      if (!pass) {
        return errorResponse(res, 'Pass not found', 404)
      }
      successResponse(res, pass, 'Pass retrieved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  downloadPDF: async (req, res) => {
    try {
      const pass = await passRepository.findById(req.params.id)
      if (!pass || !pass.pdf_path) {
        return errorResponse(res, 'PDF not found', 404)
      }
      res.download(pass.pdf_path)
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  },

  getQRCode: async (req, res) => {
    try {
      const pass = await passRepository.findById(req.params.id)
      if (!pass || !pass.qr_code) {
        return errorResponse(res, 'QR code not found', 404)
      }
      res.sendFile(pass.qr_code)
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  }
}
