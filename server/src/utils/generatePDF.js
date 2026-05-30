import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export const generatePDF = async (passData) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'pdf')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, `pass-${passData.id}.pdf`)
    const doc = new PDFDocument()
    const stream = fs.createWriteStream(filePath)

    doc.pipe(stream)
    doc.fontSize(20).text('Gate Pass', 100, 100)
    doc.fontSize(12).text(`Student: ${passData.student_name}`, 100, 150)
    doc.text(`Type: ${passData.type}`, 100, 170)
    doc.text(`From: ${passData.from_date}`, 100, 190)
    doc.text(`To: ${passData.to_date}`, 100, 210)
    doc.text(`Status: ${passData.status}`, 100, 230)
    doc.end()

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath))
      stream.on('error', reject)
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
}
