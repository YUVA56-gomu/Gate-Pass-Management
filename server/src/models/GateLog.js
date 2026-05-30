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
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('IN', 'OUT'),
    allowNull: false
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
