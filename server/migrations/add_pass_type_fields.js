/**
 * Migration: Add new fields to passes table for pass type redesign
 * 
 * Changes:
 * - Rename 'type' column to 'pass_type'
 * - Add 'pass_date' column (DATEONLY) for DAILY passes
 * - Change 'from_date' and 'to_date' to DATEONLY (from DATE)
 * - Add 'exit_time' column (TIME) for DAILY passes
 * - Add 'expected_return_time' column (TIME) for DAILY passes
 * - Add 'parent_contact' column (STRING) for LONG_LEAVE passes
 * - Add 'coordinator_id' column (INTEGER) for coordinator assignment
 */

export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // Step 1: Add new columns
    await queryInterface.addColumn(
      'passes',
      'pass_date',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'For DAILY pass type - the date of the pass'
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'passes',
      'exit_time',
      {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'For DAILY pass type - optional exit time'
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'passes',
      'expected_return_time',
      {
        type: Sequelize.TIME,
        allowNull: true,
        comment: 'For DAILY pass type - optional expected return time'
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'passes',
      'parent_contact',
      {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'For LONG_LEAVE pass type - parent phone number'
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'passes',
      'coordinator_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'Assigned coordinator for approval'
      },
      { transaction }
    )

    // Step 2: Rename 'type' to 'pass_type'
    await queryInterface.renameColumn('passes', 'type', 'pass_type', { transaction })

    // Step 3: Change date columns to DATEONLY
    await queryInterface.changeColumn(
      'passes',
      'from_date',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'For LONG_LEAVE pass type - leaving date'
      },
      { transaction }
    )

    await queryInterface.changeColumn(
      'passes',
      'to_date',
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'For LONG_LEAVE pass type - returning date'
      },
      { transaction }
    )

    await transaction.commit()
    console.log('[MIGRATION] Successfully added pass type fields to passes table')
  } catch (error) {
    await transaction.rollback()
    console.error('[MIGRATION] Error adding pass type fields:', error)
    throw error
  }
}

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // Reverse the changes
    await queryInterface.renameColumn('passes', 'pass_type', 'type', { transaction })

    await queryInterface.changeColumn(
      'passes',
      'from_date',
      {
        type: Sequelize.DATE,
        allowNull: false
      },
      { transaction }
    )

    await queryInterface.changeColumn(
      'passes',
      'to_date',
      {
        type: Sequelize.DATE,
        allowNull: false
      },
      { transaction }
    )

    await queryInterface.removeColumn('passes', 'pass_date', { transaction })
    await queryInterface.removeColumn('passes', 'exit_time', { transaction })
    await queryInterface.removeColumn('passes', 'expected_return_time', { transaction })
    await queryInterface.removeColumn('passes', 'parent_contact', { transaction })
    await queryInterface.removeColumn('passes', 'coordinator_id', { transaction })

    await transaction.commit()
    console.log('[MIGRATION] Successfully reverted pass type fields')
  } catch (error) {
    await transaction.rollback()
    console.error('[MIGRATION] Error reverting pass type fields:', error)
    throw error
  }
}
