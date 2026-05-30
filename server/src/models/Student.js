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
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  usn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  program_type: {
    type: DataTypes.ENUM('UG', 'PG'),
    allowNull: false
  },
  year_of_study: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: false
  },
  hostel_name: {
    type: DataTypes.STRING
  },
  hostel_type: {
    type: DataTypes.ENUM('BOYS', 'GIRLS'),
    allowNull: true
  },
  room_number: {
    type: DataTypes.STRING
  },
  parent_phone: {
    type: DataTypes.STRING
  },
  emergency_contact: {
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
