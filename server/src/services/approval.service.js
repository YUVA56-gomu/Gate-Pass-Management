import { approvalRepository } from '../repositories/approval.repository.js'
import { passRepository } from '../repositories/pass.repository.js'

export const approvalService = {
  getPendingApprovals: async (stage) => {
    return approvalRepository.findAll()
  },

  approveRequest: async (approvalId, remarks) => {
    const approval = await approvalRepository.findById(approvalId)
    if (!approval) {
      throw new Error('Approval not found')
    }

    await approvalRepository.update(approvalId, {
      status: 'approved',
      remarks
    })

    // Check if all approvals are done
    const pass = await passRepository.findById(approval.pass_id)
    const allApprovals = await approvalRepository.findByPassId(pass.id)
    
    if (allApprovals.every(a => a.status !== 'pending')) {
      await passRepository.update(pass.id, { status: 'approved' })
    }

    return approval
  },

  rejectRequest: async (approvalId, remarks) => {
    const approval = await approvalRepository.findById(approvalId)
    if (!approval) {
      throw new Error('Approval not found')
    }

    await approvalRepository.update(approvalId, {
      status: 'rejected',
      remarks
    })

    // Reject the pass
    await passRepository.update(approval.pass_id, { status: 'rejected' })

    return approval
  }
}
