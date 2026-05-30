import * as studentService from '../services/student.service.js'
import { sendSuccess, sendError } from '../utils/response.js'

/**
 * Get student profile
 * GET /student/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const profile = await studentService.getStudentProfile(userId)

    if (!profile) {
      return sendError(res, 'Student profile not found', 404)
    }

    return sendSuccess(res, profile, 'Profile retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Create student profile
 * POST /student/profile
 */
export const createProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      usn,
      department_id,
      program_type,
      year_of_study,
      semester,
      gender,
      hostel_name,
      hostel_type,
      room_number,
      parent_phone,
      emergency_contact
    } = req.body

    // Check if profile already exists
    const existingProfile = await studentService.getStudentProfile(userId)
    if (existingProfile) {
      return sendError(res, 'Student profile already exists', 400)
    }

    const profile = await studentService.createStudentProfile({
      user_id: userId,
      usn,
      department_id,
      program_type,
      year_of_study,
      semester,
      gender,
      hostel_name,
      hostel_type,
      room_number,
      parent_phone,
      emergency_contact
    })

    return sendSuccess(res, profile, 'Profile created successfully', 201)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Update student profile
 * PUT /student/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      usn,
      department_id,
      program_type,
      year_of_study,
      semester,
      gender,
      hostel_name,
      hostel_type,
      room_number,
      parent_phone,
      emergency_contact
    } = req.body

    const profile = await studentService.updateStudentProfile(userId, {
      usn,
      department_id,
      program_type,
      year_of_study,
      semester,
      gender,
      hostel_name,
      hostel_type,
      room_number,
      parent_phone,
      emergency_contact
    })

    return sendSuccess(res, profile, 'Profile updated successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Check if student profile is complete
 * GET /student/profile/check
 */
export const checkProfileCompletion = async (req, res) => {
  try {
    const userId = req.user.id

    const isComplete = await studentService.isProfileComplete(userId)

    return sendSuccess(res, { isComplete }, 'Profile completion status retrieved', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

export default {
  getProfile,
  createProfile,
  updateProfile,
  checkProfileCompletion
}
