import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const Pass = sequelize.define('Pass', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  pass_type: {
    type: DataTypes.ENUM('DAILY', 'LONG_LEAVE'),
    allowNull: false,
    defaultValue: 'DAILY'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pass_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'For DAILY pass type - the date of the pass'
  },
  from_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'For LONG_LEAVE pass type - leaving date'
  },
  to_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'For LONG_LEAVE pass type - returning date'
  },
  exit_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'For DAILY pass type - optional exit time'
  },
  expected_return_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'For DAILY pass type - optional expected return time'
  },
  parent_contact: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For LONG_LEAVE pass type - parent phone number'
  },
  coordinator_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Assigned coordinator for approval'
  },
  status: {
    type: DataTypes.ENUM('PENDING_COORDINATOR', 'PENDING_HOSTEL', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'),
    defaultValue: 'PENDING_HOSTEL'
  },
  pdf_path: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'passes',
  timestamps: true
})

export default Pass
