import { User } from '../models/index.js'

/**
 * Get all active coordinators
 */
export const getAllCoordinators = async () => {
  try {
    const coordinators = await User.findAll({
      where: {
        role: 'COORDINATOR',
        is_active: true
      },
      attributes: ['id', 'name', 'email', 'phone'],
      order: [['name', 'ASC']]
    })
    return coordinators
  } catch (error) {
    throw new Error(`Failed to get coordinators: ${error.message}`)
  }
}

/**
 * Get coordinators by department
 * Returns all active coordinators (department-specific mapping can be added later)
 */
export const getCoordinatorsByDepartment = async (departmentId) => {
  try {
    const coordinators = await User.findAll({
      where: {
        role: 'COORDINATOR',
        is_active: true
      },
      attributes: ['id', 'name', 'email', 'phone'],
      order: [['name', 'ASC']]
    })
    return coordinators
  } catch (error) {
    throw new Error(`Failed to get coordinators for department: ${error.message}`)
  }
}

/**
 * Get all active hostel staff (used for student pass application dropdowns)
 */
export const getAllHostelStaff = async () => {
  try {
    const hostelStaff = await User.findAll({
      where: {
        role: 'HOSTEL_STAFF',
        is_active: true
      },
      attributes: ['id', 'name', 'email', 'phone'],
      order: [['name', 'ASC']]
    })
    return hostelStaff
  } catch (error) {
    throw new Error(`Failed to get hostel staff: ${error.message}`)
  }
}
