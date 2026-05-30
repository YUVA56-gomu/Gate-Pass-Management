import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING
  },
  entity_id: {
    type: DataTypes.INTEGER
  },
  old_values: {
    type: DataTypes.JSON
  },
  new_values: {
    type: DataTypes.JSON
  },
  ip_address: {
    type: DataTypes.STRING
  },
  user_agent: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activity_logs',
  timestamps: false
})

export default ActivityLog
