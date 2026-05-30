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
  type: {
    type: DataTypes.ENUM('DAILY', 'LONG_LEAVE'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  from_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  to_date: {
    type: DataTypes.DATE,
    allowNull: false
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
