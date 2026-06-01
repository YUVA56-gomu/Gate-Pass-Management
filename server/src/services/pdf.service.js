import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Pass, QRToken, Student, User, Department, Approval } from '../models/index.js'
import * as qrService from './qr.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// PDF storage directory — server/src/pdf/
const PDF_DIR = path.join(__dirname, '../pdf')
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => {
  if (!d) return 'N/A'
  const dt = new Date(d)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${String(dt.getDate()).padStart(2,'0')} ${months[dt.getMonth()]} ${dt.getFullYear()}`
}

const fmtDateTime = (d) => {
  if (!d) return 'N/A'
  const dt = new Date(d)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  let h = dt.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  const m = String(dt.getMinutes()).padStart(2,'0')
  return `${String(dt.getDate()).padStart(2,'0')} ${months[dt.getMonth()]} ${dt.getFullYear()} ${h}:${m} ${ampm}`
}

// Draw a horizontal rule
const hr = (doc, y) => {
  doc.moveTo(40, y).lineTo(555, y).strokeColor('#cccccc').lineWidth(0.5).stroke()
}

// Draw a labelled row
const row = (doc, label, value, y) => {
  doc.fillColor('#555555').fontSize(9).font('Helvetica').text(label, 40, y, { width: 160 })
  doc.fillColor('#111111').fontSize(9).font('Helvetica-Bold').text(String(value || 'N/A'), 205, y, { width: 350 })
}

// Section heading
const section = (doc, title, y) => {
  doc.rect(40, y, 515, 18).fill('#1e40af')
  doc.fillColor('white').fontSize(9).font('Helvetica-Bold').text(title, 46, y + 4)
  return y + 24
}

// ── Core PDF builder ─────────────────────────────────────────────────────────

const buildPDF = (filePath, drawFn) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    try {
      drawFn(doc)
      doc.end()
      stream.on('finish', resolve)
      stream.on('error', reject)
    } catch (err) {
      reject(err)
    }
  })

// ── Fetch all data needed for PDF ────────────────────────────────────────────

const fetchPassData = async (passId) => {
  const pass = await Pass.findByPk(passId, {
    include: [
      {
        model: Student,
        include: [
          { model: User, attributes: ['id', 'name', 'email', 'phone'] },
          { model: Department, attributes: ['id', 'name', 'code'] }
        ]
      },
      { model: User, as: 'coordinator', attributes: ['id', 'name'] },
      { model: User, as: 'hostelStaff', attributes: ['id', 'name'] }
    ]
  })

  if (!pass) throw new Error('Pass not found')
  if (pass.status !== 'APPROVED') throw new Error('PDF can only be generated for approved passes')

  const approvals = await Approval.findAll({
    where: { pass_id: passId },
    include: [{ model: User, as: 'approver', attributes: ['id', 'name'] }],
    order: [['approved_at', 'ASC']]
  })

  // Get or generate QR token
  let qrToken = await QRToken.findOne({ where: { pass_id: passId, is_active: true } })
  if (!qrToken) {
    qrToken = await qrService.generateQRToken(passId)
  }

  const qrImageBuffer = await qrService.generateQRCodeBuffer(qrToken.token)

  return { pass, approvals, qrImageBuffer }
}

// ── Daily Pass PDF ────────────────────────────────────────────────────────────

const buildDailyPassPDF = (doc, pass, approvals, qrImageBuffer) => {
  const s = pass.Student
  const u = s?.User
  const dept = s?.Department
  const hostelApproval = approvals.find(a => a.stage === 'HOSTEL_STAFF' && a.status === 'APPROVED')

  let y = 0


  // ── Header band ──
  doc.rect(0, 0, 595, 70).fill('#1e40af')
  doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
    .text('SMART GATE PASS SYSTEM', 40, 14, { align: 'center', width: 515 })
  doc.fontSize(11).font('Helvetica')
    .text('Official Daily Pass Document', 40, 38, { align: 'center', width: 515 })
  doc.fontSize(8)
    .text(`Pass ID: #${pass.id}   |   Generated: ${fmtDateTime(new Date())}`, 40, 54, { align: 'center', width: 515 })

  // ── Approved badge ──
  doc.rect(40, 82, 515, 22).fill('#dcfce7').stroke('#16a34a')
  doc.fillColor('#15803d').fontSize(11).font('Helvetica-Bold')
    .text('✓  APPROVED — DAILY PASS', 40, 87, { align: 'center', width: 515 })

  y = 118

  // ── Student Information ──
  y = section(doc, 'STUDENT INFORMATION', y)
  const studentRows = [
    ['Full Name', u?.name],
    ['USN', s?.usn],
    ['Department', dept ? `${dept.name} (${dept.code})` : 'N/A'],
    ['Program', s?.program_type === 'UG' ? 'Undergraduate' : s?.program_type === 'PG' ? 'Postgraduate' : s?.program_type],
    ['Year / Semester', `Year ${s?.year_of_study || 'N/A'} / Semester ${s?.semester || 'N/A'}`],
    ['Hostel Name', s?.hostel_name],
    ['Room Number', s?.room_number],
    ['Email', u?.email],
    ['Phone', u?.phone],
  ]
  studentRows.forEach(([label, value]) => {
    row(doc, label, value, y)
    y += 16
  })
  hr(doc, y + 4); y += 14

  // ── Pass Details ──
  y = section(doc, 'PASS DETAILS', y)
  const passRows = [
    ['Pass Type', 'Daily Pass'],
    ['Reason', pass.reason],
    ['Destination', pass.destination],
    ['Pass Date', fmtDate(pass.pass_date)],
    ['Exit Time', pass.exit_time || 'Not specified'],
    ['Expected Return Time', pass.expected_return_time || 'Not specified'],
    ['Hostel Staff', pass.hostelStaff?.name || 'N/A'],
    ['Status', 'APPROVED'],
  ]
  passRows.forEach(([label, value]) => {
    row(doc, label, value, y)
    y += 16
  })
  hr(doc, y + 4); y += 14

  // ── Approval Details ──
  y = section(doc, 'APPROVAL INFORMATION', y)
  row(doc, 'Approved By', hostelApproval?.approver?.name || pass.hostelStaff?.name || 'N/A', y); y += 16
  row(doc, 'Approved On', fmtDateTime(hostelApproval?.approved_at), y); y += 16
  row(doc, 'Remarks', hostelApproval?.remarks || 'None', y); y += 16
  hr(doc, y + 4); y += 14

  // ── QR Code ──
  y = section(doc, 'QR CODE — SHOW AT SECURITY GATE', y)
  doc.fillColor('#555555').fontSize(8).font('Helvetica')
    .text('Present this QR code to the security guard for scanning.', 40, y, { align: 'center', width: 515 })
  y += 14
  if (y > 600) {
  doc.addPage()
  y = 70
}
  const qrX = (595 - 140) / 2
  doc.image(qrImageBuffer, qrX, y, { width: 140, height: 140 })
  y += 155

  // ── Footer ──
  doc.rect(0, 780, 595, 62).fill('#f1f5f9')
  doc.moveTo(0, 780).lineTo(595, 780).strokeColor('#cbd5e1').lineWidth(0.5).stroke()
  doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
    .text('This is a computer-generated document. No physical signature required.', 40, 790, { align: 'center', width: 515 })
    .text('Smart Gate Pass Management System — For official use only', 40, 803, { align: 'center', width: 515 })
    .text(`Generated on ${fmtDateTime(new Date())}`, 40, 816, { align: 'center', width: 515 })
}

// ── Long Leave PDF ────────────────────────────────────────────────────────────

const buildLongLeavePDF = (doc, pass, approvals, qrImageBuffer) => {
  const s = pass.Student
  const u = s?.User
  const dept = s?.Department
  const coordApproval = approvals.find(a => a.stage === 'COORDINATOR' && a.status === 'APPROVED')
  const hostelApproval = approvals.find(a => a.stage === 'HOSTEL_STAFF' && a.status === 'APPROVED')

  let y = 0

  // ── Header band ──
  doc.rect(0, 0, 595, 70).fill('#1e40af')
  doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
    .text('SMART GATE PASS SYSTEM', 40, 14, { align: 'center', width: 515 })
  doc.fontSize(11).font('Helvetica')
    .text('Official Long Leave Permission Letter', 40, 38, { align: 'center', width: 515 })
  doc.fontSize(8)
    .text(`Pass ID: #${pass.id}   |   Generated: ${fmtDateTime(new Date())}`, 40, 54, { align: 'center', width: 515 })

  // ── Approved badge ──
  doc.rect(40, 82, 515, 22).fill('#dcfce7').stroke('#16a34a')
  doc.fillColor('#15803d').fontSize(11).font('Helvetica-Bold')
    .text('✓  APPROVED — LONG LEAVE', 40, 87, { align: 'center', width: 515 })

  y = 118

  // ── Student Information ──
  y = section(doc, 'STUDENT INFORMATION', y)
  const studentRows = [
    ['Full Name', u?.name],
    ['USN', s?.usn],
    ['Department', dept ? `${dept.name} (${dept.code})` : 'N/A'],
    ['Program', s?.program_type === 'UG' ? 'Undergraduate' : s?.program_type === 'PG' ? 'Postgraduate' : s?.program_type],
    ['Year / Semester', `Year ${s?.year_of_study || 'N/A'} / Semester ${s?.semester || 'N/A'}`],
    ['Hostel Name', s?.hostel_name],
    ['Room Number', s?.room_number],
    ['Email', u?.email],
    ['Phone', u?.phone],
  ]
  studentRows.forEach(([label, value]) => {
    row(doc, label, value, y)
    y += 16
  })
  hr(doc, y + 4); y += 14

  // ── Leave Details ──
  y = section(doc, 'LEAVE DETAILS', y)
  const leavingDate = pass.leaving_date || pass.from_date
  const returningDate = pass.returning_date || pass.to_date
  let duration = 'N/A'
  if (leavingDate && returningDate) {
    const diff = Math.ceil((new Date(returningDate) - new Date(leavingDate)) / (1000 * 60 * 60 * 24))
    duration = `${diff} day${diff !== 1 ? 's' : ''}`
  }
  const leaveRows = [
    ['Pass Type', 'Long Leave'],
    ['Reason', pass.reason],
    ['Destination', pass.destination],
    ['Leaving Date', fmtDate(leavingDate)],
    ['Returning Date', fmtDate(returningDate)],
    ['Leave Duration', duration],
    ['Parent Contact', pass.parent_contact],
    ['Status', 'APPROVED'],
  ]
  leaveRows.forEach(([label, value]) => {
    row(doc, label, value, y)
    y += 16
  })
  hr(doc, y + 4); y += 14

  // ── Coordinator Approval ──
  y = section(doc, 'COORDINATOR APPROVAL', y)
  row(doc, 'Coordinator', pass.coordinator?.name || coordApproval?.approver?.name || 'N/A', y); y += 16
  row(doc, 'Status', coordApproval ? 'APPROVED' : 'N/A', y); y += 16
  row(doc, 'Approved On', fmtDateTime(coordApproval?.approved_at), y); y += 16
  row(doc, 'Remarks', coordApproval?.remarks || 'None', y); y += 16
  hr(doc, y + 4); y += 14

  // ── Hostel Staff Approval ──
  y = section(doc, 'HOSTEL STAFF APPROVAL', y)
  row(doc, 'Hostel Staff', pass.hostelStaff?.name || hostelApproval?.approver?.name || 'N/A', y); y += 16
  row(doc, 'Status', hostelApproval ? 'APPROVED' : 'N/A', y); y += 16
  row(doc, 'Approved On', fmtDateTime(hostelApproval?.approved_at), y); y += 16
  row(doc, 'Remarks', hostelApproval?.remarks || 'None', y); y += 16
  hr(doc, y + 4); y += 14
  y += 30

doc.fontSize(9)
  .fillColor('#555555')
  .font('Helvetica')
  .text('Authorized Approval', 380, y)

y += 35

doc.moveTo(360, y)
  .lineTo(520, y)
  .strokeColor('#666666')
  .stroke()

y += 5

doc.fontSize(8)
  .text('Smart Gate Pass System', 380, y)

  // ── QR Code ──
if (y > 600) {
  doc.addPage()
  y = 70
}

doc
  .fontSize(18)
  .fillColor('#1e40af')
  .font('Helvetica-Bold')
  .text('QR CODE', 40, y, {
    align: 'center',
    width: 515
  })

y += 25

doc
  .fontSize(10)
  .fillColor('#555555')
  .font('Helvetica')
  .text(
    'QR CODE - SHOW AT SECURITY GATE.',
    40,
    y,
    {
      align: 'center',
      width: 515
    }
  )

y += 40

doc.fillColor('#555555')
  .fontSize(8)
  .font('Helvetica')
  .text(
    'Present this QR code to the security guard for scanning.',
    40,
    y,
    { align: 'center', width: 515 }
  )

y += 14

const qrSize = 200
const qrX = (595 - qrSize) / 2

doc.image(qrImageBuffer, qrX, y, {
  width: qrSize,
  height: qrSize
})

y += 155

  // ── Footer ──
  doc.rect(0, 780, 595, 62).fill('#f1f5f9')
  doc.moveTo(0, 780).lineTo(595, 780).strokeColor('#cbd5e1').lineWidth(0.5).stroke()
  doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
    .text('This is a computer-generated document. No physical signature required.', 40, 790, { align: 'center', width: 515 })
    .text('Smart Gate Pass Management System — For official use only', 40, 803, { align: 'center', width: 515 })
    .text(`Generated on ${fmtDateTime(new Date())}`, 40, 816, { align: 'center', width: 515 })
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate PDF for an approved pass.
 * Automatically picks Daily or Long Leave template.
 * Stores file at server/src/pdf/PASS_<id>.pdf
 */
export const generatePDF = async (passId) => {
  const { pass, approvals, qrImageBuffer } = await fetchPassData(passId)

  const fileName = `PASS_${passId}.pdf`
  const filePath = path.join(PDF_DIR, fileName)

  await buildPDF(filePath, (doc) => {
    if (pass.pass_type === 'DAILY') {
      buildDailyPassPDF(doc, pass, approvals, qrImageBuffer)
    } else if (pass.pass_type === 'LONG_LEAVE') {
      buildLongLeavePDF(doc, pass, approvals, qrImageBuffer)
    } else {
      throw new Error(`Unknown pass_type: ${pass.pass_type}`)
    }
  })

  // Persist pdf_path on the pass record
  await Pass.update({ pdf_path: `pdf/${fileName}` }, { where: { id: passId } })

  console.log(`[PDF SERVICE] Generated PDF for pass ${passId}: ${filePath}`)
  return { passId, filePath, fileName, generatedAt: new Date() }
}

/**
 * Get the file path for a pass PDF.
 * Auto-generates if the file doesn't exist yet.
 */
export const getPDFFilePath = async (passId) => {
  const pass = await Pass.findByPk(passId, { attributes: ['id', 'status', 'pdf_path'] })
  if (!pass) throw new Error('Pass not found')
  if (pass.status !== 'APPROVED') throw new Error('PDF is only available for approved passes')

  const fileName = `PASS_${passId}.pdf`
  const filePath = path.join(PDF_DIR, fileName)

  // Auto-generate if missing
  if (!fs.existsSync(filePath)) {
    console.log(`[PDF SERVICE] PDF missing for pass ${passId}, generating now...`)
    await generatePDF(passId)
  }

  return { filePath, fileName }
}

/**
 * Get PDF metadata (existence, size, generated time)
 */
export const getPDFMetadata = async (passId) => {
  const pass = await Pass.findByPk(passId, { attributes: ['id', 'status', 'pdf_path'] })
  if (!pass) throw new Error('Pass not found')
  if (pass.status !== 'APPROVED') throw new Error('PDF metadata only available for approved passes')

  const fileName = `PASS_${passId}.pdf`
  const filePath = path.join(PDF_DIR, fileName)

  if (!fs.existsSync(filePath)) {
    return { passId, fileName, exists: false, generatedAt: null, fileSize: null }
  }

  const stats = fs.statSync(filePath)
  return { passId, fileName, exists: true, generatedAt: stats.birthtime, fileSize: stats.size }
}

export default { generatePDF, getPDFFilePath, getPDFMetadata }
