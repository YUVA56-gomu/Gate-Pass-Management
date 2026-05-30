import Pass from '../models/Pass.js'

export const passRepository = {
  create: (data) => Pass.create(data),
  findById: (id) => Pass.findByPk(id),
  findByStudentId: (studentId) => Pass.findAll({ where: { student_id: studentId } }),
  findAll: () => Pass.findAll(),
  update: (id, data) => Pass.update(data, { where: { id } }),
  findByStatus: (status) => Pass.findAll({ where: { status } })
}
