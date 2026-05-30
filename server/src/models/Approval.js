import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pass_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'passes',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  stage: {
    type: DataTypes.ENUM('COORDINATOR', 'HOSTEL_STAFF'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  remarks: {
    type: DataTypes.TEXT
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'approvals',
  timestamps: true
})

export default Approval
