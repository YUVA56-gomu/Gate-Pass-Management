import sequelize from './src/config/db.js'
import bcrypt from 'bcryptjs'

async function createHostelStaff() {
  try {
    console.log('👥 Creating hostel staff credentials...')
    
    await sequelize.authenticate()
    console.log('✅ Database connected')
    
    const hostelStaff = [
      {
        name: 'Priya Nair',
        email: 'priya.nair@hostel.edu',
        password: await bcrypt.hash('hostel123', 10),
        role: 'HOSTEL_STAFF',
        phone: '9876543220',
        is_active: true
      },
      {
        name: 'Suresh Kumar', 
        email: 'suresh.kumar@hostel.edu',
        password: await bcrypt.hash('hostel123', 10),
        role: 'HOSTEL_STAFF',
        phone: '9876543221',
        is_active: true
      }
    ]
    
    for (const staff of hostelStaff) {
      // Check if hostel staff already exists
      const [existing] = await sequelize.query(
        "SELECT id FROM users WHERE email = ?",
        { replacements: [staff.email] }
      )
      
      if (existing.length === 0) {
        await sequelize.query(
          "INSERT INTO users (name, email, password, role, phone, is_active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
          { replacements: [staff.name, staff.email, staff.password, staff.role, staff.phone, staff.is_active] }
        )
        console.log(`✅ Created hostel staff: ${staff.name}`)
      } else {
        console.log(`⚠️  Hostel staff already exists: ${staff.name}`)
      }
    }
    
    // Verify hostel staff
    const [hostelStaffCount] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE role = 'HOSTEL_STAFF' AND is_active = 1")
    console.log(`\n🎯 Total active hostel staff: ${hostelStaffCount[0].count}`)
    
    // Display credentials
    console.log('\n📋 HOSTEL STAFF LOGIN CREDENTIALS:')
    console.log('=====================================')
    console.log('1. Priya Nair (Girls Hostel)')
    console.log('   Email: priya.nair@hostel.edu')
    console.log('   Password: hostel123')
    console.log('   Phone: 9876543220')
    console.log('')
    console.log('2. Suresh Kumar (Boys Hostel)')
    console.log('   Email: suresh.kumar@hostel.edu')
    console.log('   Password: hostel123')
    console.log('   Phone: 9876543221')
    console.log('=====================================')
    
    console.log('\n🎉 Hostel staff credentials created successfully!')
    console.log('💡 Use these credentials to login as hostel staff and test the approval workflow.')
    
  } catch (error) {
    console.error('❌ Error creating hostel staff:', error.message)
  } finally {
    await sequelize.close()
  }
}

createHostelStaff()