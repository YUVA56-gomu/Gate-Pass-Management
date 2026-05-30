import { passRepository } from '../repositories/pass.repository.js'
import { approvalRepository } from '../repositories/approval.repository.js'

export const passService = {
  createPass: async (data) => {
    // Validate pass type
    if (!['DAILY', 'LONG_LEAVE'].includes(data.type)) {
      throw new Error('Pass type must be DAILY or LONG_LEAVE')
    }

    // Validate dates
    const fromDate = new Date(data.from_date)
    const toDate = new Date(data.to_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // From date cannot be in the past
    if (fromDate < today) {
      throw new Error('From date cannot be in the past')
    }

    // To date cannot be before from date
    if (toDate < fromDate) {
      throw new Error('To date cannot be before from date')
    }

    // Daily pass rule: from_date must equal to_date
    if (data.type === 'DAILY') {
      if (fromDate.getTime() !== toDate.getTime()) {
        throw new Error('For daily pass, from date and to date must be the same')
      }
    }

    // Create pass with appropriate status
    const passData = {
      ...data,
      status: data.type === 'LONG_LEAVE' ? 'PENDING_COORDINATOR' : 'PENDING_HOSTEL'
    }

    const pass = await passRepository.create(passData)

    // Create approval records based on pass type
    if (data.type === 'LONG_LEAVE') {
      await approvalRepository.create({
        pass_id: pass.id,
        stage: 'COORDINATOR',
        status: 'PENDING'
      })
    }

    await approvalRepository.create({
      pass_id: pass.id,
      stage: 'HOSTEL_STAFF',
      status: 'PENDING'
    })

    return pass
  },

  getPassById: async (id) => {
    return passRepository.findById(id)
  },

  getStudentPasses: async (studentId) => {
    return passRepository.findByStudentId(studentId)
  }
}
