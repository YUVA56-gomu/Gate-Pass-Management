import { Op } from 'sequelize'
import sequelize from '../config/db.js'
import { Pass, Approval, Student, User, Department, GateLog } from '../models/index.js'
import * as qrService from './qr.service.js'
import * as pdfService from './pdf.service.js'
import * as notificationService from './notification.service.js'

/**
 * Get pending passes for hostel staff (PENDING_HOSTEL status)
 */
export const getPendingPasses = async () => {
  try {
    console.log('[HOSTEL SERVICE] Fetching pending passes...')
    
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

    console.log('[HOSTEL SERVICE] Found pending passes:', passes.length)

    return passes
  } catch (error) {
    console.error('[HOSTEL SERVICE] Error fetching pending passes:', error.message)
    throw new Error(`Failed to get pending passes: ${error.message}`)
  }
}

const safeRollback = async (transaction) => {
  try {
    await transaction.rollback()
  } catch (rollbackError) {
    // Ignore if transaction was already committed or rolled back
  }
}

/**
 * Approve pass with transaction
 */
export const approvePass = async (passId, hostelStaffId, remarks = null) => {
  const numericPassId = parseInt(passId, 10)
  console.log('[HOSTEL SERVICE] approvePass start', { passId, numericPassId, hostelStaffId })

  if (!numericPassId || Number.isNaN(numericPassId)) {
    throw new Error('Invalid pass ID')
  }

  const transaction = await sequelize.transaction()

  try {
    const pass = await Pass.findByPk(numericPassId, { transaction })

    if (!pass) {
      throw new Error('Pass not found')
    }

    console.log('[HOSTEL SERVICE] Pass found, status:', pass.status)

    if (pass.status !== 'PENDING_HOSTEL') {
      throw new Error(`This pass cannot be approved (current status: ${pass.status})`)
    }

    await pass.update({ status: 'APPROVED' }, { transaction })
    console.log('[HOSTEL SERVICE] Pass status updated to APPROVED')

    const pendingApproval = await Approval.findOne({
      where: {
        pass_id: numericPassId,
        stage: 'HOSTEL_STAFF',
        status: 'PENDING'
      },
      transaction
    })

    let approval
    if (pendingApproval) {
      approval = await pendingApproval.update(
        {
          approved_by: hostelStaffId,
          status: 'APPROVED',
          remarks: remarks || null,
          approved_at: new Date()
        },
        { transaction }
      )
      console.log('[HOSTEL SERVICE] Updated existing approval id:', approval.id)
    } else {
      approval = await Approval.create(
        {
          pass_id: numericPassId,
          approved_by: hostelStaffId,
          stage: 'HOSTEL_STAFF',
          status: 'APPROVED',
          remarks: remarks || null,
          approved_at: new Date()
        },
        { transaction }
      )
      console.log('[HOSTEL SERVICE] Created new approval id:', approval.id)
    }

    await transaction.commit()
    console.log('[HOSTEL SERVICE] approvePass committed')

    // ── Post-commit side effects (non-blocking) ──────────────────────────────
    // Generate QR token
    try {
      await qrService.generateQRToken(numericPassId)
      console.log(`[HOSTEL SERVICE] QR generated for pass ${numericPassId}`)
    } catch (err) {
      console.error(`[HOSTEL SERVICE] QR generation failed for pass ${numericPassId}:`, err.message)
    }

    // Generate PDF
    try {
      await pdfService.generatePDF(numericPassId)
      console.log(`[HOSTEL SERVICE] PDF generated for pass ${numericPassId}`)
    } catch (err) {
      console.error(`[HOSTEL SERVICE] PDF generation failed for pass ${numericPassId}:`, err.message)
    }

    // Notify student
    try {
      const passRecord = await Pass.findByPk(numericPassId, { attributes: ['student_id', 'pass_type'] })
      if (passRecord) {
        await notificationService.notifyHostelApproved(passRecord.student_id, numericPassId)
        console.log(`[HOSTEL SERVICE] Student notified for pass ${numericPassId}`)
      }
    } catch (err) {
      console.error(`[HOSTEL SERVICE] Notification failed for pass ${numericPassId}:`, err.message)
    }

    return approval
  } catch (error) {
    await safeRollback(transaction)
    console.error('[HOSTEL SERVICE] approvePass failed:', error.message)
    throw new Error(`Failed to approve pass: ${error.message}`)
  }
}

/**
 * Reject pass with transaction
 */
export const rejectPass = async (passId, hostelStaffId, remarks) => {
  const numericPassId = parseInt(passId, 10)
  console.log('[HOSTEL SERVICE] rejectPass start', { passId, numericPassId, hostelStaffId })

  if (!remarks || !remarks.trim()) {
    throw new Error('Remarks are mandatory for rejection')
  }

  if (!numericPassId || Number.isNaN(numericPassId)) {
    throw new Error('Invalid pass ID')
  }

  const transaction = await sequelize.transaction()

  try {
    const pass = await Pass.findByPk(numericPassId, { transaction })

    if (!pass) {
      throw new Error('Pass not found')
    }

    console.log('[HOSTEL SERVICE] Pass found, status:', pass.status)

    if (pass.status !== 'PENDING_HOSTEL') {
      throw new Error(`This pass cannot be rejected (current status: ${pass.status})`)
    }

    await pass.update({ status: 'REJECTED' }, { transaction })
    console.log('[HOSTEL SERVICE] Pass status updated to REJECTED')

    const pendingApproval = await Approval.findOne({
      where: {
        pass_id: numericPassId,
        stage: 'HOSTEL_STAFF',
        status: 'PENDING'
      },
      transaction
    })

    let approval
    if (pendingApproval) {
      approval = await pendingApproval.update(
        {
          approved_by: hostelStaffId,
          status: 'REJECTED',
          remarks: remarks.trim(),
          approved_at: new Date()
        },
        { transaction }
      )
      console.log('[HOSTEL SERVICE] Updated existing approval id:', approval.id)
    } else {
      approval = await Approval.create(
        {
          pass_id: numericPassId,
          approved_by: hostelStaffId,
          stage: 'HOSTEL_STAFF',
          status: 'REJECTED',
          remarks: remarks.trim(),
          approved_at: new Date()
        },
        { transaction }
      )
      console.log('[HOSTEL SERVICE] Created new approval id:', approval.id)
    }

    await transaction.commit()
    console.log('[HOSTEL SERVICE] rejectPass committed')

    // Notify student of rejection
    try {
      const passRecord = await Pass.findByPk(numericPassId, { attributes: ['student_id'] })
      if (passRecord) {
        await notificationService.notifyHostelRejected(passRecord.student_id, numericPassId, remarks)
        console.log(`[HOSTEL SERVICE] Student notified of rejection for pass ${numericPassId}`)
      }
    } catch (err) {
      console.error(`[HOSTEL SERVICE] Rejection notification failed for pass ${numericPassId}:`, err.message)
    }

    return approval
  } catch (error) {
    await safeRollback(transaction)
    console.error('[HOSTEL SERVICE] rejectPass failed:', error.message)
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
      whereClause.pass_type = 'DAILY'
    } else if (filter === 'LONG_LEAVE') {
      whereClause.pass_type = 'LONG_LEAVE'
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
    console.log('[HOSTEL SERVICE] Fetching students with search:', searchQuery)

    // Build user where clause for search
    const userWhere = { role: 'STUDENT' }
    
    // Build student where clause for USN search
    const studentWhere = {}

    if (searchQuery) {
      const searchTerm = `%${searchQuery}%`
      // Search by USN on student table
      studentWhere[Op.or] = [
        { usn: { [Op.like]: searchTerm } }
      ]
      // Also search by name on user table
      userWhere[Op.and] = userWhere[Op.and] || []
      // We'll handle name search via a separate approach below
    }

    let students

    if (searchQuery) {
      const searchTerm = `%${searchQuery}%`
      // Use raw query approach for cross-table search to avoid column aliasing issues
      students = await Student.findAll({
        attributes: ['id', 'usn', 'program_type', 'year_of_study', 'semester', 'hostel_name', 'room_number', 'parent_phone'],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone'],
            where: {
              role: 'STUDENT',
              [Op.or]: [
                { name: { [Op.like]: searchTerm } },
                { email: { [Op.like]: searchTerm } }
              ]
            },
            required: true
          },
          {
            model: Department,
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ],
        order: [[User, 'name', 'ASC']]
      })

      // Also search by USN (separate query merged)
      const byUsn = await Student.findAll({
        attributes: ['id', 'usn', 'program_type', 'year_of_study', 'semester', 'hostel_name', 'room_number', 'parent_phone'],
        where: {
          usn: { [Op.like]: searchTerm }
        },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone'],
            where: { role: 'STUDENT' },
            required: true
          },
          {
            model: Department,
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ],
        order: [[User, 'name', 'ASC']]
      })

      // Merge and deduplicate by student id
      const seen = new Set(students.map(s => s.id))
      for (const s of byUsn) {
        if (!seen.has(s.id)) {
          students.push(s)
          seen.add(s.id)
        }
      }

      // Also search by department name
      const byDept = await Student.findAll({
        attributes: ['id', 'usn', 'program_type', 'year_of_study', 'semester', 'hostel_name', 'room_number', 'parent_phone'],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone'],
            where: { role: 'STUDENT' },
            required: true
          },
          {
            model: Department,
            attributes: ['id', 'name', 'code'],
            where: { name: { [Op.like]: searchTerm } },
            required: true
          }
        ],
        order: [[User, 'name', 'ASC']]
      })

      for (const s of byDept) {
        if (!seen.has(s.id)) {
          students.push(s)
          seen.add(s.id)
        }
      }
    } else {
      students = await Student.findAll({
        attributes: ['id', 'usn', 'program_type', 'year_of_study', 'semester', 'hostel_name', 'room_number', 'parent_phone'],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email', 'phone'],
            where: { role: 'STUDENT' },
            required: true
          },
          {
            model: Department,
            attributes: ['id', 'name', 'code'],
            required: false
          }
        ],
        order: [[User, 'name', 'ASC']]
      })
    }

    console.log('[HOSTEL SERVICE] Found students:', students.length)
    if (students.length === 0) {
      // Debug: count total users with STUDENT role
      const studentUserCount = await User.count({ where: { role: 'STUDENT' } })
      const studentProfileCount = await Student.count()
      console.log('[HOSTEL SERVICE] DEBUG - Total STUDENT users:', studentUserCount)
      console.log('[HOSTEL SERVICE] DEBUG - Total student profiles:', studentProfileCount)
    }

    return students
  } catch (error) {
    console.error('[HOSTEL SERVICE] Error fetching students:', error.message)
    console.error('[HOSTEL SERVICE] Full error:', error)
    throw new Error(`Failed to get students: ${error.message}`)
  }
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    console.log('[HOSTEL SERVICE] Calculating dashboard stats...')
    
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

    // Get rejected today count
    const rejectedTodayCount = await Approval.count({
      where: {
        stage: 'HOSTEL_STAFF',
        status: 'REJECTED',
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
        pass_date: {
          [Op.gte]: today
        }
      }
    })

    // Get total passes this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const totalPassesThisMonth = await Pass.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    })

    console.log('[HOSTEL SERVICE] Dashboard stats:', {
      pending: pendingCount,
      approvedToday: approvedTodayCount,
      rejectedToday: rejectedTodayCount,
      studentsOutside: studentsOutside,
      totalPassesThisMonth: totalPassesThisMonth
    })

    return {
      pending: pendingCount,
      approvedToday: approvedTodayCount,
      rejectedToday: rejectedTodayCount,
      studentsOutside: studentsOutside,
      totalPassesThisMonth: totalPassesThisMonth
    }
  } catch (error) {
    console.error('[HOSTEL SERVICE] Error calculating dashboard stats:', error.message)
    throw new Error(`Failed to get dashboard stats: ${error.message}`)
  }
}

/**
 * Get today's overview statistics for hostel dashboard
 * Calculates entries, exits, currently outside, and expected returns from real data
 */
export const getTodayOverview = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count today's IN scans (entries)
    const entriesIn = await GateLog.count({
      where: {
        action: 'IN',
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    })

    // Count today's OUT scans (exits)
    const exitsOut = await GateLog.count({
      where: {
        action: 'OUT',
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    })

    // Calculate students currently outside
    // Get all OUT pass IDs today
    const outLogs = await GateLog.findAll({
      attributes: ['pass_id'],
      where: {
        action: 'OUT',
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      group: ['pass_id']
    })

    const outPassIds = [...new Set(outLogs.map(log => log.pass_id))]
    let currentlyOutside = 0

    if (outPassIds.length > 0) {
      // Get all IN pass IDs today
      const inLogs = await GateLog.findAll({
        attributes: ['pass_id'],
        where: {
          action: 'IN',
          pass_id: {
            [Op.in]: outPassIds
          },
          scanned_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        group: ['pass_id']
      })

      const inPassIds = new Set(inLogs.map(log => log.pass_id))
      currentlyOutside = outPassIds.filter(id => !inPassIds.has(id)).length
    }

    // Calculate expected returns today
    // Count approved passes with return date = today
    const expectedReturnsToday = await Pass.count({
      where: {
        status: 'APPROVED',
        [Op.or]: [
          {
            pass_type: 'DAILY',
            pass_date: {
              [Op.gte]: today,
              [Op.lt]: tomorrow
            }
          },
          {
            pass_type: 'LONG_LEAVE',
            returning_date: {
              [Op.gte]: today,
              [Op.lt]: tomorrow
            }
          }
        ]
      }
    })

    return {
      entriesIn,
      exitsOut,
      currentlyOutside,
      expectedReturnsToday
    }
  } catch (error) {
    throw new Error(`Failed to get today's overview: ${error.message}`)
  }
}
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

/**
 * Get approved passes
 */
export const getApprovedPasses = async () => {
  try {
    const passes = await Pass.findAll({
      where: {
        status: 'APPROVED'
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
      order: [['updatedAt', 'DESC']]
    })

    return passes
  } catch (error) {
    throw new Error(`Failed to get approved passes: ${error.message}`)
  }
}

/**
 * Get students currently outside (mock implementation)
 * TODO: Replace with actual gate log tracking
 */
export const getStudentsOutside = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Mock implementation: Get approved daily passes for today
    const passes = await Pass.findAll({
      where: {
        status: 'APPROVED',
        pass_type: 'DAILY',
        pass_date: {
          [Op.gte]: today
        }
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
    throw new Error(`Failed to get students outside: ${error.message}`)
  }
}

export default {
  getPendingPasses,
  approvePass,
  rejectPass,
  getAllPasses,
  getStudents,
  getDashboardStats,
  getRecentActivity,
  getApprovedPasses,
  getStudentsOutside,
  getTodayOverview
}
