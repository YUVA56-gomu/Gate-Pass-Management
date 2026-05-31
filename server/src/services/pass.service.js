import { passRepository } from '../repositories/pass.repository.js'
import { approvalRepository } from '../repositories/approval.repository.js'
import User from '../models/User.js'
import Student from '../models/Student.js'

/**
 * Parse date string to YYYY-MM-DD format
 * Handles both YYYY-MM-DD and MM/DD/YYYY formats
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null
  
  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  
  // Parse MM/DD/YYYY format
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [month, day, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  return dateStr
}

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
const getTodayDate = () => {
  const today = new Date()
  const year = today.getUTCFullYear()
  const month = String(today.getUTCMonth() + 1).padStart(2, '0')
  const day = String(today.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Compare two dates in YYYY-MM-DD format
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
const compareDate = (date1, date2) => {
  if (date1 < date2) return -1
  if (date1 > date2) return 1
  return 0
}

/**
 * Find coordinator for a student's department
 */
const findCoordinatorForDepartment = async (departmentId) => {
  try {
    const coordinator = await User.findOne({
      where: {
        role: 'COORDINATOR',
        is_active: true
      },
      attributes: ['id', 'name', 'email', 'phone']
    })
    
    if (coordinator) {
      console.log(`[COORDINATOR ASSIGNMENT] Found coordinator: ${coordinator.name} (ID: ${coordinator.id}) for department ${departmentId}`)
      return coordinator
    }
    
    console.log(`[COORDINATOR ASSIGNMENT] No coordinator found for department ${departmentId}`)
    return null
  } catch (error) {
    console.error('[COORDINATOR ASSIGNMENT] Error finding coordinator:', error.message)
    return null
  }
}

export const passService = {
  createPass: async (data) => {
    console.log('[PASS SERVICE] Creating pass with data:', {
      pass_type: data.pass_type,
      reason: data.reason,
      destination: data.destination,
      pass_date: data.pass_date,
      from_date: data.from_date,
      to_date: data.to_date
    })

    // Validate pass type
    if (!['DAILY', 'LONG_LEAVE'].includes(data.pass_type)) {
      throw new Error('Pass type must be DAILY or LONG_LEAVE')
    }

    const today = getTodayDate()
    console.log(`[PASS SERVICE] Today's date (UTC): ${today}`)

    // DAILY PASS VALIDATION
    if (data.pass_type === 'DAILY') {
      if (!data.pass_date) {
        throw new Error('Pass date is required for daily pass')
      }

      const passDate = parseDate(data.pass_date)
      console.log(`[PASS SERVICE] Daily pass date: ${passDate}`)

      // Pass date cannot be in the past
      if (compareDate(passDate, today) < 0) {
        throw new Error('Pass date cannot be in the past')
      }

      // Auto-assign coordinator for daily pass
      const student = await Student.findByPk(data.student_id)
      let coordinatorId = null

      if (student && student.department_id) {
        const coordinator = await findCoordinatorForDepartment(student.department_id)
        if (coordinator) {
          coordinatorId = coordinator.id
        }
      }

      const passData = {
        ...data,
        pass_type: 'DAILY',
        pass_date: passDate,
        from_date: null,
        to_date: null,
        coordinator_id: coordinatorId,
        status: 'PENDING_HOSTEL'
      }

      const pass = await passRepository.create(passData)
      console.log(`[PASS SERVICE] Daily pass created with ID: ${pass.id}, Coordinator ID: ${coordinatorId}`)

      // Create hostel staff approval record
      await approvalRepository.create({
        pass_id: pass.id,
        stage: 'HOSTEL_STAFF',
        status: 'PENDING'
      })

      return pass
    }

    // LONG LEAVE VALIDATION
    if (data.pass_type === 'LONG_LEAVE') {
      if (!data.from_date || !data.to_date) {
        throw new Error('Leaving date and returning date are required for long leave')
      }

      if (!data.parent_contact) {
        throw new Error('Parent contact is required for long leave')
      }

      const fromDate = parseDate(data.from_date)
      const toDate = parseDate(data.to_date)

      console.log(`[PASS SERVICE] Long leave - From: ${fromDate}, To: ${toDate}`)

      // Leaving date cannot be in the past
      if (compareDate(fromDate, today) < 0) {
        throw new Error('Leaving date cannot be in the past')
      }

      // Returning date must be after leaving date
      if (compareDate(toDate, fromDate) <= 0) {
        throw new Error('Returning date must be after leaving date')
      }

      // Auto-assign coordinator for long leave
      const student = await Student.findByPk(data.student_id)
      let coordinatorId = null

      if (student && student.department_id) {
        const coordinator = await findCoordinatorForDepartment(student.department_id)
        if (coordinator) {
          coordinatorId = coordinator.id
        }
      }

      const passData = {
        ...data,
        pass_type: 'LONG_LEAVE',
        pass_date: null,
        from_date: fromDate,
        to_date: toDate,
        coordinator_id: coordinatorId,
        status: 'PENDING_COORDINATOR'
      }

      const pass = await passRepository.create(passData)
      console.log(`[PASS SERVICE] Long leave pass created with ID: ${pass.id}, Coordinator ID: ${coordinatorId}`)

      // Create coordinator approval record
      await approvalRepository.create({
        pass_id: pass.id,
        stage: 'COORDINATOR',
        status: 'PENDING'
      })

      // Create hostel staff approval record
      await approvalRepository.create({
        pass_id: pass.id,
        stage: 'HOSTEL_STAFF',
        status: 'PENDING'
      })

      return pass
    }
  },

  getPassById: async (id) => {
    return passRepository.findById(id)
  },

  getStudentPasses: async (studentId) => {
    return passRepository.findByStudentId(studentId)
  }
}
