import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const GateLog = sequelize.define('GateLog', {
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
  action: {
    type: DataTypes.ENUM('IN', 'OUT'),
    allowNull: false
  },
  scan_status: {
    type: DataTypes.ENUM('VALID', 'INVALID', 'EXPIRED'),
    defaultValue: 'VALID'
  },
  scanned_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  scanned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'gate_logs',
  timestamps: false
})

export default GateLog
