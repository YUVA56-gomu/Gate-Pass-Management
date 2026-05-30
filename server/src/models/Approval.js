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
    allowNull: false
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stage: {
    type: DataTypes.ENUM('coordinator', 'hostel_staff'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  remarks: {
    type: DataTypes.TEXT
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
