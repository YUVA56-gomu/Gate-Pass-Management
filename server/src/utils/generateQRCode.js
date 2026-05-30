import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

export const generateQRCode = async (data, passId) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'qr')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, `${passId}.png`)
    await QRCode.toFile(filePath, JSON.stringify(data))
    return filePath
  } catch (error) {
    console.error('QR Code generation error:', error)
    throw error
  }
}
