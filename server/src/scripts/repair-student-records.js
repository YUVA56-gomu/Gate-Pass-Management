/**
 * Repair Script: Create Student Records for Existing Users
 * 
 * This script creates Student records for all STUDENT users that don't have one.
 * It's safe to run multiple times - it only creates records for users without them.
 * 
 * Usage: node src/scripts/repair-student-records.js
 */

import sequelize from '../config/db.js'
import { User, Student } from '../models/index.js'

async function repairStudentRecords() {
  try {
    console.log('Starting student records repair...')
    console.log('Connecting to database...')

    // Ensure database connection
    await sequelize.authenticate()
    console.log('✅ Database connected')

    // Find all STUDENT users
    const studentUsers = await User.findAll({
      where: { role: 'STUDENT' },
      attributes: ['id', 'name', 'email']
    })

    console.log(`Found ${studentUsers.length} STUDENT users`)

    if (studentUsers.length === 0) {
      console.log('No student users found. Nothing to repair.')
      process.exit(0)
    }

    let createdCount = 0
    let skippedCount = 0

    // For each student user, check if Student record exists
    for (const user of studentUsers) {
      const existingStudent = await Student.findOne({
        where: { user_id: user.id }
      })

      if (existingStudent) {
        console.log(`⏭️  Skipped: User ${user.id} (${user.email}) already has Student record`)
        skippedCount++
      } else {
        // Create Student record with null values for profile fields
        await Student.create({
          user_id: user.id,
          usn: null,
          department_id: null,
          program_type: null,
          year_of_study: null,
          semester: null,
          gender: null,
          hostel_name: null,
          hostel_type: null,
          room_number: null,
          parent_phone: null,
          emergency_contact: null
        })

        console.log(`✅ Created: User ${user.id} (${user.email}) - Student record created`)
        createdCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('Repair Summary:')
    console.log(`  Total STUDENT users: ${studentUsers.length}`)
    console.log(`  New Student records created: ${createdCount}`)
    console.log(`  Existing Student records: ${skippedCount}`)
    console.log('='.repeat(60))

    if (createdCount > 0) {
      console.log(`\n✅ Successfully created ${createdCount} Student records`)
    } else {
      console.log('\n✅ All STUDENT users already have Student records')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error during repair:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run the repair
repairStudentRecords()
