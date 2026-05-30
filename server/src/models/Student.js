import { DataTypes } from 'sequelize'
import sequelize from '../config/db.js'

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  usn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  branch: {
    type: DataTypes.STRING
  },
  room_no: {
    type: DataTypes.STRING
  },
  phone: {
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
  tableName: 'students',
  timestamps: true
})

export default Student
