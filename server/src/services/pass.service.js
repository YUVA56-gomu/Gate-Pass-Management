import { passRepository } from '../repositories/pass.repository.js'
import { approvalRepository } from '../repositories/approval.repository.js'
import User from '../models/User.js'

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
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
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

export const passService = {
  createPass: async (data) => {
    console.log('[PASS SERVICE] Creating pass with data:', {
      pass_type: data.pass_type,
      reason: data.reason,
      destination: data.destination,
      pass_date: data.pass_date,
      leaving_date: data.leaving_date,
      returning_date: data.returning_date,
      hostel_staff_id: data.hostel_staff_id,
      coordinator_id: data.coordinator_id
    })

    // Validate pass type
    if (!['DAILY', 'LONG_LEAVE'].includes(data.pass_type)) {
      throw new Error('Pass type must be DAILY or LONG_LEAVE')
    }

    const today = getTodayDate()
    console.log(`[PASS SERVICE] Today's date: ${today}`)

    // ─── DAILY PASS ───────────────────────────────────────────────────────────
    if (data.pass_type === 'DAILY') {
      if (!data.pass_date) {
        throw new Error('Pass date is required for daily pass')
      }

      if (!data.hostel_staff_id) {
        throw new Error('Hostel staff selection is required for daily pass')
      }

      const passDate = parseDate(data.pass_date)
      console.log(`[PASS SERVICE] Daily pass date: ${passDate}`)

      if (compareDate(passDate, today) < 0) {
        throw new Error('Pass date cannot be in the past')
      }

      // Validate hostel staff exists and is active
      const hostelStaff = await User.findOne({
        where: { id: data.hostel_staff_id, role: 'HOSTEL_STAFF', is_active: true }
      })
      if (!hostelStaff) {
        throw new Error('Selected hostel staff is not available')
      }

      const passData = {
        ...data,
        pass_type: 'DAILY',
        pass_date: passDate,
        from_date: null,
        to_date: null,
        leaving_date: null,
        returning_date: null,
        coordinator_id: null,        // Daily pass skips coordinator
        hostel_staff_id: data.hostel_staff_id,
        status: 'PENDING_HOSTEL'
      }

      const pass = await passRepository.create(passData)
      console.log(`[PASS SERVICE] Daily pass created: ID=${pass.id}, HostelStaff=${data.hostel_staff_id}`)

      await approvalRepository.create({
        pass_id: pass.id,
        stage: 'HOSTEL_STAFF',
        status: 'PENDING'
      })

      return pass
    }

    // ─── LONG LEAVE ───────────────────────────────────────────────────────────
    if (data.pass_type === 'LONG_LEAVE') {
      if (!data.leaving_date || !data.returning_date) {
        throw new Error('Leaving date and returning date are required for long leave')
      }
      if (!data.parent_contact) {
        throw new Error('Parent contact is required for long leave')
      }
      if (!data.coordinator_id) {
        throw new Error('Coordinator selection is required for long leave')
      }
      if (!data.hostel_staff_id) {
        throw new Error('Hostel staff selection is required for long leave')
      }

      const fromDate = parseDate(data.leaving_date)
      const toDate = parseDate(data.returning_date)
      console.log(`[PASS SERVICE] Long leave - From: ${fromDate}, To: ${toDate}`)

      if (compareDate(fromDate, today) < 0) {
        throw new Error('Leaving date cannot be in the past')
      }
      if (compareDate(toDate, fromDate) <= 0) {
        throw new Error('Returning date must be after leaving date')
      }

      // Validate coordinator
      const coordinator = await User.findOne({
        where: { id: data.coordinator_id, role: 'COORDINATOR', is_active: true }
      })
      if (!coordinator) {
        throw new Error('Selected coordinator is not available')
      }

      // Validate hostel staff
      const hostelStaff = await User.findOne({
        where: { id: data.hostel_staff_id, role: 'HOSTEL_STAFF', is_active: true }
      })
      if (!hostelStaff) {
        throw new Error('Selected hostel staff is not available')
      }

      const passData = {
        ...data,
        pass_type: 'LONG_LEAVE',
        pass_date: null,
        from_date: fromDate,
        to_date: toDate,
        leaving_date: fromDate,
        returning_date: toDate,
        coordinator_id: data.coordinator_id,
        hostel_staff_id: data.hostel_staff_id,
        status: 'PENDING_COORDINATOR'
      }

      const pass = await passRepository.create(passData)
      console.log(`[PASS SERVICE] Long leave created: ID=${pass.id}, Coordinator=${data.coordinator_id}, HostelStaff=${data.hostel_staff_id}`)

      await approvalRepository.create({
        pass_id: pass.id,
        stage: 'COORDINATOR',
        status: 'PENDING'
      })

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
  },

  deletePass: async (passId) => {
    try {
      console.log(`[PASS SERVICE] Deleting pass with ID: ${passId}`)
      await approvalRepository.deleteByPassId(passId)
      const result = await passRepository.delete(passId)
      console.log(`[PASS SERVICE] Pass deleted successfully: ${passId}`)
      return result
    } catch (error) {
      console.error(`[PASS SERVICE] Error deleting pass ${passId}:`, error.message)
      throw new Error(`Failed to delete pass: ${error.message}`)
    }
  }
}
