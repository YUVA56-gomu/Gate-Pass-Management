import sequelize from '../config/db.js'
import { Department } from '../models/index.js'

const seedDepartments = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected')

    const departments = [
      { id: 1, name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' },
      { id: 2, name: 'Electronics & Communication', code: 'EC', description: 'Department of Electronics and Communication' },
      { id: 3, name: 'Robotics', code: 'ROBOTICS', description: 'Department of Robotics' },
      { id: 4, name: 'Master of Business Administration', code: 'MBA', description: 'Master of Business Administration' },
      { id: 5, name: 'Master of Computer Applications', code: 'MCA', description: 'Master of Computer Applications' }
    ]

    for (const dept of departments) {
      const [department, created] = await Department.findOrCreate({
        where: { code: dept.code },
        defaults: dept
      })

      if (created) {
        console.log(? Created department: $dept.name)
      } else {
        console.log(? Department already exists: $dept.name)
      }
    }

    console.log('? Department seeding completed')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding departments:', error)
    process.exit(1)
  }
}

seedDepartments()
