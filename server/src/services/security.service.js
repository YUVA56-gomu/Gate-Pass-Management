import { Op } from 'sequelize'
import sequelize from '../config/db.js'
import { Pass, GateLog, QRToken, Student, User, Department, Approval } from '../models/index.js'

/**
 * Scan QR Token and create gate log
 * Implements scan logic:
 * - First scan: Creates OUT log
 * - Second scan: Creates IN log
 * - Third scan: Returns COMPLETED (no new log)
 * 
 * Transaction Safety:
 * - Uses safe rollback handling to prevent "transaction already finished" errors
 * - Validates transaction state before rollback
 * - Ensures rollback happens only once
 */
export const scanQRToken = async (token, securityUserId) => {
  const transaction = await sequelize.transaction()

  try {
    // Validation: Token provided
    if (!token) {
      throw new Error('Token is required')
    }

    // Find QR token record
    const qrToken = await QRToken.findOne({
      where: {
        token: token
      },
      transaction
    })

    // Validation: QR token exists
    if (!qrToken) {
      throw new Error('Invalid QR token')
    }

    // Validation: QR token is active
    if (!qrToken.is_active) {
      throw new Error('QR token is inactive')
    }

    // Validation: QR token not expired (if expires_at is set)
    if (qrToken.expires_at && new Date(qrToken.expires_at) < new Date()) {
      throw new Error('QR token has expired')
    }

    // Fetch pass with lock
    const pass = await Pass.findByPk(qrToken.pass_id, {
      transaction,
      lock: true
    })

    // Validation: Pass exists
    if (!pass) {
      throw new Error('Pass not found')
    }

    // Validation: Pass status is APPROVED
    if (pass.status !== 'APPROVED') {
      throw new Error('Pass is not approved')
    }

    // Check existing gate logs for this pass
    const existingLogs = await GateLog.findAll({
      where: {
        pass_id: pass.id
      },
      order: [['scanned_at', 'ASC']],
      transaction
    })

    // Gate Log Validation: Prevent invalid states
    // Before OUT: Ensure no previous OUT without IN
    if (existingLogs.length === 0) {
      // First scan: Valid to create OUT log
    } else if (existingLogs.length === 1) {
      // Verify first log is OUT before creating IN
      if (existingLogs[0].action !== 'OUT') {
        throw new Error('Invalid gate log state: Expected OUT log before IN')
      }
    } else if (existingLogs.length >= 2) {
      // Pass already has OUT and IN logs
      // This is valid - pass is completed
    }

    // Determine scan action and check if pass is already completed
    let action
    let scanResult
    let statusMessage

    if (existingLogs.length === 0) {
      // First scan: Create OUT log
      action = 'OUT'
      scanResult = 'OUT'
      statusMessage = 'OUT scan recorded successfully'
    } else if (existingLogs.length === 1 && existingLogs[0].action === 'OUT') {
      // Second scan: Create IN log
      action = 'IN'
      scanResult = 'IN'
      statusMessage = 'IN scan recorded successfully'
    } else if (existingLogs.length >= 2) {
      // Third+ scan: Pass already completed
      await transaction.commit()
      return {
        passId: pass.id,
        scanResult: 'COMPLETED',
        message: 'Pass Already Completed',
        statusMessage: 'This pass has already been completed (OUT and IN scans recorded)',
        studentDetails: await getStudentDetails(pass.student_id),
        passDetails: {
          id: pass.id,
          type: pass.type,
          destination: pass.destination,
          from_date: pass.from_date,
          to_date: pass.to_date
        },
        scanDetails: {
          action: 'COMPLETED',
          timestamp: new Date()
        }
      }
    }

    // Create gate log
    const gateLog = await GateLog.create(
      {
        pass_id: pass.id,
        action: action,
        scan_status: 'VALID',
        scanned_by: securityUserId,
        scanned_at: new Date()
      },
      { transaction }
    )

    await transaction.commit()

    // Fetch student details for response
    const studentDetails = await getStudentDetails(pass.student_id)

    return {
      passId: pass.id,
      scanResult: scanResult,
      message: statusMessage,
      studentDetails: studentDetails,
      passDetails: {
        id: pass.id,
        type: pass.type,
        destination: pass.destination,
        from_date: pass.from_date,
        to_date: pass.to_date
      },
      scanDetails: {
        action: action,
        timestamp: gateLog.scanned_at
      }
    }
  } catch (error) {
    // Safe transaction rollback: Check if transaction is still active
    if (transaction && !transaction.finished) {
      await transaction.rollback()
    }
    throw new Error(`Failed to scan QR token: ${error.message}`)
  }
}

/**
 * Get student details for scan result
 */
const getStudentDetails = async (studentId) => {
  const student = await Student.findByPk(studentId, {
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
  })

  if (!student) {
    throw new Error('Student not found')
  }

  return {
    id: student.id,
    usn: student.usn,
    name: student.User.name,
    department: student.Department.name,
    program_type: student.program_type,
    year_of_study: student.year_of_study,
    semester: student.semester,
    hostel_name: student.hostel_name,
    room_number: student.room_number
  }
}

/**
 * Get today's gate logs
 * Calculates from actual database records (no hardcoded values)
 * Uses Sequelize Op operators for date range filtering
 */
export const getTodayLogs = async () => {
  try {
    // Get today's date range (00:00:00 to 23:59:59)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch today's logs using Op.gte and Op.lt operators
    const logs = await GateLog.findAll({
      where: {
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [
        {
          model: Pass,
          attributes: ['id', 'type', 'destination', 'from_date', 'to_date'],
          include: [
            {
              model: Student,
              attributes: ['id', 'usn'],
              include: [
                {
                  model: User,
                  attributes: ['id', 'name']
                },
                {
                  model: Department,
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'scanner',
          attributes: ['id', 'name']
        }
      ],
      order: [['scanned_at', 'DESC']]
    })

    return logs.map(log => ({
      id: log.id,
      passId: log.pass_id,
      studentUSN: log.Pass.Student.usn,
      studentName: log.Pass.Student.User.name,
      passType: log.Pass.type,
      action: log.action,
      scannedAt: log.scanned_at,
      scannedBy: log.scanner ? log.scanner.name : 'Unknown'
    }))
  } catch (error) {
    throw new Error(`Failed to get today's logs: ${error.message}`)
  }
}

/**
 * Get all gate logs with optional filters
 * Calculates from actual database records (no hardcoded values)
 * Uses Sequelize Op operators for filtering
 */
export const getAllLogs = async (filter = 'ALL') => {
  try {
    const where = {}

    // Apply filter using Sequelize Op operators
    if (filter === 'OUT') {
      where.action = 'OUT'
    } else if (filter === 'IN') {
      where.action = 'IN'
    } else if (filter === 'TODAY') {
      // TODAY filter: Get logs from 00:00:00 to 23:59:59 today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      where.scanned_at = {
        [Op.gte]: today,
        [Op.lt]: tomorrow
      }
    }
    // ALL filter: No where clause, returns all logs

    // Fetch logs
    const logs = await GateLog.findAll({
      where,
      include: [
        {
          model: Pass,
          attributes: ['id', 'type', 'destination', 'from_date', 'to_date'],
          include: [
            {
              model: Student,
              attributes: ['id', 'usn'],
              include: [
                {
                  model: User,
                  attributes: ['id', 'name']
                },
                {
                  model: Department,
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'scanner',
          attributes: ['id', 'name']
        }
      ],
      order: [['scanned_at', 'DESC']]
    })

    return logs.map(log => ({
      id: log.id,
      passId: log.pass_id,
      studentUSN: log.Pass.Student.usn,
      studentName: log.Pass.Student.User.name,
      passType: log.Pass.type,
      action: log.action,
      scannedAt: log.scanned_at,
      scannedBy: log.scanner ? log.scanner.name : 'Unknown'
    }))
  } catch (error) {
    throw new Error(`Failed to get logs: ${error.message}`)
  }
}

/**
 * Get dashboard statistics
 * Calculates from actual database records (no hardcoded values)
 * Uses Sequelize Op operators for date range filtering
 * 
 * Statistics Calculation:
 * - Today's Scans: Count all scans (OUT + IN) recorded today
 * - Students Outside: Count students with OUT log but no IN log today
 * - Completed Passes: Count students with both OUT and IN logs today
 * - Recent Activity: Last 10 scans with full details
 */
export const getDashboardStats = async () => {
  try {
    // Get today's date range (00:00:00 to 23:59:59)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 1. Count today's scans (all OUT and IN scans)
    // Query: SELECT COUNT(*) FROM gate_logs WHERE DATE(scanned_at) = TODAY
    const todayScansCount = await GateLog.count({
      where: {
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    })

    // 2. Count students outside (OUT exists AND IN missing)
    // Step 1: Get all pass IDs with OUT logs today
    // Query: SELECT DISTINCT pass_id FROM gate_logs WHERE action='OUT' AND DATE(scanned_at)=TODAY
    const studentsOutside = await GateLog.findAll({
      attributes: ['pass_id'],
      where: {
        action: 'OUT',
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      raw: true
    })

    // Get pass IDs with OUT logs
    const outPassIds = studentsOutside.map(log => log.pass_id)

    // Step 2: Find which of these don't have IN logs
    // Query: SELECT DISTINCT pass_id FROM gate_logs WHERE pass_id IN (...) AND action='IN' AND DATE(scanned_at)=TODAY
    let studentsOutsideCount = 0
    if (outPassIds.length > 0) {
      const inLogs = await GateLog.findAll({
        attributes: ['pass_id'],
        where: {
          pass_id: {
            [Op.in]: outPassIds
          },
          action: 'IN',
          scanned_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        raw: true
      })

      const inPassIds = inLogs.map(log => log.pass_id)
      // Students outside = OUT passes - IN passes
      studentsOutsideCount = outPassIds.filter(id => !inPassIds.includes(id)).length
    }

    // 3. Count completed passes (both OUT and IN logs exist)
    // Step 1: Get all pass IDs with OUT logs today
    const completedPasses = await GateLog.findAll({
      attributes: ['pass_id'],
      where: {
        action: 'OUT',
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      raw: true
    })

    // Step 2: Find which of these have IN logs
    // Query: SELECT DISTINCT pass_id FROM gate_logs WHERE pass_id IN (...) AND action='IN' AND DATE(scanned_at)=TODAY
    let completedCount = 0
    if (completedPasses.length > 0) {
      const completedPassIds = completedPasses.map(log => log.pass_id)
      const completedInLogs = await GateLog.findAll({
        attributes: ['pass_id'],
        where: {
          pass_id: {
            [Op.in]: completedPassIds
          },
          action: 'IN',
          scanned_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        raw: true
      })

      const completedInPassIds = completedInLogs.map(log => log.pass_id)
      // Completed passes = passes with both OUT and IN
      completedCount = completedInPassIds.length
    }

    // 4. Get recent scan activity (last 10 scans)
    // Query: SELECT * FROM gate_logs ORDER BY scanned_at DESC LIMIT 10
    const recentActivity = await GateLog.findAll({
      include: [
        {
          model: Pass,
          attributes: ['id', 'type', 'destination'],
          include: [
            {
              model: Student,
              attributes: ['id', 'usn'],
              include: [
                {
                  model: User,
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'scanner',
          attributes: ['id', 'name']
        }
      ],
      order: [['scanned_at', 'DESC']],
      limit: 10
    })

    return {
      todayScans: todayScansCount,
      studentsOutside: studentsOutsideCount,
      completedPasses: completedCount,
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        passId: log.pass_id,
        studentName: log.Pass.Student.User.name,
        studentUSN: log.Pass.Student.usn,
        passType: log.Pass.type,
        action: log.action,
        scannedAt: log.scanned_at,
        scannedBy: log.scanner ? log.scanner.name : 'Unknown'
      }))
    }
  } catch (error) {
    throw new Error(`Failed to get dashboard stats: ${error.message}`)
  }
}

export default {
  scanQRToken,
  getTodayLogs,
  getAllLogs,
  getDashboardStats
}
