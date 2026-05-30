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
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('daily', 'long_leave'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT
  },
  destination: {
    type: DataTypes.STRING
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
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  qr_code: {
    type: DataTypes.TEXT
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
