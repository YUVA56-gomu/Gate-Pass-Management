/**
 * Migration: Fix pass date column names
 * 
 * Changes:
 * - Add 'leaving_date' column (DATEONLY) for LONG_LEAVE passes
 * - Add 'returning_date' column (DATEONLY) for LONG_LEAVE passes
 * - Keep existing 'from_date' and 'to_date' for backward compatibility
 */

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // Check if columns already exist
    const tableDescription = await queryInterface.describeTable('passes')
    
    if (!tableDescription.leaving_date) {
      await queryInterface.addColumn(
        'passes',
        'leaving_date',
        {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'For LONG_LEAVE pass type - leaving date (new field name)'
        },
        { transaction }
      )
      console.log('[MIGRATION] Added leaving_date column')
    }

    if (!tableDescription.returning_date) {
      await queryInterface.addColumn(
        'passes',
        'returning_date',
        {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'For LONG_LEAVE pass type - returning date (new field name)'
        },
        { transaction }
      )
      console.log('[MIGRATION] Added returning_date column')
    }

    await transaction.commit()
    console.log('[MIGRATION] Successfully added leaving_date and returning_date columns')
  } catch (error) {
    await transaction.rollback()
    console.error('[MIGRATION] Error adding date columns:', error)
    throw error
  }
}

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.removeColumn('passes', 'leaving_date', { transaction })
    await queryInterface.removeColumn('passes', 'returning_date', { transaction })

    await transaction.commit()
    console.log('[MIGRATION] Successfully removed leaving_date and returning_date columns')
  } catch (error) {
    await transaction.rollback()
    console.error('[MIGRATION] Error removing date columns:', error)
    throw error
  }
}