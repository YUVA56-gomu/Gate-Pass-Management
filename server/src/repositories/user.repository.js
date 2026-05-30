import User from '../models/User.js'

export const userRepository = {
  create: (data) => User.create(data),
  findById: (id) => User.findByPk(id),
  findByEmail: (email) => User.findOne({ where: { email } }),
  findAll: () => User.findAll(),
  update: (id, data) => User.update(data, { where: { id } }),
  delete: (id) => User.destroy({ where: { id } })
}
