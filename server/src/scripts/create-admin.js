import sequelize from '../config/db.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

const createAdmin = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected')

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10)

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@smartgatepass.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+91-9876543210',
      is_active: true
    })

    console.log('\n✅ Admin Account Created Successfully!\n')
    console.log('========================================')
    console.log('Email: admin@smartgatepass.com')
    console.log('Password: Admin@123')
    console.log('ID: ' + admin.id)
    console.log('Role: ADMIN')
    console.log('========================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()
