import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Pass, QRToken, Student, User, Department, Approval } from '../models/index.js'
import * as qrService from './qr.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// PDF storage directory
const PDF_DIR = path.join(__dirname, '../pdf')

// Ensure PDF directory exists
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true })
}

/**
 * Format date as DD MMM YYYY
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Format date and time as DD MMM YYYY HH:MM AM/PM
 * @param {Date} date - Date to format
 * @returns {string} Formatted date and time
 */
const formatDateTime = (date) => {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const hoursStr = String(hours).padStart(2, '0')
  return `${day} ${month} ${year} ${hoursStr}:${minutes} ${ampm}`
}

/**
 * Generate PDF for an approved pass
 * PDF can only be generated when Pass Status = APPROVED AND Active QR Token exists
 */
export const generatePDF = async (passId) => {
  try {
    // Fetch pass with all related data
    const pass = await Pass.findByPk(passId, {
      include: [
        {
          model: Student,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            },
            {
              model: Department,
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    })

    // Validation: Pass exists
    if (!pass) {
      throw new Error('Pass not found')
    }

    // Validation: Pass status must be APPROVED
    if (pass.status !== 'APPROVED') {
      throw new Error('PDF can only be generated for approved passes')
    }

    // Validation: Active QR Token must exist
    const qrToken = await QRToken.findOne({
      where: {
        pass_id: passId,
        is_active: true
      }
    })

    if (!qrToken) {
      throw new Error('Active QR token not found. Generate QR token first.')
    }

    // Fetch approval details with approver user information
    const approvals = await Approval.findAll({
      where: {
        pass_id: passId,
        status: 'APPROVED'
      },
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name']
        }
      ],
      order: [['approved_at', 'DESC']]
    })

    // Generate QR image
    const qrImage = await qrService.generateQRCodeBuffer(qrToken.token)

    // Generate PDF based on pass type (use 'type' field, not 'pass_type')
    let pdfPath
    if (pass.type === 'DAILY') {
      pdfPath = await generateDailyPassPDF(pass, approvals, qrImage)
    } else if (pass.type === 'LONG_LEAVE') {
      pdfPath = await generateLongLeavePDF(pass, approvals, qrImage)
    } else {
      throw new Error('Invalid pass type')
    }

    return {
      passId: passId,
      pdfPath: pdfPath,
      fileName: `PASS_${passId}.pdf`,
      generatedAt: new Date()
    }
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error.message}`)
  }
}

/**
 * Generate Daily Pass PDF
 * 
 * DAILY PASS TEMPLATE:
 * - Header with college name and pass type
 * - Student details (name, USN, department, program, year, semester, hostel, room)
 * - Pass details (type, destination, reason, dates)
 * - Hostel staff approval (approver name, date, remarks)
 * - QR code (embedded as image)
 * - Signature area
 * 
 * FUTURE ENHANCEMENTS:
 * - College logo placeholder at top (TODO: Add College Logo)
 * - Digital signature integration
 */
const generateDailyPassPDF = async (pass, approvals, qrImage) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `PASS_${pass.id}.pdf`
      const filePath = path.join(PDF_DIR, fileName)

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      })

      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)

      // TODO: Add College Logo
      // Future: Logo will be embedded here
      // Placeholder for college logo (50x50px recommended)
      doc.moveDown(0.5)

      // Header
      doc.fontSize(16).font('Helvetica-Bold').text('SMART GATE PASS MANAGEMENT SYSTEM', { align: 'center' })
      doc.fontSize(14).font('Helvetica-Bold').text('DAILY OUT PASS', { align: 'center' })
      doc.moveDown(0.5)

      // Pass ID and Generated Date
      doc.fontSize(10).font('Helvetica')
      doc.text(`Pass ID: ${pass.id}`, { align: 'left' })
      doc.text(`Generated Date: ${formatDate(new Date())}`, { align: 'left' })
      doc.moveDown(1)

      // Student Details Section
      doc.fontSize(12).font('Helvetica-Bold').text('STUDENT DETAILS', { underline: true })
      doc.fontSize(10).font('Helvetica')
      doc.text(`Name: ${pass.Student.User.name}`)
      doc.text(`USN: ${pass.Student.usn}`)
      doc.text(`Department: ${pass.Student.Department.name} (${pass.Student.Department.code})`)
      doc.text(`Program Type: ${pass.Student.program_type}`)
      doc.text(`Year: ${pass.Student.year_of_study}`)
      doc.text(`Semester: ${pass.Student.semester}`)
      doc.text(`Hostel Name: ${pass.Student.hostel_name}`)
      doc.text(`Room Number: ${pass.Student.room_number}`)
      doc.moveDown(1)

      // Pass Details Section
      doc.fontSize(12).font('Helvetica-Bold').text('PASS DETAILS', { underline: true })
      doc.fontSize(10).font('Helvetica')
      doc.text(`Pass Type: ${pass.type}`)
      doc.text(`Destination: ${pass.destination}`)
      doc.text(`Reason: ${pass.reason}`)
      doc.text(`From Date: ${formatDate(pass.from_date)}`)
      doc.text(`To Date: ${formatDate(pass.to_date)}`)
      doc.moveDown(1)

      // Hostel Staff Approval Section
      const hostelApproval = approvals.find(a => a.stage === 'HOSTEL_STAFF')
      if (hostelApproval) {
        doc.fontSize(12).font('Helvetica-Bold').text('HOSTEL STAFF APPROVAL', { underline: true })
        doc.fontSize(10).font('Helvetica')
        // Display approver name instead of ID
        const approverName = hostelApproval.approver ? hostelApproval.approver.name : 'N/A'
        doc.text(`Approved By: ${approverName}`)
        doc.text(`Approved Date: ${formatDateTime(hostelApproval.approved_at)}`)
        doc.text(`Remarks: ${hostelApproval.remarks || 'N/A'}`)
        doc.moveDown(1)
      }

      // QR Code Section
      // QR INTEGRATION: Embedded QR image contains only token UUID, no sensitive data
      doc.fontSize(12).font('Helvetica-Bold').text('QR CODE', { underline: true })
      doc.moveDown(0.5)
      doc.image(qrImage, { width: 150, align: 'center' })
      doc.moveDown(1)

      // Signature Area
      doc.fontSize(10).font('Helvetica')
      doc.text('Hostel Staff Signature: ________________________', { align: 'left' })
      doc.text('Date: ________________________', { align: 'left' })

      // Footer
      doc.moveDown(1)
      doc.fontSize(8).font('Helvetica').text('This is an official document. Please keep it safe.', { align: 'center', color: '#666666' })

      doc.end()

      stream.on('finish', () => {
        resolve(filePath)
      })

      stream.on('error', (err) => {
        reject(err)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generate Long Leave PDF
 * 
 * LONG LEAVE TEMPLATE:
 * - Header with college name and official letter title
 * - Student details (name, USN, department, program, year, semester, hostel, room)
 * - Leave details (destination, reason, dates)
 * - Coordinator approval (approver name, date, remarks)
 * - Hostel staff approval (approver name, date, remarks)
 * - Official declaration statement
 * - QR code (embedded as image)
 * - Signature areas for both approvers
 * 
 * FUTURE ENHANCEMENTS:
 * - College logo placeholder at top (TODO: Add College Logo)
 * - Digital signature integration
 * - Coordinator and hostel staff signature fields
 */
const generateLongLeavePDF = async (pass, approvals, qrImage) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `PASS_${pass.id}.pdf`
      const filePath = path.join(PDF_DIR, fileName)

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      })

      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)

      // TODO: Add College Logo
      // Future: Logo will be embedded here
      // Placeholder for college logo (50x50px recommended)
      doc.moveDown(0.5)

      // Header
      doc.fontSize(16).font('Helvetica-Bold').text('SMART GATE PASS MANAGEMENT SYSTEM', { align: 'center' })
      doc.fontSize(14).font('Helvetica-Bold').text('OFFICIAL LEAVE PERMISSION LETTER', { align: 'center' })
      doc.moveDown(0.5)

      // Pass ID and Generated Date
      doc.fontSize(10).font('Helvetica')
      doc.text(`Pass ID: ${pass.id}`, { align: 'left' })
      doc.text(`Generated Date: ${formatDate(new Date())}`, { align: 'left' })
      doc.moveDown(1)

      // Student Details Section
      doc.fontSize(12).font('Helvetica-Bold').text('STUDENT DETAILS', { underline: true })
      doc.fontSize(10).font('Helvetica')
      doc.text(`Name: ${pass.Student.User.name}`)
      doc.text(`USN: ${pass.Student.usn}`)
      doc.text(`Department: ${pass.Student.Department.name} (${pass.Student.Department.code})`)
      doc.text(`Program Type: ${pass.Student.program_type}`)
      doc.text(`Year: ${pass.Student.year_of_study}`)
      doc.text(`Semester: ${pass.Student.semester}`)
      doc.text(`Hostel Name: ${pass.Student.hostel_name}`)
      doc.text(`Room Number: ${pass.Student.room_number}`)
      doc.moveDown(1)

      // Leave Details Section
      doc.fontSize(12).font('Helvetica-Bold').text('LEAVE DETAILS', { underline: true })
      doc.fontSize(10).font('Helvetica')
      doc.text(`Destination: ${pass.destination}`)
      doc.text(`Reason: ${pass.reason}`)
      doc.text(`From Date: ${formatDate(pass.from_date)}`)
      doc.text(`To Date: ${formatDate(pass.to_date)}`)
      doc.moveDown(1)

      // Coordinator Approval Section
      const coordinatorApproval = approvals.find(a => a.stage === 'COORDINATOR')
      if (coordinatorApproval) {
        doc.fontSize(12).font('Helvetica-Bold').text('COORDINATOR APPROVAL', { underline: true })
        doc.fontSize(10).font('Helvetica')
        // Display approver name instead of ID
        const coordinatorName = coordinatorApproval.approver ? coordinatorApproval.approver.name : 'N/A'
        doc.text(`Approved By: ${coordinatorName}`)
        doc.text(`Approved Date: ${formatDateTime(coordinatorApproval.approved_at)}`)
        doc.text(`Remarks: ${coordinatorApproval.remarks || 'N/A'}`)
        doc.moveDown(1)
      }

      // Hostel Staff Approval Section
      const hostelApproval = approvals.find(a => a.stage === 'HOSTEL_STAFF')
      if (hostelApproval) {
        doc.fontSize(12).font('Helvetica-Bold').text('HOSTEL STAFF APPROVAL', { underline: true })
        doc.fontSize(10).font('Helvetica')
        // Display approver name instead of ID
        const hostelName = hostelApproval.approver ? hostelApproval.approver.name : 'N/A'
        doc.text(`Approved By: ${hostelName}`)
        doc.text(`Approved Date: ${formatDateTime(hostelApproval.approved_at)}`)
        doc.text(`Remarks: ${hostelApproval.remarks || 'N/A'}`)
        doc.moveDown(1)
      }

      // Declaration Section
      doc.fontSize(12).font('Helvetica-Bold').text('DECLARATION', { underline: true })
      doc.fontSize(9).font('Helvetica')
      const declarationText = 'The above student has been granted permission to leave the hostel premises during the approved period. Security personnel are requested to verify the QR code before allowing exit and entry.'
      doc.text(declarationText, { align: 'justify', width: 450 })
      doc.moveDown(1)

      // QR Code Section
      // QR INTEGRATION: Embedded QR image contains only token UUID, no sensitive data
      doc.fontSize(12).font('Helvetica-Bold').text('QR CODE', { underline: true })
      doc.moveDown(0.5)
      doc.image(qrImage, { width: 150, align: 'center' })
      doc.moveDown(1)

      // Signature Areas
      // TODO: Future - Digital signature integration
      doc.fontSize(10).font('Helvetica')
      doc.text('Coordinator Signature: ________________________', { align: 'left' })
      doc.text('Date: ________________________', { align: 'left' })
      doc.moveDown(0.5)
      doc.text('Hostel Staff Signature: ________________________', { align: 'left' })
      doc.text('Date: ________________________', { align: 'left' })

      // Footer
      doc.moveDown(1)
      doc.fontSize(8).font('Helvetica').text('This is an official document. Please keep it safe.', { align: 'center', color: '#666666' })

      doc.end()

      stream.on('finish', () => {
        resolve(filePath)
      })

      stream.on('error', (err) => {
        reject(err)
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Download PDF file
 */
export const downloadPDF = async (passId) => {
  try {
    // Fetch pass to verify it exists and is approved
    const pass = await Pass.findByPk(passId)

    if (!pass) {
      throw new Error('Pass not found')
    }

    if (pass.status !== 'APPROVED') {
      throw new Error('PDF is only available for approved passes')
    }

    // Check if PDF exists
    const fileName = `PASS_${passId}.pdf`
    const filePath = path.join(PDF_DIR, fileName)

    if (!fs.existsSync(filePath)) {
      throw new Error('PDF file not found. Generate PDF first.')
    }

    return {
      filePath: filePath,
      fileName: fileName
    }
  } catch (error) {
    throw new Error(`Failed to download PDF: ${error.message}`)
  }
}

/**
 * Get PDF metadata
 * PDF STORAGE STRATEGY:
 * - PDFs stored in server/src/pdf/ directory
 * - Naming format: PASS_<PASS_ID>.pdf
 * - One PDF per pass (regeneration overwrites existing)
 * - No versioning required
 */
export const getPDFMetadata = async (passId) => {
  try {
    // Fetch pass
    const pass = await Pass.findByPk(passId)

    if (!pass) {
      throw new Error('Pass not found')
    }

    if (pass.status !== 'APPROVED') {
      throw new Error('PDF metadata is only available for approved passes')
    }

    // Check if PDF exists
    const fileName = `PASS_${passId}.pdf`
    const filePath = path.join(PDF_DIR, fileName)

    if (!fs.existsSync(filePath)) {
      return {
        passId: passId,
        fileName: fileName,
        exists: false,
        generatedAt: null,
        fileSize: null
      }
    }

    // Get file stats
    const stats = fs.statSync(filePath)

    return {
      passId: passId,
      fileName: fileName,
      exists: true,
      generatedAt: stats.birthtime,
      fileSize: stats.size
    }
  } catch (error) {
    throw new Error(`Failed to get PDF metadata: ${error.message}`)
  }
}

/**
 * Delete PDF file
 */
export const deletePDF = async (passId) => {
  try {
    const fileName = `PASS_${passId}.pdf`
    const filePath = path.join(PDF_DIR, fileName)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return {
        passId: passId,
        deleted: true
      }
    }

    return {
      passId: passId,
      deleted: false
    }
  } catch (error) {
    throw new Error(`Failed to delete PDF: ${error.message}`)
  }
}

export default {
  generatePDF,
  downloadPDF,
  getPDFMetadata,
  deletePDF
}
