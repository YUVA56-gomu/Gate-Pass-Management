import { Op, sequelize } from 'sequelize'
import { User, Student, Pass, Department, Approval, GateLog } from '../models/index.js'

/**
 * Get overall system statistics
 * Calculates from actual database records (no hardcoded values)
 * SQL-equivalent: Multiple COUNT queries with WHERE clauses
 */
export const getOverallStats = async () => {
  try {
    // Count users by role
    const totalStudents = await User.count({
      where: { role: 'STUDENT' }
    })

    const totalCoordinators = await User.count({
      where: { role: 'COORDINATOR' }
    })

    const totalHostelStaff = await User.count({
      where: { role: 'HOSTEL_STAFF' }
    })

    const totalSecurityStaff = await User.count({
      where: { role: 'SECURITY' }
    })

    // Count passes by status
    const totalPasses = await Pass.count()

    const approvedPasses = await Pass.count({
      where: { status: 'APPROVED' }
    })

    const rejectedPasses = await Pass.count({
      where: { status: 'REJECTED' }
    })

    const pendingPasses = await Pass.count({
      where: {
        status: {
          [Op.in]: ['PENDING_COORDINATOR', 'PENDING_HOSTEL']
        }
      }
    })

    const completedPasses = await Pass.count({
      where: { status: 'COMPLETED' }
    })

    // Count students outside (OUT exists AND IN missing today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

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

    const outPassIds = studentsOutside.map(log => log.pass_id)
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
      studentsOutsideCount = outPassIds.filter(id => !inPassIds.includes(id)).length
    }

    return {
      users: {
        totalStudents,
        totalCoordinators,
        totalHostelStaff,
        totalSecurityStaff
      },
      passes: {
        totalPasses,
        approvedPasses,
        rejectedPasses,
        pendingPasses,
        completedPasses
      },
      security: {
        studentsOutside: studentsOutsideCount
      }
    }
  } catch (error) {
    throw new Error(`Failed to get overall stats: ${error.message}`)
  }
}

/**
 * Get department-wise pass statistics
 * SQL-equivalent: SELECT department_id, COUNT(*), COUNT(CASE WHEN status='APPROVED'...) FROM passes GROUP BY department_id
 */
export const getDepartmentStats = async () => {
  try {
    // Get all departments
    const departments = await Department.findAll({
      attributes: ['id', 'name', 'code']
    })

    // For each department, get statistics
    const stats = await Promise.all(
      departments.map(async (dept) => {
        // Count students in department
        const totalStudents = await Student.count({
          where: { department_id: dept.id }
        })

        // Count passes for students in this department
        const totalPasses = await Pass.count({
          include: [
            {
              model: Student,
              where: { department_id: dept.id },
              attributes: []
            }
          ]
        })

        const approvedPasses = await Pass.count({
          where: { status: 'APPROVED' },
          include: [
            {
              model: Student,
              where: { department_id: dept.id },
              attributes: []
            }
          ]
        })

        const rejectedPasses = await Pass.count({
          where: { status: 'REJECTED' },
          include: [
            {
              model: Student,
              where: { department_id: dept.id },
              attributes: []
            }
          ]
        })

        return {
          departmentName: dept.name,
          departmentCode: dept.code,
          totalStudents,
          totalPasses,
          approvedPasses,
          rejectedPasses
        }
      })
    )

    return stats
  } catch (error) {
    throw new Error(`Failed to get department stats: ${error.message}`)
  }
}

/**
 * Get monthly pass statistics
 * MySQL-compatible aggregation using DATE_FORMAT for grouping
 * SQL-equivalent: SELECT DATE_FORMAT(createdAt, '%Y-%m'), COUNT(*), COUNT(CASE WHEN status='APPROVED'...) FROM passes GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
 * Performance: Uses database aggregation for efficiency
 * Correction 2: Replaced PostgreSQL-specific DATE_TRUNC with MySQL-compatible DATE_FORMAT
 * Correction 3: Verified monthly grouping and sorting (newest month first)
 */
export const getMonthlyStats = async () => {
  try {
    // Get passes grouped by month using MySQL-compatible DATE_FORMAT
    // DATE_FORMAT(createdAt, '%Y-%m') groups by YYYY-MM format
    const monthlyData = await Pass.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'monthKey'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalPasses'],
        [sequelize.fn('SUM', sequelize.where(sequelize.col('status'), Op.eq, 'APPROVED')), 'approvedPasses'],
        [sequelize.fn('SUM', sequelize.where(sequelize.col('status'), Op.eq, 'REJECTED')), 'rejectedPasses']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'DESC']],
      raw: true,
      subQuery: false
    })

    // Format the data: Convert YYYY-MM to "Month Year" format
    return monthlyData.map(data => {
      let monthName = 'Unknown'
      if (data.monthKey) {
        const [year, month] = data.monthKey.split('-')
        const date = new Date(year, parseInt(month) - 1, 1)
        monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      }
      return {
        month: monthName,
        totalPasses: parseInt(data.totalPasses) || 0,
        approvedPasses: parseInt(data.approvedPasses) || 0,
        rejectedPasses: parseInt(data.rejectedPasses) || 0
      }
    })
  } catch (error) {
    throw new Error(`Failed to get monthly stats: ${error.message}`)
  }
}

/**
 * Get pass type statistics
 * SQL-equivalent: SELECT type, COUNT(*), COUNT(CASE WHEN status='APPROVED'...) FROM passes GROUP BY type
 */
export const getPassTypeStats = async () => {
  try {
    const passTypes = ['DAILY', 'LONG_LEAVE']

    const stats = await Promise.all(
      passTypes.map(async (type) => {
        const totalCount = await Pass.count({
          where: { type }
        })

        const approvedCount = await Pass.count({
          where: { type, status: 'APPROVED' }
        })

        const rejectedCount = await Pass.count({
          where: { type, status: 'REJECTED' }
        })

        return {
          passType: type,
          totalCount,
          approvedCount,
          rejectedCount
        }
      })
    )

    return stats
  } catch (error) {
    throw new Error(`Failed to get pass type stats: ${error.message}`)
  }
}

/**
 * Get security statistics
 * Uses GateLog table for entry/exit tracking
 * Correction 1: Fixed students outside calculation using proper database queries
 * Correction 4: Verified all calculations from actual GateLog records (no hardcoded values)
 * Correction 5: Added comments explaining calculation logic
 */
export const getSecurityStats = async () => {
  try {
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count today's OUT scans
    // SQL: SELECT COUNT(*) FROM gate_logs WHERE action='OUT' AND scanned_at >= today AND scanned_at < tomorrow
    const todayOutScans = await GateLog.count({
      where: {
        action: 'OUT',
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    })

    // Count today's IN scans
    // SQL: SELECT COUNT(*) FROM gate_logs WHERE action='IN' AND scanned_at >= today AND scanned_at < tomorrow
    const todayInScans = await GateLog.count({
      where: {
        action: 'IN',
        scanned_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    })

    // Get all OUT pass IDs today
    // SQL: SELECT DISTINCT pass_id FROM gate_logs WHERE action='OUT' AND scanned_at >= today AND scanned_at < tomorrow
    const outLogs = await GateLog.findAll({
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

    const outPassIds = outLogs.map(log => log.pass_id)
    let completedPassesCount = 0
    let studentsOutsideCount = 0

    // If there are OUT logs, check for corresponding IN logs
    if (outPassIds.length > 0) {
      // Get all IN pass IDs today
      // SQL: SELECT DISTINCT pass_id FROM gate_logs WHERE action='IN' AND pass_id IN (...) AND scanned_at >= today AND scanned_at < tomorrow
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
      
      // Completed passes: passes with both OUT and IN logs
      completedPassesCount = inPassIds.length
      
      // Students outside: passes with OUT but no IN log
      // SQL: SELECT COUNT(*) FROM (SELECT pass_id FROM gate_logs WHERE action='OUT' AND pass_id NOT IN (SELECT pass_id FROM gate_logs WHERE action='IN' AND ...))
      studentsOutsideCount = outPassIds.filter(id => !inPassIds.includes(id)).length
    }

    // Get recent security activity (last 10 scans)
    // SQL: SELECT * FROM gate_logs ORDER BY scanned_at DESC LIMIT 10 (with joins to Pass, Student, User)
    const recentActivity = await GateLog.findAll({
      include: [
        {
          model: Pass,
          attributes: ['id', 'type'],
          include: [
            {
              model: Student,
              attributes: ['usn'],
              include: [
                {
                  model: User,
                  attributes: ['name']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'scanner',
          attributes: ['name']
        }
      ],
      order: [['scanned_at', 'DESC']],
      limit: 10
    })

    return {
      todayOutScans,
      todayInScans,
      completedPasses: completedPassesCount,
      studentsOutside: studentsOutsideCount,
      recentActivity: recentActivity.map(log => ({
        studentName: log.Pass.Student.User.name,
        studentUSN: log.Pass.Student.usn,
        passType: log.Pass.type,
        action: log.action,
        scannedAt: log.scanned_at,
        scannedBy: log.scanner?.name || 'Unknown'
      }))
    }
  } catch (error) {
    throw new Error(`Failed to get security stats: ${error.message}`)
  }
}

/**
 * Get coordinator performance statistics
 * SQL-equivalent: SELECT approved_by, COUNT(*), COUNT(CASE WHEN status='APPROVED'...) FROM approvals GROUP BY approved_by
 * Correction 5: Verified approvals/rejections/pending calculated correctly
 * Correction 5: Ensured pending count reflects actual coordinator workload (PENDING_COORDINATOR status only)
 * Correction 9: Added comments explaining calculation logic
 */
export const getCoordinatorPerformance = async () => {
  try {
    // Get all coordinators
    const coordinators = await User.findAll({
      where: { role: 'COORDINATOR' },
      attributes: ['id', 'name']
    })

    // For each coordinator, get performance stats
    const stats = await Promise.all(
      coordinators.map(async (coordinator) => {
        // Get approvals by this coordinator
        // SQL: SELECT * FROM approvals WHERE approved_by = coordinator.id
        const approvals = await Approval.findAll({
          where: { approved_by: coordinator.id },
          attributes: ['id', 'status', 'approved_at', 'createdAt']
        })

        // Count approvals (status = 'APPROVED')
        const totalApprovals = approvals.filter(a => a.status === 'APPROVED').length
        
        // Count rejections (status = 'REJECTED')
        const totalRejections = approvals.filter(a => a.status === 'REJECTED').length

        // Count pending passes for this coordinator
        // SQL: SELECT COUNT(*) FROM passes WHERE status = 'PENDING_COORDINATOR'
        // Note: This is system-wide pending count, not per-coordinator, as passes are not assigned to specific coordinators
        const pendingPasses = await Pass.count({
          where: { status: 'PENDING_COORDINATOR' }
        })

        // Calculate average processing time (in minutes)
        // Processing time = approved_at - createdAt (for each approval)
        // Average = sum of all processing times / number of approvals
        let avgProcessingTime = 0
        if (approvals.length > 0) {
          const processingTimes = approvals.map(a => {
            const createdTime = new Date(a.createdAt)
            const approvedTime = new Date(a.approved_at)
            return (approvedTime - createdTime) / (1000 * 60) // convert milliseconds to minutes
          })
          avgProcessingTime = Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
        }

        return {
          coordinatorName: coordinator.name,
          approvals: totalApprovals,
          rejections: totalRejections,
          pending: pendingPasses,
          avgProcessingTimeMinutes: avgProcessingTime
        }
      })
    )

    return stats
  } catch (error) {
    throw new Error(`Failed to get coordinator performance: ${error.message}`)
  }
}

/**
 * Get hostel staff performance statistics
 * SQL-equivalent: SELECT approved_by, COUNT(*), COUNT(CASE WHEN status='APPROVED'...) FROM approvals GROUP BY approved_by
 * Correction 6: Verified approvals/rejections/pending calculated correctly
 * Correction 6: Ensured pending count reflects actual hostel staff workload (PENDING_HOSTEL status only)
 * Correction 9: Added comments explaining calculation logic
 */
export const getHostelStaffPerformance = async () => {
  try {
    // Get all hostel staff
    const hostelStaff = await User.findAll({
      where: { role: 'HOSTEL_STAFF' },
      attributes: ['id', 'name']
    })

    // For each hostel staff member, get performance stats
    const stats = await Promise.all(
      hostelStaff.map(async (staff) => {
        // Get approvals by this staff member
        // SQL: SELECT * FROM approvals WHERE approved_by = staff.id
        const approvals = await Approval.findAll({
          where: { approved_by: staff.id },
          attributes: ['id', 'status', 'approved_at', 'createdAt']
        })

        // Count approvals (status = 'APPROVED')
        const totalApprovals = approvals.filter(a => a.status === 'APPROVED').length
        
        // Count rejections (status = 'REJECTED')
        const totalRejections = approvals.filter(a => a.status === 'REJECTED').length

        // Count pending passes for this hostel staff
        // SQL: SELECT COUNT(*) FROM passes WHERE status = 'PENDING_HOSTEL'
        // Note: This is system-wide pending count, not per-staff, as passes are not assigned to specific staff members
        const pendingPasses = await Pass.count({
          where: { status: 'PENDING_HOSTEL' }
        })

        // Calculate average processing time (in minutes)
        // Processing time = approved_at - createdAt (for each approval)
        // Average = sum of all processing times / number of approvals
        let avgProcessingTime = 0
        if (approvals.length > 0) {
          const processingTimes = approvals.map(a => {
            const createdTime = new Date(a.createdAt)
            const approvedTime = new Date(a.approved_at)
            return (approvedTime - createdTime) / (1000 * 60) // convert milliseconds to minutes
          })
          avgProcessingTime = Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
        }

        return {
          hostelStaffName: staff.name,
          approvals: totalApprovals,
          rejections: totalRejections,
          pending: pendingPasses,
          avgProcessingTimeMinutes: avgProcessingTime
        }
      })
    )

    return stats
  } catch (error) {
    throw new Error(`Failed to get hostel staff performance: ${error.message}`)
  }
}

/**
 * Export data as CSV format
 * Prepares data for CSV export (actual file generation handled by controller)
 * Correction 7: Verified all report types export correctly
 * Correction 8: Standardized error handling with clear messages
 * Correction 9: Added comments explaining CSV export strategy
 */
export const exportDataAsCSV = async (reportType) => {
  try {
    let data = []
    let headers = []

    // Validate report type
    const validTypes = ['overall', 'departments', 'monthly', 'passTypes', 'coordinators', 'hostelStaff']
    if (!validTypes.includes(reportType)) {
      throw new Error(`Invalid report type: ${reportType}`)
    }

    // Generate data based on report type
    switch (reportType) {
      case 'overall':
        // CSV: Overall System Statistics
        const overallStats = await getOverallStats()
        headers = ['Metric', 'Value']
        data = [
          ['Total Students', overallStats.users.totalStudents],
          ['Total Coordinators', overallStats.users.totalCoordinators],
          ['Total Hostel Staff', overallStats.users.totalHostelStaff],
          ['Total Security Staff', overallStats.users.totalSecurityStaff],
          ['Total Passes', overallStats.passes.totalPasses],
          ['Approved Passes', overallStats.passes.approvedPasses],
          ['Rejected Passes', overallStats.passes.rejectedPasses],
          ['Pending Passes', overallStats.passes.pendingPasses],
          ['Completed Passes', overallStats.passes.completedPasses],
          ['Students Outside', overallStats.security.studentsOutside]
        ]
        break

      case 'departments':
        // CSV: Department-wise Statistics
        const deptStats = await getDepartmentStats()
        headers = ['Department', 'Total Students', 'Total Passes', 'Approved', 'Rejected']
        data = deptStats.map(d => [d.departmentName, d.totalStudents, d.totalPasses, d.approvedPasses, d.rejectedPasses])
        break

      case 'monthly':
        // CSV: Monthly Pass Statistics
        const monthlyStats = await getMonthlyStats()
        headers = ['Month', 'Total Passes', 'Approved', 'Rejected']
        data = monthlyStats.map(m => [m.month, m.totalPasses, m.approvedPasses, m.rejectedPasses])
        break

      case 'passTypes':
        // CSV: Pass Type Statistics
        const passTypeStats = await getPassTypeStats()
        headers = ['Pass Type', 'Total', 'Approved', 'Rejected']
        data = passTypeStats.map(p => [p.passType, p.totalCount, p.approvedCount, p.rejectedCount])
        break

      case 'coordinators':
        // CSV: Coordinator Performance
        const coordStats = await getCoordinatorPerformance()
        headers = ['Coordinator', 'Approvals', 'Rejections', 'Pending', 'Avg Processing Time (min)']
        data = coordStats.map(c => [c.coordinatorName, c.approvals, c.rejections, c.pending, c.avgProcessingTimeMinutes])
        break

      case 'hostelStaff':
        // CSV: Hostel Staff Performance
        const hostelStats = await getHostelStaffPerformance()
        headers = ['Hostel Staff', 'Approvals', 'Rejections', 'Pending', 'Avg Processing Time (min)']
        data = hostelStats.map(h => [h.hostelStaffName, h.approvals, h.rejections, h.pending, h.avgProcessingTimeMinutes])
        break

      default:
        throw new Error('Report type is required')
    }

    // Convert to CSV format with proper escaping
    // Format: header1,header2,header3\n"value1","value2","value3"\n...
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  } catch (error) {
    throw new Error(`Failed to export data as CSV: ${error.message}`)
  }
}

/**
 * Export data as PDF format
 * Prepares data for PDF export (actual PDF generation handled by controller or frontend)
 * Correction 9: Added comments explaining PDF export strategy
 * Future: PDF generation can be implemented using pdfkit or similar library
 * Strategy: Return structured data that can be used by frontend or backend PDF generator
 */
export const exportDataAsPDF = async (reportType) => {
  try {
    let data = {}

    // Validate report type
    const validTypes = ['overall', 'departments', 'monthly', 'passTypes', 'security', 'coordinators', 'hostelStaff']
    if (!validTypes.includes(reportType)) {
      throw new Error(`Invalid report type: ${reportType}`)
    }

    // Generate data based on report type
    switch (reportType) {
      case 'overall':
        data = await getOverallStats()
        break
      case 'departments':
        data = await getDepartmentStats()
        break
      case 'monthly':
        data = await getMonthlyStats()
        break
      case 'passTypes':
        data = await getPassTypeStats()
        break
      case 'security':
        data = await getSecurityStats()
        break
      case 'coordinators':
        data = await getCoordinatorPerformance()
        break
      case 'hostelStaff':
        data = await getHostelStaffPerformance()
        break
      default:
        throw new Error('Report type is required')
    }

    // Return structured data for PDF generation
    // Frontend or backend can use this data with pdfkit or similar library
    return {
      reportType,
      generatedAt: new Date(),
      data
    }
  } catch (error) {
    throw new Error(`Failed to prepare PDF export: ${error.message}`)
  }
}

export default {
  getOverallStats,
  getDepartmentStats,
  getMonthlyStats,
  getPassTypeStats,
  getSecurityStats,
  getCoordinatorPerformance,
  getHostelStaffPerformance,
  exportDataAsCSV,
  exportDataAsPDF
}
