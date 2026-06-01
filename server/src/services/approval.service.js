import sequelize from '../config/db.js'
import { Pass, Approval, Student, User, Department } from '../models/index.js'

/**
 * Get pending long leave requests for coordinator
 */
export const getPendingLongLeaveRequests = async () => {
  try {
    const passes = await Pass.findAll({
      where: {
        pass_type: 'LONG_LEAVE',
        status: 'PENDING_COORDINATOR'
      },
      include: [
        {
          model: Student,
          attributes: ['id', 'usn'],
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            },
            {
              model: Department,
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    return passes
  } catch (error) {
    throw new Error(`Failed to get pending requests: ${error.message}`)
  }
}

/**
 * Approve long leave request with transaction
 */
export const approveLongLeaveRequest = async (passId, coordinatorId, remarks = null) => {
  const transaction = await sequelize.transaction()

  try {
    // Fetch latest pass state with lock
    const pass = await Pass.findByPk(passId, { transaction })

    // Validation: Pass exists
    if (!pass) {
      await transaction.rollback()
      throw new Error('Pass not found')
    }

    // Validation: Pass type is LONG_LEAVE
    if (pass.pass_type !== 'LONG_LEAVE') {
      await transaction.rollback()
      throw new Error('Only LONG_LEAVE passes can be approved by coordinator')
    }

    // Validation: Pass status is PENDING_COORDINATOR
    if (pass.status !== 'PENDING_COORDINATOR') {
      await transaction.rollback()
      throw new Error('This request has already been processed')
    }

    // Update pass status to PENDING_HOSTEL
    await pass.update(
      {
        status: 'PENDING_HOSTEL'
      },
      { transaction }
    )

    // Create approval record
    const approval = await Approval.create(
      {
        pass_id: passId,
        approved_by: coordinatorId,
        stage: 'COORDINATOR',
        status: 'APPROVED',
        remarks: remarks,
        approved_at: new Date()
      },
      { transaction }
    )

    // Commit transaction
    await transaction.commit()

    return approval
  } catch (error) {
    // Rollback on any error
    await transaction.rollback()
    throw new Error(`Failed to approve request: ${error.message}`)
  }
}

/**
 * Reject long leave request with transaction
 */
export const rejectLongLeaveRequest = async (passId, coordinatorId, remarks) => {
  const transaction = await sequelize.transaction()

  try {
    // Validation: Remarks are mandatory
    if (!remarks || !remarks.trim()) {
      await transaction.rollback()
      throw new Error('Remarks are mandatory for rejection')
    }

    // Fetch latest pass state with lock
    const pass = await Pass.findByPk(passId, { transaction })

    // Validation: Pass exists
    if (!pass) {
      await transaction.rollback()
      throw new Error('Pass not found')
    }

    // Validation: Pass type is LONG_LEAVE
    if (pass.pass_type !== 'LONG_LEAVE') {
      await transaction.rollback()
      throw new Error('Only LONG_LEAVE passes can be rejected by coordinator')
    }

    // Validation: Pass status is PENDING_COORDINATOR
    if (pass.status !== 'PENDING_COORDINATOR') {
      await transaction.rollback()
      throw new Error('This request has already been processed')
    }

    // Update pass status to REJECTED
    await pass.update(
      {
        status: 'REJECTED'
      },
      { transaction }
    )

    // Create approval record
    const approval = await Approval.create(
      {
        pass_id: passId,
        approved_by: coordinatorId,
        stage: 'COORDINATOR',
        status: 'REJECTED',
        remarks: remarks,
        approved_at: new Date()
      },
      { transaction }
    )

    // Commit transaction
    await transaction.commit()

    return approval
  } catch (error) {
    // Rollback on any error
    await transaction.rollback()
    throw new Error(`Failed to reject request: ${error.message}`)
  }
}

/**
 * Get approval history for coordinator
 */
export const getCoordinatorApprovalHistory = async (coordinatorId) => {
  try {
    const approvals = await Approval.findAll({
      where: {
        approved_by: coordinatorId,
        stage: 'COORDINATOR'
      },
      include: [
        {
          model: Pass,
          attributes: ['id', 'pass_type', 'reason', 'destination', 'leaving_date', 'returning_date', 'from_date', 'to_date', 'status'],
          include: [
            {
              model: Student,
              attributes: ['id', 'usn'],
              include: [
                {
                  model: User,
                  attributes: ['id', 'name', 'email']
                },
                {
                  model: Department,
                  attributes: ['id', 'name', 'code']
                }
              ]
            }
          ]
        }
      ],
      order: [['approved_at', 'DESC']]
    })

    return approvals
  } catch (error) {
    throw new Error(`Failed to get approval history: ${error.message}`)
  }
}

/**
 * Get approval by ID
 */
export const getApprovalById = async (approvalId) => {
  try {
    const approval = await Approval.findByPk(approvalId, {
      include: [
        {
          model: Pass,
          include: [
            {
              model: Student,
              include: [
                {
                  model: User,
                  attributes: ['id', 'name', 'email']
                },
                {
                  model: Department,
                  attributes: ['id', 'name', 'code']
                }
              ]
            }
          ]
        }
      ]
    })

    return approval
  } catch (error) {
    throw new Error(`Failed to get approval: ${error.message}`)
  }
}

export default {
  getPendingLongLeaveRequests,
  approveLongLeaveRequest,
  rejectLongLeaveRequest,
  getCoordinatorApprovalHistory,
  getApprovalById
}
