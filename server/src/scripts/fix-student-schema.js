/**
 * Fix Student table schema
 * Makes department_id and other fields nullable
 */

import sequelize from '../config/db.js'

const fixStudentSchema = async () => {
  try {
    console.log('Starting Student schema fix...')

    // Get the query interface
    const queryInterface = sequelize.getQueryInterface()

    // Check if students table exists
    const tables = await queryInterface.showAllTables()
    if (!tables.includes('students')) {
      console.log('Students table does not exist. Skipping fix.')
      return
    }

    console.log('Fixing Student table schema...')

    // Use raw SQL to alter columns
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
        console.log(`Executing: ${statement}`)
        await sequelize.query(statement)
        console.log(`✓ Success`)
      } catch (error) {
        console.log(`Note: ${error.message}`)
      }
    }

    console.log('✓ Student schema fix completed successfully')
  } catch (error) {
    console.error('Error fixing Student schema:', error.message)
    process.exit(1)
  }
}

// Run the fix
fixStudentSchema().then(() => {
  console.log('Schema fix completed. You can now restart the server.')
  process.exit(0)
})
