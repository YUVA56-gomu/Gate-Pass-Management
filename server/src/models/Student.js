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
    allowNull: true,
    unique: true
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  program_type: {
    type: DataTypes.ENUM('UG', 'PG'),
    allowNull: true
  },
  year_of_study: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: true
  },
  hostel_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hostel_type: {
    type: DataTypes.ENUM('BOYS', 'GIRLS'),
    allowNull: true
  },
  room_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parent_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergency_contact: {
    type: DataTypes.STRING,
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
  tableName: 'students',
  timestamps: true
})

export default Student
