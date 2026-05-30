import GateLog from '../models/GateLog.js'

export const gateLogRepository = {
  create: (data) => GateLog.create(data),
  findByPassId: (passId) => GateLog.findAll({ where: { pass_id: passId } }),
  findAll: () => GateLog.findAll(),
  findByAction: (action) => GateLog.findAll({ where: { action } })
}
