import User from './User.js'
import Department from './Department.js'
import Student from './Student.js'
import Pass from './Pass.js'
import Approval from './Approval.js'
import QRToken from './QRToken.js'
import GateLog from './GateLog.js'
import Notification from './Notification.js'
import ActivityLog from './ActivityLog.js'

// Define associations

// Department associations
Department.hasMany(Student, { foreignKey: 'department_id', onDelete: 'RESTRICT' })
Student.belongsTo(Department, { foreignKey: 'department_id' })

// User associations
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Student.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(Approval, { foreignKey: 'approved_by', onDelete: 'SET NULL' })
Approval.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' })

User.hasMany(GateLog, { foreignKey: 'scanned_by', onDelete: 'SET NULL' })
GateLog.belongsTo(User, { foreignKey: 'scanned_by', as: 'scanner' })

User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE' })
Notification.belongsTo(User, { foreignKey: 'user_id' })

User.hasMany(ActivityLog, { foreignKey: 'user_id', onDelete: 'CASCADE' })
ActivityLog.belongsTo(User, { foreignKey: 'user_id' })

// Student associations
Student.hasMany(Pass, { foreignKey: 'student_id', onDelete: 'CASCADE' })
Pass.belongsTo(Student, { foreignKey: 'student_id' })

// Pass associations
Pass.hasMany(Approval, { foreignKey: 'pass_id', onDelete: 'CASCADE' })
Approval.belongsTo(Pass, { foreignKey: 'pass_id' })

Pass.belongsTo(User, { foreignKey: 'coordinator_id', as: 'coordinator' })
User.hasMany(Pass, { foreignKey: 'coordinator_id', onDelete: 'SET NULL' })

Pass.belongsTo(User, { foreignKey: 'hostel_staff_id', as: 'hostelStaff' })
User.hasMany(Pass, { foreignKey: 'hostel_staff_id', as: 'hostelPasses', onDelete: 'SET NULL' })

Pass.hasOne(QRToken, { foreignKey: 'pass_id', onDelete: 'CASCADE' })
QRToken.belongsTo(Pass, { foreignKey: 'pass_id' })

Pass.hasMany(GateLog, { foreignKey: 'pass_id', onDelete: 'CASCADE' })
GateLog.belongsTo(Pass, { foreignKey: 'pass_id' })

// Notification associations
Notification.belongsTo(Pass, { foreignKey: 'related_pass_id', as: 'relatedPass' })
Pass.hasMany(Notification, { foreignKey: 'related_pass_id', onDelete: 'SET NULL' })

export { User, Department, Student, Pass, Approval, QRToken, GateLog, Notification, ActivityLog }
