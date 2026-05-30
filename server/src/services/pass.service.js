import { passRepository } from '../repositories/pass.repository.js'
import { approvalRepository } from '../repositories/approval.repository.js'
import { generateQRCode } from '../utils/generateQRCode.js'
import { generatePDF } from '../utils/generatePDF.js'

export const passService = {
  createPass: async (data) => {
    const pass = await passRepository.create(data)
    
    // Create approval records based on pass type
    if (data.type === 'long_leave') {
      await approvalRepository.create({
        pass_id: pass.id,
        stage: 'coordinator',
        status: 'pending'
      })
    }
    
    await approvalRepository.create({
      pass_id: pass.id,
      stage: 'hostel_staff',
      status: 'pending'
    })

    return pass
  },

  getPassById: async (id) => {
    return passRepository.findById(id)
  },

  getStudentPasses: async (studentId) => {
    return passRepository.findByStudentId(studentId)
  },

  generateQRAndPDF: async (passId, passData) => {
    const qrPath = await generateQRCode(passData, passId)
    const pdfPath = await generatePDF(passData)
    
    await passRepository.update(passId, {
      qr_code: qrPath,
      pdf_path: pdfPath
    })

    return { qrPath, pdfPath }
  }
}
