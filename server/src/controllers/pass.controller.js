import { passService } from '../services/pass.service.js'
import { passRepository } from '../repositories/pass.repository.js'
import * as studentService from '../services/student.service.js'
import { sendSuccess, sendError } from '../utils/response.js'

export const createPass = async (req, res) => {
  try {
    const userId = req.user.id
    const { pass_type, reason, destination, pass_date, from_date, to_date, exit_time, expected_return_time, parent_contact } = req.body

    console.log('[PASS CONTROLLER] Creating pass for user:', userId)
    console.log('[PASS CONTROLLER] Request body:', {
      pass_type,
      reason,
      destination,
      pass_date,
      from_date,
      to_date,
      exit_time,
      expected_return_time,
      parent_contact
    })

    // Check if student profile is complete
    const isComplete = await studentService.isProfileComplete(userId)
    if (!isComplete) {
      return sendError(res, 'Student profile must be completed before creating a pass', 400)
    }

    // Get student ID from user ID
    const student = await studentService.getStudentByUserId(userId)
    if (!student) {
      return sendError(res, 'Student profile not found', 404)
    }

    console.log('[PASS CONTROLLER] Student found:', { id: student.id, department_id: student.department_id })

    // Create pass
    const pass = await passService.createPass({
      student_id: student.id,
      pass_type,
      reason,
      destination,
      pass_date,
      from_date,
      to_date,
      exit_time,
      expected_return_time,
      parent_contact
    })

    console.log('[PASS CONTROLLER] Pass created successfully:', {
      id: pass.id,
      pass_type: pass.pass_type,
      coordinator_id: pass.coordinator_id,
      status: pass.status
    })

    return sendSuccess(res, pass, 'Pass created successfully', 201)
  } catch (error) {
    console.error('[PASS CONTROLLER] Error creating pass:', error.message)
    return sendError(res, error.message, 400)
  }
}

export const getMyPasses = async (req, res) => {
  try {
    const userId = req.user.id

    // Get student ID from user ID
    const student = await studentService.getStudentByUserId(userId)
    if (!student) {
      return sendError(res, 'Student profile not found', 404)
    }

    const passes = await passService.getStudentPasses(student.id)
    return sendSuccess(res, passes, 'Passes retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export const getPassById = async (req, res) => {
  try {
    const pass = await passService.getPassById(req.params.id)
    if (!pass) {
      return sendError(res, 'Pass not found', 404)
    }

    // Check if user owns this pass
    const userId = req.user.id
    const student = await studentService.getStudentByUserId(userId)

    if (pass.student_id !== student.id && req.user.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized', 403)
    }

    return sendSuccess(res, pass, 'Pass retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export const passController = {
  createPass,
  getMyPasses,
  getPassById
}
