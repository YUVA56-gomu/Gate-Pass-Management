import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sequelize from './config/db.js'
import { errorHandler } from './middleware/error.middleware.js'

// Import models to establish associations
import './models/index.js'

// Routes
import authRoutes from './routes/auth.routes.js'
import studentRoutes from './routes/student.routes.js'
import passRoutes from './routes/pass.routes.js'
import approvalRoutes from './routes/approval.routes.js'
import hostelRoutes from './routes/hostel.routes.js'
import qrRoutes from './routes/qr.routes.js'
import pdfRoutes from './routes/pdf.routes.js'
import securityRoutes from './routes/security.routes.js'
import userRoutes from './routes/user.routes.js'
import adminRoutes from './routes/admin.routes.js'
import reportRoutes from './routes/report.routes.js'
import notificationRoutes from './routes/notification.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/auth', authRoutes)
app.use('/student', studentRoutes)
app.use('/passes', passRoutes)
app.use('/approvals', approvalRoutes)
app.use('/hostel', hostelRoutes)
app.use('/qr', qrRoutes)
app.use('/pdf', pdfRoutes)
app.use('/security', securityRoutes)
app.use('/users', userRoutes)
app.use('/admin', adminRoutes)
app.use('/reports', reportRoutes)
app.use('/notifications', notificationRoutes)

// Error handling
app.use(errorHandler)

// Fix Student schema - make fields nullable
const fixStudentSchema = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface()
    const tables = await queryInterface.showAllTables()
    
    if (!tables.includes('students')) {
      return
    }

    const alterStatements = [
      'ALTER TABLE students MODIFY COLUMN usn VARCHAR(255) NULL',
      'ALTER TABLE students MODIFY COLUMN department_id INT NULL',
      'ALTER TABLE students MODIFY COLUMN program_type ENUM("UG","PG") NULL',
      'ALTER TABLE students MODIFY COLUMN year_of_study INT NULL',
      'ALTER TABLE students MODIFY COLUMN semester INT NULL',
      'ALTER TABLE students MODIFY COLUMN gender ENUM("MALE","FEMALE","OTHER") NULL',
      'ALTER TABLE students MODIFY COLUMN hostel_name VARCHAR(255) NULL',
      'ALTER TABLE students MODIFY COLUMN hostel_type ENUM("BOYS","GIRLS") NULL',
      'ALTER TABLE students MODIFY COLUMN room_number VARCHAR(255) NULL',
      'ALTER TABLE students MODIFY COLUMN parent_phone VARCHAR(255) NULL',
      'ALTER TABLE students MODIFY COLUMN emergency_contact VARCHAR(255) NULL'
    ]

    for (const statement of alterStatements) {
      try {
        await sequelize.query(statement)
      } catch (error) {
        // Silently continue if column already nullable
      }
    }
  } catch (error) {
    console.error('Error fixing Student schema:', error.message)
  }
}

// Database sync and server start
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected')
    
    // Fix schema before sync
    await fixStudentSchema()
    
    // Use force: false to avoid dropping tables, and alter: false to avoid schema modification issues
    await sequelize.sync({ force: false, alter: false })
    console.log('Database synced')
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
