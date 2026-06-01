import * as coordinatorService from '../services/coordinator.service.js'
import { sendSuccess, sendError } from '../utils/response.js'

/**
 * Get all coordinators
 */
export const getAllCoordinators = async (req, res) => {
  try {
    const coordinators = await coordinatorService.getAllCoordinators()
    return sendSuccess(res, coordinators, 'Coordinators retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get coordinators by department
 */
export const getCoordinatorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params
    const coordinators = await coordinatorService.getCoordinatorsByDepartment(departmentId)
    return sendSuccess(res, coordinators, 'Department coordinators retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}

/**
 * Get all active hostel staff (accessible to any authenticated user for dropdown)
 */
export const getAllHostelStaff = async (req, res) => {
  try {
    const hostelStaff = await coordinatorService.getAllHostelStaff()
    return sendSuccess(res, hostelStaff, 'Hostel staff retrieved successfully', 200)
  } catch (error) {
    return sendError(res, error.message, 400)
  }
}