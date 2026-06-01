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

// ── Shared Colors & Design System ────────────────────────────────────────────
const COLORS = {
  primary: '#1e3a8a',    // Deep Navy
  secondary: '#4f46e5',  // Indigo
  accent: '#d97706',     // Golden Amber
  success: '#059669',    // Emerald-600
  successBg: '#dcfce7',  // Emerald-50
  textDark: '#0f172a',   // Slate-900
  textMuted: '#64748b',  // Slate-500
  bgLight: '#f8fafc',    // Slate-50
  bgIndigo: '#eff6ff',   // Blue-50 (Indigo tint)
  border: '#cbd5e1',     // Slate-300
  borderLight: '#e2e8f0' // Slate-200
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

// Draw academic crest logo programmatically
const drawCollegeCrest = (doc, x, y) => {
  doc.save()
  
  // Shield path (Primary deep navy)
  doc.moveTo(x, y)
     .lineTo(x + 35, y)
     .lineTo(x + 35, y + 22)
     .quadraticCurveTo(x + 35, y + 36, x + 17.5, y + 43)
     .quadraticCurveTo(x, y + 36, x, y + 22)
     .closePath()
     .fill(COLORS.primary)
  
  // Inner Gold Accent Line
  doc.moveTo(x + 3, y + 3)
     .lineTo(x + 32, y + 3)
     .lineTo(x + 32, y + 21)
     .quadraticCurveTo(x + 32, y + 33, x + 17.5, y + 39)
     .quadraticCurveTo(x + 3, y + 33, x + 3, y + 21)
     .closePath()
     .stroke(COLORS.accent)
     .lineWidth(1)
  
  // White academic book details inside
  doc.rect(x + 8, y + 16, 8, 10).fill('#ffffff')
  doc.rect(x + 19, y + 16, 8, 10).fill('#ffffff')
  doc.rect(x + 10, y + 18, 5, 1).fill(COLORS.primary)
  doc.rect(x + 10, y + 21, 5, 1).fill(COLORS.primary)
  doc.rect(x + 21, y + 18, 5, 1).fill(COLORS.primary)
  doc.rect(x + 21, y + 21, 5, 1).fill(COLORS.primary)
  
  // Golden Academic Star above the book
  doc.moveTo(x + 17.5, y + 6)
     .lineTo(x + 19.5, y + 10)
     .lineTo(x + 24, y + 10)
     .lineTo(x + 20.5, y + 12.5)
     .lineTo(x + 22, y + 16.5)
     .lineTo(x + 17.5, y + 14)
     .lineTo(x + 13, y + 16.5)
     .lineTo(x + 14.5, y + 12.5)
     .lineTo(x + 11, y + 10)
     .lineTo(x + 15.5, y + 10)
     .closePath()
     .fill(COLORS.accent)
  
  doc.restore()
}

// Draw page background watermark
const drawWatermark = (doc) => {
  doc.save()
  doc.opacity(0.02)
  doc.fillColor(COLORS.primary)
  
  // Large circular watermark seal
  doc.circle(297.5, 421, 140)
     .stroke(COLORS.primary)
     .lineWidth(4)
  doc.circle(297.5, 421, 130)
     .stroke(COLORS.primary)
     .lineWidth(1)
     
  drawCollegeCrest(doc, 297.5 - 17.5, 421 - 21.5)
  
  doc.fontSize(22).font('Helvetica-Bold')
     .text('SMART GATE PASS', 0, 421 - 70, { align: 'center', width: 595 })
  doc.fontSize(16).font('Helvetica-Bold')
     .text('OFFICIAL GATE PASS', 0, 421 + 55, { align: 'center', width: 595 })
     
  doc.restore()
}

// Draw header with college crest logo and approved badge
const drawHeader = (doc, title, subtitle, isApproved = true) => {
  drawCollegeCrest(doc, 40, 35)
  
  doc.fillColor(COLORS.primary).fontSize(13).font('Helvetica-Bold')
     .text('SMART GATE PASS MANAGEMENT SYSTEM', 90, 37)
  doc.fillColor(COLORS.textDark).fontSize(10.5).font('Helvetica-Bold')
     .text(title, 90, 53)
  doc.fillColor(COLORS.textMuted).fontSize(8.5).font('Helvetica')
     .text(subtitle, 90, 68)
     
  if (isApproved) {
    doc.save()
    doc.roundedRect(440, 42, 115, 26, 6).fill(COLORS.successBg)
    doc.roundedRect(440, 42, 115, 26, 6).stroke(COLORS.success).lineWidth(1)
    doc.fillColor(COLORS.success).fontSize(9.5).font('Helvetica-Bold')
       .text('✓ APPROVED', 440, 50, { align: 'center', width: 115 })
    doc.restore()
  }
}

// Draw horizontal pass info card bar
const drawPassInfoBar = (doc, passId, passType, dateStr, y) => {
  doc.save()
  doc.roundedRect(40, y, 515, 28, 4).fill(COLORS.bgLight)
  doc.roundedRect(40, y, 515, 28, 4).stroke(COLORS.borderLight).lineWidth(0.5)
  
  doc.moveTo(180, y).lineTo(180, y + 28).stroke(COLORS.borderLight).lineWidth(0.5)
  doc.moveTo(350, y).lineTo(350, y + 28).stroke(COLORS.borderLight).lineWidth(0.5)
  
  // Pass ID
  doc.fillColor(COLORS.textMuted).fontSize(6.5).font('Helvetica').text('PASS ID', 50, y + 4)
  doc.fillColor(COLORS.primary).fontSize(9.5).font('Helvetica-Bold').text(`#${passId}`, 50, y + 12)
  
  // Pass Type
  doc.fillColor(COLORS.textMuted).fontSize(6.5).font('Helvetica').text('PASS TYPE', 190, y + 4)
  doc.fillColor(COLORS.textDark).fontSize(9).font('Helvetica-Bold').text(passType.toUpperCase(), 190, y + 12)
  
  // Generated Date
  doc.fillColor(COLORS.textMuted).fontSize(6.5).font('Helvetica').text('GENERATED ON', 360, y + 4)
  doc.fillColor(COLORS.textDark).fontSize(8).font('Helvetica-Bold').text(dateStr, 360, y + 12)
  
  doc.restore()
  return y + 28 + 8
}

// Draw clean minimalist section header with accent strip
const drawSectionHeader = (doc, title, y) => {
  doc.save()
  doc.rect(40, y, 3, 11).fill(COLORS.primary)
  doc.fillColor(COLORS.primary).fontSize(8.5).font('Helvetica-Bold').text(title, 48, y + 2)
  doc.moveTo(180, y + 7).lineTo(555, y + 7).stroke(COLORS.borderLight).lineWidth(0.5)
  doc.restore()
  return y + 15
}

// Draw structured multi-column info grid card
const drawInfoGrid = (doc, data, y) => {
  doc.save()
  const rowHeight = 20
  const padding = 6
  const boxHeight = Math.ceil(data.length / 2) * rowHeight + padding * 2
  
  doc.roundedRect(40, y, 515, boxHeight, 4).fill('#ffffff')
  doc.roundedRect(40, y, 515, boxHeight, 4).stroke(COLORS.borderLight).lineWidth(0.5)
  
  let rowY = y + padding
  const leftCol = 55
  const rightCol = 310
  const colWidth = 230
  
  for (let i = 0; i < data.length; i += 2) {
    const item1 = data[i]
    const item2 = data[i + 1]
    
    if (item1) {
      doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica').text(item1[0], leftCol, rowY)
      doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text(String(item1[1] || 'N/A'), leftCol, rowY + 8, { width: colWidth, height: 11, ellipsis: true })
    }
    
    if (item2) {
      doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica').text(item2[0], rightCol, rowY)
      doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold').text(String(item2[1] || 'N/A'), rightCol, rowY + 8, { width: colWidth, height: 11, ellipsis: true })
    }
    
    rowY += rowHeight
  }
  
  doc.restore()
  return y + boxHeight + 6
}

// Draw scan-friendly approval blocks (side-by-side or centered)
const drawApprovalCards = (doc, approvals, y) => {
  doc.save()
  const height = 46
  
  if (approvals.length === 1) {
    const cardWidth = 300
    const cardX = (595 - cardWidth) / 2
    const app = approvals[0]
    
    doc.roundedRect(cardX, y, cardWidth, height, 4).fill(COLORS.bgLight)
    doc.roundedRect(cardX, y, cardWidth, height, 4).stroke(COLORS.borderLight).lineWidth(0.5)
    
    doc.fillColor(COLORS.secondary).fontSize(7.5).font('Helvetica-Bold').text(app.role.toUpperCase(), cardX + 10, y + 6)
    doc.fillColor(COLORS.textDark).fontSize(9).font('Helvetica-Bold').text(app.name, cardX + 10, y + 15)
    doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica').text(`Approved: ${app.time}`, cardX + 10, y + 27)
    
    doc.roundedRect(cardX + cardWidth - 80, y + 13, 70, 18, 4).fill(COLORS.successBg)
    doc.roundedRect(cardX + cardWidth - 80, y + 13, 70, 18, 4).stroke(COLORS.success).lineWidth(0.5)
    doc.fillColor(COLORS.success).fontSize(7).font('Helvetica-Bold').text('✓ APPROVED', cardX + cardWidth - 80, y + 18, { align: 'center', width: 70 })
    
  } else if (approvals.length >= 2) {
    const cardWidth = 250
    
    // Card 1
    const app1 = approvals[0]
    doc.roundedRect(40, y, cardWidth, height, 4).fill(COLORS.bgLight)
    doc.roundedRect(40, y, cardWidth, height, 4).stroke(COLORS.borderLight).lineWidth(0.5)
    
    doc.fillColor(COLORS.secondary).fontSize(7.5).font('Helvetica-Bold').text(app1.role.toUpperCase(), 50, y + 6)
    doc.fillColor(COLORS.textDark).fontSize(9).font('Helvetica-Bold').text(app1.name, 50, y + 15)
    doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica').text(`Approved: ${app1.time}`, 50, y + 27)
    
    doc.roundedRect(40 + cardWidth - 80, y + 13, 70, 18, 4).fill(COLORS.successBg)
    doc.roundedRect(40 + cardWidth - 80, y + 13, 70, 18, 4).stroke(COLORS.success).lineWidth(0.5)
    doc.fillColor(COLORS.success).fontSize(7).font('Helvetica-Bold').text('✓ APPROVED', 40 + cardWidth - 80, y + 18, { align: 'center', width: 70 })
    
    // Card 2
    const app2 = approvals[1]
    doc.roundedRect(305, y, cardWidth, height, 4).fill(COLORS.bgLight)
    doc.roundedRect(305, y, cardWidth, height, 4).stroke(COLORS.borderLight).lineWidth(0.5)
    
    doc.fillColor(COLORS.secondary).fontSize(7.5).font('Helvetica-Bold').text(app2.role.toUpperCase(), 315, y + 6)
    doc.fillColor(COLORS.textDark).fontSize(9).font('Helvetica-Bold').text(app2.name, 315, y + 15)
    doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica').text(`Approved: ${app2.time}`, 315, y + 27)
    
    doc.roundedRect(305 + cardWidth - 80, y + 13, 70, 18, 4).fill(COLORS.successBg)
    doc.roundedRect(305 + cardWidth - 80, y + 13, 70, 18, 4).stroke(COLORS.success).lineWidth(0.5)
    doc.fillColor(COLORS.success).fontSize(7).font('Helvetica-Bold').text('✓ APPROVED', 305 + cardWidth - 80, y + 18, { align: 'center', width: 70 })
  }
  
  doc.restore()
  return y + height + 6
}

// Draw the ultra-premium security verification block with a large centered QR frame
const drawSecurityCard = (doc, pass, qrImageBuffer, y) => {
  doc.save()
  
  const student = pass.Student
  const user = student?.User
  const usn = student?.usn || 'N/A'
  const studentName = user?.name || 'N/A'
  
  const cardHeight = 295
  
  // Outer Bordered Container Card (Indigo tint)
  doc.roundedRect(40, y, 515, cardHeight, 6).fill(COLORS.bgIndigo)
  doc.roundedRect(40, y, 515, cardHeight, 6).stroke(COLORS.secondary).lineWidth(1.5)
  
  // Inner white frame for framing the QR code
  const frameSize = 230
  const frameX = (595 - frameSize) / 2
  const frameY = y + 8
  doc.roundedRect(frameX, frameY, frameSize, frameSize, 4).fill('#ffffff')
  doc.roundedRect(frameX, frameY, frameSize, frameSize, 4).stroke(COLORS.borderLight).lineWidth(0.5)
  
  // Center QR code inside the frame (220px x 220px minimum)
  const qrSize = 220
  const qrX = (595 - qrSize) / 2
  const qrY = frameY + 5
  doc.image(qrImageBuffer, qrX, qrY, { width: qrSize, height: qrSize })
  
  // Information details below QR
  const textY = frameY + frameSize + 6
  
  // Pass ID
  doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold')
     .text(`Pass ID: #${pass.id}`, 40, textY, { align: 'center', width: 515 })
     
  // Student Name & USN
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold')
     .text(`${studentName}   |   USN: ${usn}`, 40, textY + 12, { align: 'center', width: 515 })
     
  // Scan Banner
  const pillWidth = 240
  const pillX = (595 - pillWidth) / 2
  const pillY = textY + 25
  doc.roundedRect(pillX, pillY, pillWidth, 14, 4).fill(COLORS.primary)
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
     .text('📱 SCAN THIS QR AT SECURITY GATE', pillX, pillY + 3.5, { align: 'center', width: pillWidth })
  
  doc.restore()
  return y + cardHeight + 6
}

// Draw formal document footer
const drawFooter = (doc, generatedTime) => {
  doc.save()
  doc.moveTo(40, 780).lineTo(555, 780).stroke(COLORS.borderLight).lineWidth(1)
  
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('This is a computer-generated gate pass. No physical signature required.', 40, 788, { align: 'center', width: 515 })
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold')
     .text('Smart Gate Pass Management System', 40, 800, { align: 'center', width: 515 })
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Generated on ${generatedTime} | For official college use only`, 40, 811, { align: 'center', width: 515 })
  doc.restore()
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

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  // VTU Logo (top-left)
  drawCollegeCrest(doc, 40, 30)
  
  // Title and subtitle
  doc.fillColor(COLORS.primary).fontSize(20).font('Helvetica-Bold')
     .text('SMART GATE PASS SYSTEM', 95, 35)
  doc.fillColor(COLORS.textDark).fontSize(11).font('Helvetica-Bold')
     .text('Official Daily Gate Pass', 95, 58)
  
  // Generated date and university name
  const generatedDate = fmtDateTime(pass.createdAt || new Date())
  doc.fillColor(COLORS.textMuted).fontSize(8).font('Helvetica')
     .text(`Generated On: ${generatedDate}  |  Visvesvaraya Technological University, Belagavi`, 95, 73)
  
  // Pass ID and Type (top-right box)
  doc.save()
  doc.roundedRect(445, 30, 110, 68, 4).fill(COLORS.bgLight)
  doc.roundedRect(445, 30, 110, 68, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('PASS ID', 455, 38)
  doc.fillColor(COLORS.primary).fontSize(18).font('Helvetica-Bold')
     .text(`#${pass.id}`, 455, 48)
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Pass Type', 455, 70)
  doc.fillColor(COLORS.textDark).fontSize(10).font('Helvetica-Bold')
     .text('DAILY PASS', 455, 82)
  doc.restore()

  let y = 108

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS BANNER
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.save()
  doc.roundedRect(40, y, 515, 34, 4).fill(COLORS.successBg)
  doc.roundedRect(40, y, 515, 34, 4).stroke(COLORS.success).lineWidth(1.5)
  
  doc.fillColor(COLORS.success).fontSize(12).font('Helvetica-Bold')
     .text('APPROVED — DAILY PASS', 40, y + 7, { align: 'center', width: 515 })
  doc.fillColor(COLORS.success).fontSize(8.5).font('Helvetica')
     .text('This gate pass is approved for one-day movement.', 40, y + 21, { align: 'center', width: 515 })
  doc.restore()

  y += 44

  // ═══════════════════════════════════════════════════════════════════════════
  // TWO-COLUMN LAYOUT: STUDENT INFO (LEFT) + QR CODE (RIGHT)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const leftColX = 40
  const leftColWidth = 300
  const rightColX = 355
  const rightColWidth = 200
  
  // ─────────────────────────────────────────────────────────────────────────
  // LEFT COLUMN: STUDENT INFORMATION
  // ─────────────────────────────────────────────────────────────────────────
  
  doc.save()
  // Section header with blue background
  doc.roundedRect(leftColX, y, leftColWidth, 20, 3).fill(COLORS.primary)
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('👤  STUDENT INFORMATION', leftColX + 10, y + 6)
  
  // Info box
  const studentBoxY = y + 20
  const studentBoxHeight = 220
  doc.roundedRect(leftColX, studentBoxY, leftColWidth, studentBoxHeight, 4).fill('#ffffff')
  doc.roundedRect(leftColX, studentBoxY, leftColWidth, studentBoxHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  let infoY = studentBoxY + 14
  const labelX = leftColX + 15
  const valueX = leftColX + 110
  const lineHeight = 22
  
  const studentInfo = [
    ['Student Name', u?.name || 'N/A'],
    ['USN', s?.usn || 'N/A'],
    ['Department', dept?.name || 'N/A'],
    ['Program', 'Undergraduate'],
    ['Year / Semester', s ? `Year ${s.year_of_study || 'N/A'} / Semester ${s.semester || 'N/A'}` : 'N/A'],
    ['Hostel Name', s?.hostel_name || 'N/A'],
    ['Room Number', s?.room_number || 'N/A'],
    ['Email', u?.email || 'N/A'],
    ['Phone Number', u?.phone || 'N/A']
  ]
  
  studentInfo.forEach(([label, value]) => {
    doc.fillColor(COLORS.textMuted).fontSize(8).font('Helvetica')
       .text(label, labelX, infoY)
    doc.fillColor(COLORS.textDark).fontSize(9).font('Helvetica-Bold')
       .text(String(value), valueX, infoY, { width: leftColWidth - 120, ellipsis: true })
    infoY += lineHeight
  })
  
  doc.restore()
  
  // ─────────────────────────────────────────────────────────────────────────
  // RIGHT COLUMN: QR VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────
  
  doc.save()
  // Section header with blue background
  doc.roundedRect(rightColX, y, rightColWidth, 20, 3).fill(COLORS.primary)
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('🛡️  SCAN AT SECURITY GATE', rightColX + 10, y + 6)
  
  // QR box
  const qrBoxY = y + 20
  const qrBoxHeight = 220
  doc.roundedRect(rightColX, qrBoxY, rightColWidth, qrBoxHeight, 4).fill('#ffffff')
  doc.roundedRect(rightColX, qrBoxY, rightColWidth, qrBoxHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  // Large QR Code (centered)
  const qrSize = 140
  const qrX = rightColX + (rightColWidth - qrSize) / 2
  const qrY = qrBoxY + 8
  doc.image(qrImageBuffer, qrX, qrY, { width: qrSize, height: qrSize })
  
  // "SCAN TO VERIFY" label
  doc.fillColor(COLORS.success).fontSize(9).font('Helvetica-Bold')
     .text('✓ SCAN TO VERIFY', rightColX, qrY + qrSize + 4, { align: 'center', width: rightColWidth })
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Show this QR code to the security', rightColX, qrY + qrSize + 16, { align: 'center', width: rightColWidth })
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('personnel for verification.', rightColX, qrY + qrSize + 26, { align: 'center', width: rightColWidth })
  
  // QR Details box with green background
  const qrDetailsY = qrY + qrSize + 38
  doc.roundedRect(rightColX + 8, qrDetailsY, rightColWidth - 16, 48, 3).fill(COLORS.successBg)
  doc.roundedRect(rightColX + 8, qrDetailsY, rightColWidth - 16, 48, 3).stroke(COLORS.success).lineWidth(0.5)
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Pass ID`, rightColX + 15, qrDetailsY + 5)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: #${pass.id}`, rightColX + 70, qrDetailsY + 5)
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Student Name`, rightColX + 15, qrDetailsY + 14)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: ${u?.name || 'N/A'}`, rightColX + 70, qrDetailsY + 14, { width: rightColWidth - 85, ellipsis: true })
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`USN`, rightColX + 15, qrDetailsY + 23)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: ${s?.usn || 'N/A'}`, rightColX + 70, qrDetailsY + 23)
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Pass Type`, rightColX + 15, qrDetailsY + 32)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: Daily Pass`, rightColX + 70, qrDetailsY + 32)
  
  doc.fillColor(COLORS.success).fontSize(7).font('Helvetica-Bold')
     .text(`Status`, rightColX + 15, qrDetailsY + 41)
  doc.fillColor(COLORS.success).fontSize(7.5).font('Helvetica-Bold')
     .text(`: APPROVED`, rightColX + 70, qrDetailsY + 41)
  
  doc.restore()

  y += 250

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY PASS DETAILS
  // ═══════════════════════════════════════════════════════════════════════════
  
  y = drawSectionHeader(doc, 'DAILY PASS DETAILS', y)
  
  const passDetailsData = [
    ['Reason', pass.reason || 'N/A'],
    ['Destination', pass.destination || 'N/A'],
    ['Pass Date', fmtDate(pass.pass_date)],
    ['Exit Time', pass.exit_time || 'Not specified'],
    ['Expected Return Time', pass.expected_return_time || 'Not specified'],
    ['Parent Contact', pass.parent_contact || s?.parent_phone || 'N/A'],
    ['Applied Date', fmtDate(pass.createdAt)]
  ]
  y = drawInfoGrid(doc, passDetailsData, y)

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVAL INFORMATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  y = drawSectionHeader(doc, 'APPROVAL INFORMATION', y)
  
  doc.save()
  const approvalBoxHeight = 60
  doc.roundedRect(40, y, 515, approvalBoxHeight, 4).fill(COLORS.bgLight)
  doc.roundedRect(40, y, 515, approvalBoxHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  doc.fillColor(COLORS.secondary).fontSize(8).font('Helvetica-Bold')
     .text('Hostel Staff Approval', 55, y + 10)
  doc.fillColor(COLORS.textDark).fontSize(10).font('Helvetica-Bold')
     .text(hostelApproval?.approver?.name || pass.hostelStaff?.name || 'N/A', 55, y + 22)
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text(`Approved On: ${fmtDateTime(hostelApproval?.approved_at) || 'N/A'}`, 55, y + 36)
  
  doc.roundedRect(420, y + 16, 120, 24, 4).fill(COLORS.successBg)
  doc.roundedRect(420, y + 16, 120, 24, 4).stroke(COLORS.success).lineWidth(1)
  doc.fillColor(COLORS.success).fontSize(9).font('Helvetica-Bold')
     .text('Status: APPROVED', 420, y + 24, { align: 'center', width: 120 })
  
  doc.restore()
  
  y += approvalBoxHeight + 8

  // ═══════════════════════════════════════════════════════════════════════════
  // IMPORTANT INSTRUCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  y = drawSectionHeader(doc, 'IMPORTANT INSTRUCTIONS', y)
  
  doc.save()
  const instructionsHeight = 80
  doc.roundedRect(40, y, 515, instructionsHeight, 4).fill('#ffffff')
  doc.roundedRect(40, y, 515, instructionsHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  const instructions = [
    '• Daily pass is valid only for the approved date.',
    '• Student must return on the same day.',
    '• QR verification is mandatory at exit and entry.',
    '• Carry college ID card.',
    '• Misuse may result in disciplinary action.',
    '• This is a computer-generated document.'
  ]
  
  let instrY = y + 10
  instructions.forEach(instr => {
    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica')
       .text(instr, 55, instrY)
    instrY += 12
  })
  
  doc.restore()

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.save()
  doc.moveTo(40, 780).lineTo(555, 780).stroke(COLORS.borderLight).lineWidth(1)
  
  doc.fillColor(COLORS.textDark).fontSize(8).font('Helvetica-Bold')
     .text('Visvesvaraya Technological University, Belagavi', 40, 788, { align: 'center', width: 515 })
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Smart Gate Pass Management System', 40, 800, { align: 'center', width: 515 })
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text('For Official Use Only', 40, 811, { align: 'center', width: 515 })
  doc.restore()
}

// ── Long Leave PDF ────────────────────────────────────────────────────────────

const buildLongLeavePDF = (doc, pass, approvals, qrImageBuffer) => {
  const s = pass.Student
  const u = s?.User
  const dept = s?.Department
  const coordApproval = approvals.find(a => a.stage === 'COORDINATOR' && a.status === 'APPROVED')
  const hostelApproval = approvals.find(a => a.stage === 'HOSTEL_STAFF' && a.status === 'APPROVED')

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  // VTU Logo (top-left)
  drawCollegeCrest(doc, 40, 35)
  
  // Title and subtitle
  doc.fillColor(COLORS.primary).fontSize(18).font('Helvetica-Bold')
     .text('SMART GATE PASS SYSTEM', 90, 40)
  doc.fillColor(COLORS.textDark).fontSize(11).font('Helvetica-Bold')
     .text('Official Long Leave Permission Letter', 90, 60)
  
  // Generated date and university name
  const generatedDate = fmtDateTime(pass.createdAt || new Date())
  doc.fillColor(COLORS.textMuted).fontSize(8).font('Helvetica')
     .text(`📅 Generated On: ${generatedDate}  |  🏛️ Visvesvaraya Technological University, Belagavi`, 90, 75)
  
  // Pass ID and Type (top-right box)
  doc.save()
  doc.roundedRect(440, 35, 115, 65, 4).fill(COLORS.bgLight)
  doc.roundedRect(440, 35, 115, 65, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text('PASS ID', 450, 42)
  doc.fillColor(COLORS.primary).fontSize(16).font('Helvetica-Bold')
     .text(`#${pass.id}`, 450, 52)
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text('Pass Type', 450, 72)
  doc.fillColor(COLORS.textDark).fontSize(10).font('Helvetica-Bold')
     .text('LONG LEAVE', 450, 82)
  doc.restore()

  let y = 110

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS BANNER
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.save()
  doc.roundedRect(40, y, 515, 32, 4).fill(COLORS.successBg)
  doc.roundedRect(40, y, 515, 32, 4).stroke(COLORS.success).lineWidth(1.5)
  
  doc.fillColor(COLORS.success).fontSize(12).font('Helvetica-Bold')
     .text('✓ APPROVED — LONG LEAVE', 40, y + 6, { align: 'center', width: 515 })
  doc.fillColor(COLORS.success).fontSize(8).font('Helvetica')
     .text('This pass is approved and valid for the dates mentioned below.', 40, y + 20, { align: 'center', width: 515 })
  doc.restore()

  y += 42

  // ═══════════════════════════════════════════════════════════════════════════
  // TWO-COLUMN LAYOUT: STUDENT INFO (LEFT) + QR CODE (RIGHT)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const leftColX = 40
  const leftColWidth = 300
  const rightColX = 355
  const rightColWidth = 200
  
  // ─────────────────────────────────────────────────────────────────────────
  // LEFT COLUMN: STUDENT INFORMATION
  // ─────────────────────────────────────────────────────────────────────────
  
  doc.save()
  // Section header with blue background
  doc.roundedRect(leftColX, y, leftColWidth, 20, 3).fill(COLORS.primary)
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('👤  STUDENT INFORMATION', leftColX + 10, y + 6)
  
  // Info box
  const studentBoxY = y + 20
  const studentBoxHeight = 220
  doc.roundedRect(leftColX, studentBoxY, leftColWidth, studentBoxHeight, 4).fill('#ffffff')
  doc.roundedRect(leftColX, studentBoxY, leftColWidth, studentBoxHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  let infoY = studentBoxY + 14
  const labelX = leftColX + 15
  const valueX = leftColX + 110
  const lineHeight = 22
  
  const studentInfo = [
    ['Full Name', u?.name || 'N/A'],
    ['USN', s?.usn || 'N/A'],
    ['Department', dept ? `${dept.name} (${dept.code})` : 'N/A'],
    ['Program', 'Undergraduate'],
    ['Year / Semester', s ? `Year ${s.year_of_study || 'N/A'} / Semester ${s.semester || 'N/A'}` : 'N/A'],
    ['Hostel Name', s?.hostel_name || 'N/A'],
    ['Room Number', s?.room_number || 'N/A'],
    ['Email', u?.email || 'N/A'],
    ['Phone', u?.phone || 'N/A']
  ]
  
  studentInfo.forEach(([label, value]) => {
    doc.fillColor(COLORS.textMuted).fontSize(8).font('Helvetica')
       .text(label, labelX, infoY)
    doc.fillColor(COLORS.textDark).fontSize(9).font('Helvetica-Bold')
       .text(String(value), valueX, infoY, { width: leftColWidth - 120, ellipsis: true })
    infoY += lineHeight
  })
  
  doc.restore()
  
  // ─────────────────────────────────────────────────────────────────────────
  // RIGHT COLUMN: QR VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────
  
  doc.save()
  // Section header with blue background
  doc.roundedRect(rightColX, y, rightColWidth, 20, 3).fill(COLORS.primary)
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('🛡️  SCAN AT SECURITY GATE', rightColX + 10, y + 6)
  
  // QR box
  const qrBoxY = y + 20
  const qrBoxHeight = 220
  doc.roundedRect(rightColX, qrBoxY, rightColWidth, qrBoxHeight, 4).fill('#ffffff')
  doc.roundedRect(rightColX, qrBoxY, rightColWidth, qrBoxHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  // Large QR Code (centered)
  const qrSize = 140
  const qrX = rightColX + (rightColWidth - qrSize) / 2
  const qrY = qrBoxY + 8
  doc.image(qrImageBuffer, qrX, qrY, { width: qrSize, height: qrSize })
  
  // "SCAN TO VERIFY" label
  doc.fillColor(COLORS.success).fontSize(9).font('Helvetica-Bold')
     .text('✓ SCAN TO VERIFY', rightColX, qrY + qrSize + 4, { align: 'center', width: rightColWidth })
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Show this QR code to the security', rightColX, qrY + qrSize + 16, { align: 'center', width: rightColWidth })
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('personnel for verification.', rightColX, qrY + qrSize + 26, { align: 'center', width: rightColWidth })
  
  // QR Details box with green background
  const qrDetailsY = qrY + qrSize + 38
  doc.roundedRect(rightColX + 8, qrDetailsY, rightColWidth - 16, 56, 3).fill(COLORS.successBg)
  doc.roundedRect(rightColX + 8, qrDetailsY, rightColWidth - 16, 56, 3).stroke(COLORS.success).lineWidth(0.5)
  
  const leavingDate = pass.leaving_date || pass.from_date
  const returningDate = pass.returning_date || pass.to_date
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Pass ID`, rightColX + 15, qrDetailsY + 5)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: #${pass.id}`, rightColX + 70, qrDetailsY + 5)
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Student Name`, rightColX + 15, qrDetailsY + 14)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: ${u?.name || 'N/A'}`, rightColX + 70, qrDetailsY + 14, { width: rightColWidth - 85, ellipsis: true })
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`USN`, rightColX + 15, qrDetailsY + 23)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: ${s?.usn || 'N/A'}`, rightColX + 70, qrDetailsY + 23)
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Pass Type`, rightColX + 15, qrDetailsY + 32)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: Long Leave`, rightColX + 70, qrDetailsY + 32)
  
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text(`Leaving Date`, rightColX + 15, qrDetailsY + 41)
  doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica-Bold')
     .text(`: ${fmtDate(leavingDate)}`, rightColX + 70, qrDetailsY + 41)
  
  doc.fillColor(COLORS.success).fontSize(7).font('Helvetica-Bold')
     .text(`Status`, rightColX + 15, qrDetailsY + 50)
  doc.fillColor(COLORS.success).fontSize(7.5).font('Helvetica-Bold')
     .text(`: APPROVED`, rightColX + 70, qrDetailsY + 50)
  
  doc.restore()

  y += 250

  // ═══════════════════════════════════════════════════════════════════════════
  // TRAVEL / LEAVE DETAILS
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.save()
  doc.roundedRect(40, y, 515, 20, 3).fill(COLORS.primary)
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('✈️  TRAVEL / LEAVE DETAILS', 50, y + 6)
  doc.restore()
  
  y += 20
  
  let duration = 'N/A'
  if (leavingDate && returningDate) {
    const diff = Math.ceil((new Date(returningDate) - new Date(leavingDate)) / (1000 * 60 * 60 * 24))
    duration = `${diff} day${diff !== 1 ? 's' : ''}`
  }
  
  const travelDetailsData = [
    ['Pass Type', 'Long Leave'],
    ['Reason', pass.reason || 'N/A'],
    ['Destination', pass.destination || 'N/A'],
    ['Leaving Date', fmtDate(leavingDate)],
    ['Returning Date', fmtDate(returningDate)],
    ['Leave Duration', duration],
    ['Parent Contact', pass.parent_contact || s?.parent_phone || 'N/A']
  ]
  y = drawInfoGrid(doc, travelDetailsData, y)

  // ═══════════════════════════════════════════════════════════════════════════
  // APPROVAL INFORMATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.save()
  doc.roundedRect(40, y, 515, 20, 3).fill(COLORS.primary)
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('✅  APPROVAL INFORMATION', 50, y + 6)
  doc.restore()
  
  y += 20
  
  // Two approval cards side by side
  doc.save()
  const approvalBoxHeight = 70
  const cardWidth = 250
  
  // Coordinator Approval Card
  doc.roundedRect(40, y, cardWidth, approvalBoxHeight, 4).fill(COLORS.bgLight)
  doc.roundedRect(40, y, cardWidth, approvalBoxHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  doc.fillColor(COLORS.secondary).fontSize(8).font('Helvetica-Bold')
     .text('COORDINATOR APPROVAL', 55, y + 10)
  doc.roundedRect(55, y + 22, 80, 16, 3).fill(COLORS.successBg)
  doc.roundedRect(55, y + 22, 80, 16, 3).stroke(COLORS.success).lineWidth(0.5)
  doc.fillColor(COLORS.success).fontSize(7.5).font('Helvetica-Bold')
     .text('APPROVED', 55, y + 27, { align: 'center', width: 80 })
  
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Coordinator', 55, y + 42)
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold')
     .text(coordApproval?.approver?.name || pass.coordinator?.name || 'N/A', 55, y + 52, { width: cardWidth - 30, ellipsis: true })
  
  // Hostel Staff Approval Card
  doc.roundedRect(305, y, cardWidth, approvalBoxHeight, 4).fill(COLORS.bgLight)
  doc.roundedRect(305, y, cardWidth, approvalBoxHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  doc.fillColor(COLORS.secondary).fontSize(8).font('Helvetica-Bold')
     .text('HOSTEL STAFF APPROVAL', 320, y + 10)
  doc.roundedRect(320, y + 22, 80, 16, 3).fill(COLORS.successBg)
  doc.roundedRect(320, y + 22, 80, 16, 3).stroke(COLORS.success).lineWidth(0.5)
  doc.fillColor(COLORS.success).fontSize(7.5).font('Helvetica-Bold')
     .text('APPROVED', 320, y + 27, { align: 'center', width: 80 })
  
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Hostel Staff', 320, y + 42)
  doc.fillColor(COLORS.textDark).fontSize(8.5).font('Helvetica-Bold')
     .text(hostelApproval?.approver?.name || pass.hostelStaff?.name || 'N/A', 320, y + 52, { width: cardWidth - 30, ellipsis: true })
  
  doc.restore()
  
  y += approvalBoxHeight + 8

  // ═══════════════════════════════════════════════════════════════════════════
  // IMPORTANT INSTRUCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.save()
  doc.roundedRect(40, y, 515, 20, 3).fill(COLORS.primary)
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('⚠️  IMPORTANT INSTRUCTIONS', 50, y + 6)
  doc.restore()
  
  y += 20
  
  doc.save()
  const instructionsHeight = 60
  doc.roundedRect(40, y, 515, instructionsHeight, 4).fill('#ffffff')
  doc.roundedRect(40, y, 515, instructionsHeight, 4).stroke(COLORS.borderLight).lineWidth(1)
  
  const instructions = [
    '• This pass is valid only for the above mentioned dates.',
    '• Show this QR code at the security gate during entry and exit.',
    '• Misuse of the pass may lead to disciplinary action.',
    '• This is a computer-generated document. No physical signature required.'
  ]
  
  let instrY = y + 10
  instructions.forEach(instr => {
    doc.fillColor(COLORS.textDark).fontSize(7.5).font('Helvetica')
       .text(instr, 55, instrY)
    instrY += 12
  })
  
  doc.restore()

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.save()
  doc.moveTo(40, 780).lineTo(555, 780).stroke(COLORS.primary).lineWidth(2)
  
  doc.fillColor(COLORS.textDark).fontSize(8).font('Helvetica-Bold')
     .text('🏛️ Visvesvaraya Technological University, Belagavi', 40, 788, { align: 'center', width: 515 })
  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
     .text('Smart Gate Pass Management System', 40, 800, { align: 'center', width: 515 })
  doc.fillColor(COLORS.textMuted).fontSize(7).font('Helvetica')
     .text('For official use only', 40, 811, { align: 'center', width: 515 })
  doc.restore()
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
