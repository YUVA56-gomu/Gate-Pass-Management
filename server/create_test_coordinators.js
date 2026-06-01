import sequelize from './src/config/db.js'
import bcrypt from 'bcryptjs'

async function createTestCoordinators() {
  try {
    console.log('👥 Creating test coordinators...')
    
    await sequelize.authenticate()
    console.log('✅ Database connected')
    
    const coordinators = [
      {
        name: 'Rahul Patil',
        email: 'rahul.patil@college.edu',
        password: await bcrypt.hash('coordinator123', 10),
        role: 'COORDINATOR',
        phone: '9876543210',
        is_active: true
      },
      {
        name: 'Anjali Sharma', 
        email: 'anjali.sharma@college.edu',
        password: await bcrypt.hash('coordinator123', 10),
        role: 'COORDINATOR',
        phone: '9876543211',
        is_active: true
      },
      {
        name: 'Ramesh Kulkarni',
        email: 'ramesh.kulkarni@college.edu', 
        password: await bcrypt.hash('coordinator123', 10),
        role: 'COORDINATOR',
        phone: '9876543212',
        is_active: true
      }
    ]
    
    for (const coordinator of coordinators) {
      // Check if coordinator already exists
      const [existing] = await sequelize.query(
        "SELECT id FROM users WHERE email = ?",
        { replacements: [coordinator.email] }
      )
      
      if (existing.length === 0) {
        await sequelize.query(
          "INSERT INTO users (name, email, password, role, phone, is_active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
          { replacements: [coordinator.name, coordinator.email, coordinator.password, coordinator.role, coordinator.phone, coordinator.is_active] }
        )
        console.log(`✅ Created coordinator: ${coordinator.name}`)
      } else {
        console.log(`⚠️  Coordinator already exists: ${coordinator.name}`)
      }
    }
    
    // Verify coordinators
    const [coordinators_count] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE role = 'COORDINATOR' AND is_active = 1")
    console.log(`\n🎯 Total active coordinators: ${coordinators_count[0].count}`)
    
    console.log('\n🎉 Test coordinators setup complete!')
    
  } catch (error) {
    console.error('❌ Error creating coordinators:', error.message)
  } finally {
    await sequelize.close()
  }
}

createTestCoordinators()