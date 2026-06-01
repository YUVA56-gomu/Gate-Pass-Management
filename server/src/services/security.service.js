import { Op } from 'sequelize'
import sequelize from '../config/db.js'
import { Pass, GateLog, QRToken, Student, User, Department, Approval } from '../models/index.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract the raw UUID token from whatever the QR scanner sends.
 * The QR image encodes JSON: {"token":"<uuid>"} — hardware scanners
 * return the full JSON string. We parse it out so both raw UUIDs
 * and JSON-wrapped tokens work.
 */
const extractToken = (raw) => {
  if (!raw) return null
  const trimmed = raw.trim()
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && parsed.token) return parsed.token
  } catch {
    // Not JSON — treat as raw token string
  }
  return trimmed
}

/**
 * Get today's date range (midnight to midnight)
 */
const todayRange = () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

/**
 * Get student details for a given student_id
 */
const getStudentDetails = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    include: [
      { model: User,       attributes: ['id', 'name', 'email', 'phone'] },
      { model: Department, attributes: ['id', 'name', 'code'] }
    ]
  })
  if (!student) throw new Error('Student not found')
  return {
    id:           student.id,
    usn:          student.usn,
    name:         student.User?.name,
    email:        student.User?.email,
    phone:        student.User?.phone,
    department:   student.Department?.name,
    dept_code:    student.Department?.code,
    program_type: student.program_type,
    year_of_study:student.year_of_study,
    semester:     student.semester,
    hostel_name:  student.hostel_name,
    room_number:  student.room_number
  }
}

/**
 * Build a normalised passDetails object from a Pass record.
 * Handles both DAILY and LONG_LEAVE date fields.
 */
const buildPassDetails = (pass) => {
  const isDaily = pass.pass_type === 'DAILY'
  return {
    id:          pass.id,
    pass_type:   pass.pass_type,
    destination: pass.destination,
    reason:      pass.reason,
    status:      pass.status,
    // Dates — normalised so frontend always gets from_date / to_date
    from_date:   isDaily
                   ? pass.pass_date
                   : (pass.leaving_date || pass.from_date),
    to_date:     isDaily
                   ? pass.pass_date
                   : (pass.returning_date || pass.to_date),
    pass_date:        pass.pass_date,
    leaving_date:     pass.leaving_date || pass.from_date,
    returning_date:   pass.returning_date || pass.to_date,
    exit_time:        pass.exit_time,
    expected_return_time: pass.expected_return_time,
    parent_contact:   pass.parent_contact,
    coordinator_id:   pass.coordinator_id,
    hostel_staff_id:  pass.hostel_staff_id
  }
}

// ─── Scan QR Token ─────────────────────────────────────────────────────────────

/**
 * Scan QR Token and create gate log.
 *
 * Flow:
 *   0 logs → create OUT log
 *   1 log (OUT) → create IN log + mark pass COMPLETED
 *   2+ logs → return COMPLETED (no new log)
 *
 * Handles both raw UUID tokens and JSON-wrapped tokens from hardware scanners.
 */
export const scanQRToken = async (rawToken, securityUserId) => {
  const transaction = await sequelize.transaction()

  try {
    if (!rawToken) throw new Error('Token is required')

    // ── Extract actual UUID from whatever the scanner sent ──
    const token = extractToken(rawToken)
    if (!token) throw new Error('Invalid token format')

    // ── Find QR token ──
    const qrToken = await QRToken.findOne({ where: { token }, transaction })
    if (!qrToken)          throw new Error('Invalid QR token — not found in system')
    if (!qrToken.is_active) throw new Error('QR token is inactive')
    if (qrToken.expires_at && new Date(qrToken.expires_at) < new Date()) {
      throw new Error('QR token has expired')
    }

    // ── Fetch pass ──
    const pass = await Pass.findByPk(qrToken.pass_id, {
      transaction,
      lock: true,
      include: [
        { model: User, as: 'coordinator',  attributes: ['id', 'name'] },
        { model: User, as: 'hostelStaff',  attributes: ['id', 'name'] }
      ]
    })
    if (!pass) throw new Error('Pass not found')
    if (pass.status !== 'APPROVED' && pass.status !== 'COMPLETED') {
      throw new Error(`Pass is not approved (current status: ${pass.status})`)
    }

    // ── Check existing gate logs ──
    const existingLogs = await GateLog.findAll({
      where:  { pass_id: pass.id },
      order:  [['scanned_at', 'ASC']],
      transaction
    })

    // ── Already completed ──
    if (existingLogs.length >= 2) {
      await transaction.commit()
      const studentDetails = await getStudentDetails(pass.student_id)
      return {
        passId:        pass.id,
        scanResult:    'COMPLETED',
        message:       'Pass already completed',
        statusMessage: 'This pass has already been used for both exit and return.',
        studentDetails,
        passDetails:   buildPassDetails(pass),
        approvalDetails: {
          coordinator:  pass.coordinator?.name  || null,
          hostelStaff:  pass.hostelStaff?.name  || null
        },
        scanDetails: { action: 'COMPLETED', timestamp: new Date() }
      }
    }

    // ── Determine action ──
    let action
    if (existingLogs.length === 0) {
      action = 'OUT'
    } else if (existingLogs.length === 1 && existingLogs[0].action === 'OUT') {
      action = 'IN'
    } else {
      throw new Error('Invalid gate log state')
    }

    // ── Create gate log ──
    const gateLog = await GateLog.create({
      pass_id:    pass.id,
      action,
      scan_status: 'VALID',
      scanned_by:  securityUserId,
      scanned_at:  new Date()
    }, { transaction })

    // ── Mark pass COMPLETED after IN scan ──
    if (action === 'IN') {
      await Pass.update(
        { status: 'COMPLETED' },
        { where: { id: pass.id }, transaction }
      )
    }

    await transaction.commit()

    const studentDetails = await getStudentDetails(pass.student_id)

    return {
      passId:        pass.id,
      scanResult:    action,
      message:       action === 'OUT' ? 'Exit recorded — student is now outside' : 'Return recorded — student is back',
      statusMessage: action === 'OUT'
        ? 'Student has exited campus. QR will be scanned again on return.'
        : 'Student has returned to campus. Pass is now completed.',
      studentDetails,
      passDetails:   buildPassDetails(pass),
      approvalDetails: {
        coordinator:  pass.coordinator?.name  || null,
        hostelStaff:  pass.hostelStaff?.name  || null
      },
      scanDetails: {
        action,
        timestamp: gateLog.scanned_at
      }
    }
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback()
    }
    throw new Error(`Scan failed: ${error.message}`)
  }
}

// ─── Today's Logs ──────────────────────────────────────────────────────────────

export const getTodayLogs = async () => {
  try {
    const { start, end } = todayRange()
    const logs = await GateLog.findAll({
      where: { scanned_at: { [Op.gte]: start, [Op.lt]: end } },
      include: [
        {
          model: Pass,
          attributes: ['id', 'pass_type', 'destination', 'from_date', 'to_date', 'pass_date', 'leaving_date', 'returning_date'],
          include: [
            {
              model: Student,
              attributes: ['id', 'usn'],
              include: [
                { model: User,       attributes: ['id', 'name'] },
                { model: Department, attributes: ['id', 'name'] }
              ]
            }
          ]
        },
        { model: User, as: 'scanner', attributes: ['id', 'name'] }
      ],
      order: [['scanned_at', 'DESC']]
    })

    return logs.map(log => ({
      id:          log.id,
      passId:      log.pass_id,
      studentUSN:  log.Pass?.Student?.usn,
      studentName: log.Pass?.Student?.User?.name,
      department:  log.Pass?.Student?.Department?.name,
      passType:    log.Pass?.pass_type,
      action:      log.action,
      scanStatus:  log.scan_status,
      scannedAt:   log.scanned_at,
      scannedBy:   log.scanner?.name || 'Unknown'
    }))
  } catch (error) {
    throw new Error(`Failed to get today's logs: ${error.message}`)
  }
}

// ─── All Logs ──────────────────────────────────────────────────────────────────

export const getAllLogs = async (filter = 'ALL', search = '') => {
  try {
    const { start, end } = todayRange()
    const where = {}

    if (filter === 'OUT')     where.action = 'OUT'
    else if (filter === 'IN') where.action = 'IN'
    else if (filter === 'TODAY') {
      where.scanned_at = { [Op.gte]: start, [Op.lt]: end }
    } else if (filter === 'YESTERDAY') {
      const yStart = new Date(start); yStart.setDate(yStart.getDate() - 1)
      const yEnd   = new Date(start)
      where.scanned_at = { [Op.gte]: yStart, [Op.lt]: yEnd }
    } else if (filter === 'THIS_WEEK') {
      const weekStart = new Date(start)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      where.scanned_at = { [Op.gte]: weekStart, [Op.lt]: end }
    }

    const logs = await GateLog.findAll({
      where,
      include: [
        {
          model: Pass,
          attributes: ['id', 'pass_type', 'destination', 'from_date', 'to_date', 'pass_date', 'leaving_date', 'returning_date'],
          include: [
            {
              model: Student,
              attributes: ['id', 'usn'],
              include: [
                { model: User,       attributes: ['id', 'name'] },
                { model: Department, attributes: ['id', 'name'] }
              ]
            }
          ]
        },
        { model: User, as: 'scanner', attributes: ['id', 'name'] }
      ],
      order: [['scanned_at', 'DESC']]
    })

    let result = logs.map(log => ({
      id:          log.id,
      passId:      log.pass_id,
      studentUSN:  log.Pass?.Student?.usn,
      studentName: log.Pass?.Student?.User?.name,
      department:  log.Pass?.Student?.Department?.name,
      passType:    log.Pass?.pass_type,
      action:      log.action,
      scanStatus:  log.scan_status,
      scannedAt:   log.scanned_at,
      scannedBy:   log.scanner?.name || 'Unknown'
    }))

    // Apply search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.studentName?.toLowerCase().includes(q) ||
        l.studentUSN?.toLowerCase().includes(q)  ||
        l.department?.toLowerCase().includes(q)
      )
    }

    return result
  } catch (error) {
    throw new Error(`Failed to get logs: ${error.message}`)
  }
}

// ─── Students Currently Outside ────────────────────────────────────────────────

/**
 * Get all students currently outside campus.
 * A student is "outside" if their pass has an OUT log but no IN log.
 * Includes overdue detection and days remaining calculation.
 */
export const getStudentsOutside = async () => {
  try {
    const now = new Date()

    // Find all passes with at least one OUT log
    const outLogs = await GateLog.findAll({
      attributes: ['pass_id'],
      where: { action: 'OUT' },
      raw: true
    })
    const outPassIds = [...new Set(outLogs.map(l => l.pass_id))]
    if (outPassIds.length === 0) return []

    // Find which of those also have an IN log (returned)
    const inLogs = await GateLog.findAll({
      attributes: ['pass_id'],
      where: { action: 'IN', pass_id: { [Op.in]: outPassIds } },
      raw: true
    })
    const returnedPassIds = new Set(inLogs.map(l => l.pass_id))

    // Outside = OUT but no IN
    const outsidePassIds = outPassIds.filter(id => !returnedPassIds.has(id))
    if (outsidePassIds.length === 0) return []

    // Fetch full pass details for outside students
    const passes = await Pass.findAll({
      where: { id: { [Op.in]: outsidePassIds } },
      include: [
        {
          model: Student,
          attributes: ['id', 'usn', 'hostel_name', 'room_number', 'program_type', 'year_of_study', 'semester'],
          include: [
            { model: User,       attributes: ['id', 'name', 'email', 'phone'] },
            { model: Department, attributes: ['id', 'name', 'code'] }
          ]
        },
        { model: User, as: 'coordinator',  attributes: ['id', 'name'] },
        { model: User, as: 'hostelStaff',  attributes: ['id', 'name'] }
      ]
    })

    // Get the OUT scan time for each pass
    const outScanMap = {}
    const outScanDetails = await GateLog.findAll({
      where: { pass_id: { [Op.in]: outsidePassIds }, action: 'OUT' },
      order: [['scanned_at', 'DESC']],
      raw: true
    })
    outScanDetails.forEach(log => {
      if (!outScanMap[log.pass_id]) outScanMap[log.pass_id] = log.scanned_at
    })

    return passes.map(pass => {
      const isDaily    = pass.pass_type === 'DAILY'
      const returnDate = isDaily
        ? pass.pass_date
        : (pass.returning_date || pass.to_date)
      const exitTime   = outScanMap[pass.id]

      // Calculate status
      let currentStatus = 'OUTSIDE'
      let daysRemaining = null
      if (returnDate) {
        const ret = new Date(returnDate)
        ret.setHours(23, 59, 59, 999)
        if (now > ret) {
          currentStatus = 'OVERDUE'
          daysRemaining = Math.ceil((now - ret) / (1000 * 60 * 60 * 24)) * -1
        } else {
          const today = new Date(); today.setHours(0, 0, 0, 0)
          const retDay = new Date(returnDate); retDay.setHours(0, 0, 0, 0)
          daysRemaining = Math.ceil((retDay - today) / (1000 * 60 * 60 * 24))
          if (daysRemaining === 0) currentStatus = 'RETURNING_TODAY'
        }
      }

      return {
        passId:        pass.id,
        pass_type:     pass.pass_type,
        status:        pass.status,
        currentStatus,
        destination:   pass.destination,
        reason:        pass.reason,
        exitTime,
        returnDate,
        daysRemaining,
        // Student
        studentName:   pass.Student?.User?.name,
        studentUSN:    pass.Student?.usn,
        studentEmail:  pass.Student?.User?.email,
        studentPhone:  pass.Student?.User?.phone,
        department:    pass.Student?.Department?.name,
        hostelName:    pass.Student?.hostel_name,
        roomNumber:    pass.Student?.room_number,
        programType:   pass.Student?.program_type,
        yearOfStudy:   pass.Student?.year_of_study,
        semester:      pass.Student?.semester,
        // Approvers
        coordinator:   pass.coordinator?.name  || null,
        hostelStaff:   pass.hostelStaff?.name  || null,
        // Dates
        passDate:      pass.pass_date,
        leavingDate:   pass.leaving_date || pass.from_date,
        returningDate: pass.returning_date || pass.to_date
      }
    })
  } catch (error) {
    throw new Error(`Failed to get students outside: ${error.message}`)
  }
}

// ─── Dashboard Statistics ──────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  try {
    const { start, end } = todayRange()
    const now = new Date()

    // ── Today's scan count ──
    const todayScansCount = await GateLog.count({
      where: { scanned_at: { [Op.gte]: start, [Op.lt]: end } }
    })

    // ── Students currently outside (all time, not just today) ──
    const outsideStudents = await getStudentsOutside()
    const studentsOutsideCount  = outsideStudents.length
    const overdueCount          = outsideStudents.filter(s => s.currentStatus === 'OVERDUE').length
    const returningTodayCount   = outsideStudents.filter(s => s.currentStatus === 'RETURNING_TODAY').length
    const longLeaveOutsideCount = outsideStudents.filter(s => s.pass_type === 'LONG_LEAVE').length
    const dailyOutsideCount     = outsideStudents.filter(s => s.pass_type === 'DAILY').length

    // ── Completed passes today ──
    const todayOutPassIds = (await GateLog.findAll({
      attributes: ['pass_id'],
      where: { action: 'OUT', scanned_at: { [Op.gte]: start, [Op.lt]: end } },
      raw: true
    })).map(l => l.pass_id)

    let completedCount = 0
    if (todayOutPassIds.length > 0) {
      const todayInPassIds = (await GateLog.findAll({
        attributes: ['pass_id'],
        where: { action: 'IN', pass_id: { [Op.in]: todayOutPassIds }, scanned_at: { [Op.gte]: start, [Op.lt]: end } },
        raw: true
      })).map(l => l.pass_id)
      completedCount = todayInPassIds.length
    }

    // ── Recent activity (last 10 scans) ──
    const recentLogs = await GateLog.findAll({
      include: [
        {
          model: Pass,
          attributes: ['id', 'pass_type', 'destination'],
          include: [
            {
              model: Student,
              attributes: ['id', 'usn'],
              include: [{ model: User, attributes: ['id', 'name'] }]
            }
          ]
        },
        { model: User, as: 'scanner', attributes: ['id', 'name'] }
      ],
      order: [['scanned_at', 'DESC']],
      limit: 10
    })

    return {
      todayScans:          todayScansCount,
      studentsOutside:     studentsOutsideCount,
      completedPasses:     completedCount,
      overdueStudents:     overdueCount,
      returningToday:      returningTodayCount,
      longLeaveOutside:    longLeaveOutsideCount,
      dailyPassOutside:    dailyOutsideCount,
      recentActivity: recentLogs.map(log => ({
        id:          log.id,
        passId:      log.pass_id,
        studentName: log.Pass?.Student?.User?.name,
        studentUSN:  log.Pass?.Student?.usn,
        passType:    log.Pass?.pass_type,
        action:      log.action,
        scannedAt:   log.scanned_at,
        scannedBy:   log.scanner?.name || 'Unknown'
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
  getStudentsOutside,
  getDashboardStats
}
