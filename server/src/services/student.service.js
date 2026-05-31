import { User, Student, Department } from '../models/index.js'

/**
 * Get student profile by user ID
 */
export const getStudentProfile = async (userId) => {
  try {
    const student = await Student.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'role']
        },
        {
          model: Department,
          attributes: ['id', 'name', 'code']
        }
      ]
    })

    return student
  } catch (error) {
    throw new Error(`Failed to get student profile: ${error.message}`)
  }
}

/**
 * Create student profile
 */
export const createStudentProfile = async (data) => {
  try {
    // Validate required fields
    const requiredFields = [
      'user_id',
      'usn',
      'department_id',
      'program_type',
      'year_of_study',
      'semester',
      'gender'
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`)
      }
    }

    // Validate program_type
    if (!['UG', 'PG'].includes(data.program_type)) {
      throw new Error('program_type must be UG or PG')
    }

    // Validate gender
    if (!['MALE', 'FEMALE', 'OTHER'].includes(data.gender)) {
      throw new Error('gender must be MALE, FEMALE, or OTHER')
    }

    // Validate year_of_study based on program_type
    if (data.program_type === 'UG') {
      if (data.year_of_study < 1 || data.year_of_study > 4) {
        throw new Error('UG year_of_study must be between 1 and 4')
      }
    } else if (data.program_type === 'PG') {
      if (data.year_of_study < 1 || data.year_of_study > 2) {
        throw new Error('PG year_of_study must be between 1 and 2')
      }
    }

    // Validate semester based on program_type
    if (data.program_type === 'UG') {
      if (data.semester < 1 || data.semester > 8) {
        throw new Error('UG semester must be between 1 and 8')
      }
    } else if (data.program_type === 'PG') {
      if (data.semester < 1 || data.semester > 4) {
        throw new Error('PG semester must be between 1 and 4')
      }
    }

    // Check if USN is unique
    const existingUSN = await Student.findOne({
      where: { usn: data.usn }
    })

    if (existingUSN) {
      throw new Error('USN already exists')
    }

    // Check if department exists
    const department = await Department.findByPk(data.department_id)
    if (!department) {
      throw new Error('Department not found')
    }

    // Create student profile
    const student = await Student.create(data)

    // Return with associations
    return getStudentProfile(data.user_id)
  } catch (error) {
    throw new Error(`Failed to create student profile: ${error.message}`)
  }
}

/**
 * Update student profile
 */
export const updateStudentProfile = async (userId, data) => {
  try {
    console.log('[updateStudentProfile] ===== UPDATE SERVICE START =====')
    console.log('[updateStudentProfile] userId:', userId)
    console.log('[updateStudentProfile] data:', data)
    
    // Get existing student
    const student = await Student.findOne({
      where: { user_id: userId }
    })
    
    console.log('[updateStudentProfile] Found student:', student?.id, 'for user:', userId)

    if (!student) {
      throw new Error('Student profile not found')
    }

    // Validate program_type if provided
    if (data.program_type && !['UG', 'PG'].includes(data.program_type)) {
      throw new Error('program_type must be UG or PG')
    }

    // Validate gender if provided
    if (data.gender && !['MALE', 'FEMALE', 'OTHER'].includes(data.gender)) {
      throw new Error('gender must be MALE, FEMALE, or OTHER')
    }

    // Validate year_of_study if provided
    const programType = data.program_type || student.program_type
    if (data.year_of_study) {
      if (programType === 'UG') {
        if (data.year_of_study < 1 || data.year_of_study > 4) {
          throw new Error('UG year_of_study must be between 1 and 4')
        }
      } else if (programType === 'PG') {
        if (data.year_of_study < 1 || data.year_of_study > 2) {
          throw new Error('PG year_of_study must be between 1 and 2')
        }
      }
    }

    // Validate semester if provided
    if (data.semester) {
      if (programType === 'UG') {
        if (data.semester < 1 || data.semester > 8) {
          throw new Error('UG semester must be between 1 and 8')
        }
      } else if (programType === 'PG') {
        if (data.semester < 1 || data.semester > 4) {
          throw new Error('PG semester must be between 1 and 4')
        }
      }
    }

    // Check if USN is unique (if being updated)
    if (data.usn && data.usn !== student.usn) {
      console.log('[updateStudentProfile] Checking USN uniqueness:', data.usn)
      const existingUSN = await Student.findOne({
        where: { usn: data.usn }
      })

      if (existingUSN) {
        throw new Error('USN already exists')
      }
    }

    // Check if department exists (if being updated)
    if (data.department_id && data.department_id !== student.department_id) {
      console.log('[updateStudentProfile] Checking department exists:', data.department_id)
      const department = await Department.findByPk(data.department_id)
      if (!department) {
        throw new Error('Department not found')
      }
    }

    // Update student profile
    console.log('[updateStudentProfile] Updating student with data:', data)
    await student.update(data)
    console.log('[updateStudentProfile] Update successful')

    // Return with associations
    const updatedProfile = await getStudentProfile(userId)
    console.log('[updateStudentProfile] ===== UPDATE SERVICE SUCCESS =====')
    return updatedProfile
  } catch (error) {
    console.error('[updateStudentProfile] ===== UPDATE SERVICE ERROR =====')
    console.error('[updateStudentProfile] Error:', error.message)
    console.error('[updateStudentProfile] Stack:', error.stack)
    throw new Error(`Failed to update student profile: ${error.message}`)
  }
}

/**
 * Check if student profile is complete
 */
export const isProfileComplete = async (userId) => {
  try {
    const student = await Student.findOne({
      where: { user_id: userId }
    })

    if (!student) {
      return false
    }

    // Check if all required fields are filled
    const requiredFields = [
      'usn',
      'department_id',
      'program_type',
      'year_of_study',
      'semester',
      'gender'
    ]

    for (const field of requiredFields) {
      if (!student[field]) {
        return false
      }
    }

    return true
  } catch (error) {
    throw new Error(`Failed to check profile completion: ${error.message}`)
  }
}

/**
 * Get student by user ID
 */
export const getStudentByUserId = async (userId) => {
  try {
    const student = await Student.findOne({
      where: { user_id: userId }
    })

    return student
  } catch (error) {
    throw new Error(`Failed to get student: ${error.message}`)
  }
}

export default {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,
  isProfileComplete,
  getStudentByUserId
}
