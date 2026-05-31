import { Op } from 'sequelize'
import sequelize from '../config/db.js'
import { Pass, Approval, Student, User, Department } from '../models/index.js'

/**
 * Get pending passes for hostel staff (PENDING_HOSTEL status)
 */
export const getPendingPasses = async () => {
  try {
    const passes = await Pass.findAll({
      where: {
        status: 'PENDING_HOSTEL'
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
    throw new Error(`Failed to get pending passes: ${error.message}`)
  }
}

/**
 * Approve pass with transaction
 */
export const approvePass = async (passId, hostelStaffId, remarks = null) => {
  const transaction = await sequelize.transaction()

  try {
    // Fetch latest pass state with lock
    const pass = await Pass.findByPk(passId, { transaction })

    // Validation: Pass exists
    if (!pass) {
      await transaction.rollback()
      throw new Error('Pass not found')
    }

    // Validation: Pass status is PENDING_HOSTEL
    if (pass.status !== 'PENDING_HOSTEL') {
      await transaction.rollback()
      throw new Error('This pass has already been processed')
    }

    // Update pass status to APPROVED
    await pass.update(
      {
        status: 'APPROVED'
      },
      { transaction }
    )

    // Create approval record
    const approval = await Approval.create(
      {
        pass_id: passId,
        approved_by: hostelStaffId,
        stage: 'HOSTEL_STAFF',
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
    throw new Error(`Failed to approve pass: ${error.message}`)
  }
}

/**
 * Reject pass with transaction
 */
export const rejectPass = async (passId, hostelStaffId, remarks) => {
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

    // Validation: Pass status is PENDING_HOSTEL
    if (pass.status !== 'PENDING_HOSTEL') {
      await transaction.rollback()
      throw new Error('This pass has already been processed')
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
        approved_by: hostelStaffId,
        stage: 'HOSTEL_STAFF',
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
    throw new Error(`Failed to reject pass: ${error.message}`)
  }
}

/**
 * Get all passes with optional filters
 */
export const getAllPasses = async (filter = 'ALL') => {
  try {
    const whereClause = {}

    // Apply filter
    if (filter === 'DAILY') {
      whereClause.pass.type = 'DAILY'
    } else if (filter === 'LONG_LEAVE') {
      whereClause.pass.type = 'LONG_LEAVE'
    } else if (filter === 'APPROVED') {
      whereClause.status = 'APPROVED'
    } else if (filter === 'REJECTED') {
      whereClause.status = 'REJECTED'
    } else if (filter === 'PENDING_HOSTEL') {
      whereClause.status = 'PENDING_HOSTEL'
    }
    // 'ALL' has no filter

    const passes = await Pass.findAll({
      where: whereClause,
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
    throw new Error(`Failed to get passes: ${error.message}`)
  }
}

/**
 * Get all students in hostel
 */
export const getStudents = async (searchQuery = '') => {
  try {
    const whereClause = {}

    // Apply search filter
    if (searchQuery) {
      const searchTerm = `%${searchQuery}%`
      whereClause[Op.or] = [
        sequelize.where(sequelize.col('User.name'), Op.like, searchTerm),
        sequelize.where(sequelize.col('usn'), Op.like, searchTerm),
        sequelize.where(sequelize.col('Department.name'), Op.like, searchTerm)
      ]
    }

    const students = await Student.findAll({
      where: whereClause,
      attributes: ['id', 'usn', 'program_type', 'year_of_study', 'semester', 'hostel_name', 'room_number'],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Department,
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['User', 'name', 'ASC']]
    })

    return students
  } catch (error) {
    throw new Error(`Failed to get students: ${error.message}`)
  }
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    // Get pending passes count
    const pendingCount = await Pass.count({
      where: {
        status: 'PENDING_HOSTEL'
      }
    })

    // Get approved today count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const approvedTodayCount = await Approval.count({
      where: {
        stage: 'HOSTEL_STAFF',
        status: 'APPROVED',
        approved_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    })

    // Get students outside (approved passes for today or future)
    // NOTE: This is a temporary MVP implementation
    // Future implementation should use Gate Logs:
    // - Check for OUT scanned entries
    // - Verify IN not scanned yet
    // - This will give actual students currently outside
    const studentsOutside = await Pass.count({
      where: {
        status: 'APPROVED',
        pass_type: 'DAILY',
        from_date: {
          [Op.gte]: today
        }
      }
    })

    return {
      pending: pendingCount,
      approvedToday: approvedTodayCount,
      studentsOutside: studentsOutside
    }
  } catch (error) {
    throw new Error(`Failed to get dashboard stats: ${error.message}`)
  }
}

/**
 * Get recent activity for hostel staff
 */
export const getRecentActivity = async (hostelStaffId) => {
  try {
    const approvals = await Approval.findAll({
      where: {
        approved_by: hostelStaffId,
        stage: 'HOSTEL_STAFF'
      },
      include: [
        {
          model: Pass,
          attributes: ['id', 'pass_type', 'reason', 'destination', 'from_date', 'to_date', 'status'],
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
      order: [['approved_at', 'DESC']],
      limit: 5
    })

    return approvals
  } catch (error) {
    throw new Error(`Failed to get recent activity: ${error.message}`)
  }
}

export default {
  getPendingPasses,
  approvePass,
  rejectPass,
  getAllPasses,
  getStudents,
  getDashboardStats,
  getRecentActivity
}
