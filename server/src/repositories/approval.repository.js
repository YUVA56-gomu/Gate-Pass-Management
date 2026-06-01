import Approval from '../models/Approval.js'

export const approvalRepository = {
  create: (data) => Approval.create(data),
  findById: (id) => Approval.findByPk(id),
  findByPassId: (passId) => Approval.findAll({ where: { pass_id: passId } }),
  findByStatus: (status) => Approval.findAll({ where: { status } }),
  update: (id, data) => Approval.update(data, { where: { id } }),
  findPending: () => Approval.findAll({ where: { status: 'pending' } }),
  deleteByPassId: (passId) => Approval.destroy({ where: { pass_id: passId } })
}
