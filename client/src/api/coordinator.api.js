import axiosInstance from './axios'

/**
 * Get all active coordinators
 * @returns {Promise<object>} List of coordinators
 */
export const getAllCoordinators = async () => {
  const response = await axiosInstance.get('/coordinators')
  return response.data
}

/**
 * Get coordinators by department
 * @param {number} departmentId - Department ID
 * @returns {Promise<object>} List of department coordinators
 */
export const getCoordinatorsByDepartment = async (departmentId) => {
  const response = await axiosInstance.get(`/coordinators/department/${departmentId}`)
  return response.data
}

/**
 * Get all active hostel staff (for pass application dropdowns)
 * @returns {Promise<object>} List of hostel staff
 */
export const getHostelStaff = async () => {
  const response = await axiosInstance.get('/coordinators/hostel-staff')
  return response.data
}

export default {
  getAllCoordinators,
  getCoordinatorsByDepartment,
  getHostelStaff
}
