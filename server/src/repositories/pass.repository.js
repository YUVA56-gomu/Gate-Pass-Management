import Pass from '../models/Pass.js'
import User from '../models/User.js'
import Student from '../models/Student.js'

// Standard includes used across all queries
const passIncludes = [
  {
    model: User,
    as: 'coordinator',
    attributes: ['id', 'name', 'email', 'phone']
  },
  {
    model: User,
    as: 'hostelStaff',
    attributes: ['id', 'name', 'email', 'phone']
  }
]

const passIncludesWithStudent = [
  ...passIncludes,
  {
    model: Student,
    attributes: ['id', 'usn'],
    include: [{
      model: User,
      attributes: ['id', 'name', 'email']
    }]
  }
]

export const passRepository = {
  create: (data) => Pass.create(data),

  findById: (id) => Pass.findByPk(id, {
    include: passIncludesWithStudent
  }),

  findByStudentId: (studentId) => Pass.findAll({
    where: { student_id: studentId },
    include: passIncludes,
    order: [['createdAt', 'DESC']]
  }),

  findAll: () => Pass.findAll({
    include: passIncludesWithStudent,
    order: [['createdAt', 'DESC']]
  }),

  update: (id, data) => Pass.update(data, { where: { id } }),

  delete: (id) => Pass.destroy({ where: { id } }),

  findByStatus: (status) => Pass.findAll({
    where: { status },
    include: passIncludesWithStudent,
    order: [['createdAt', 'DESC']]
  })
}
