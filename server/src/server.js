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
import securityRoutes from './routes/security.routes.js'
import userRoutes from './routes/user.routes.js'
import reportRoutes from './routes/report.routes.js'

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
app.use('/security', securityRoutes)
app.use('/users', userRoutes)
app.use('/reports', reportRoutes)

// Error handling
app.use(errorHandler)

// Database sync and server start
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected')
    
    await sequelize.sync({ alter: true })
    console.log('Database synced')
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
