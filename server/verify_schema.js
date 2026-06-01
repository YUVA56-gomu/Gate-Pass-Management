import sequelize from './src/config/db.js'

async function verifySchema() {
  try {
    console.log('🔍 Verifying database schema...')
    
    // Test database connection
    await sequelize.authenticate()
    console.log('✅ Database connection successful')
    
    // Check passes table structure
    const [results] = await sequelize.query("DESCRIBE passes")
    console.log('\n📋 Passes table structure:')
    
    const relevantFields = results.filter(field => 
      ['pass_date', 'from_date', 'to_date', 'leaving_date', 'returning_date', 'coordinator_id', 'parent_contact'].includes(field.Field)
    )
    
    relevantFields.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`)
    })
    
    // Check if new fields exist
    const hasLeavingDate = results.some(field => field.Field === 'leaving_date')
    const hasReturningDate = results.some(field => field.Field === 'returning_date')
    const hasCoordinatorId = results.some(field => field.Field === 'coordinator_id')
    
    console.log('\n🎯 Critical fields check:')
    console.log(`  leaving_date: ${hasLeavingDate ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`  returning_date: ${hasReturningDate ? '✅ EXISTS' : '❌ MISSING'}`)
    console.log(`  coordinator_id: ${hasCoordinatorId ? '✅ EXISTS' : '❌ MISSING'}`)
    
    // Check coordinators
    const [coordinators] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE role = 'COORDINATOR' AND is_active = 1")
    console.log(`\n👥 Active coordinators: ${coordinators[0].count}`)
    
    if (hasLeavingDate && hasReturningDate && hasCoordinatorId) {
      console.log('\n🎉 Schema verification PASSED - All required fields exist!')
    } else {
      console.log('\n❌ Schema verification FAILED - Missing required fields!')
    }
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message)
  } finally {
    await sequelize.close()
  }
}

verifySchema()