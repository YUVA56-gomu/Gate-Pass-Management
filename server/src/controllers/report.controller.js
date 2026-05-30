import { userRepository } from '../repositories/user.repository.js'
import { passRepository } from '../repositories/pass.repository.js'
import { gateLogRepository } from '../repositories/gateLog.repository.js'
import { successResponse, errorResponse } from '../utils/response.js'

export const reportController = {
  getDashboardStats: async (req, res) => {
    try {
      const users = await userRepository.findAll()
      const passes = await passRepository.findAll()
      const logs = await gateLogRepository.findAll()

      const stats = {
        total_users: users.length,
        total_passes: passes.length,
        approved_passes: passes.filter(p => p.status === 'approved').length,
        total_scans: logs.length
      }

      successResponse(res, stats, 'Stats retrieved')
    } catch (error) {
      errorResponse(res, error.message, 400)
    }
  }
}
