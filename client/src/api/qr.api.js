import axiosInstance from './axios'

/**
 * Generate QR Token for a pass
 * @param {number} passId - Pass ID
 * @returns {Promise<object>} QR token record
 */
export const generateQRToken = async (passId) => {
  const response = await axiosInstance.post(`/qr/generate/${passId}`)
  return response.data
}

/**
 * Generate QR Code image from token
 * @param {string} token - QR token
 * @returns {Promise<object>} QR image (Base64 data URL)
 */
export const generateQRCode = async (token) => {
  const response = await axiosInstance.post('/qr/code', {
    token
  })
  return response.data
}

/**
 * Verify QR Token
 * @param {string} token - QR token to verify
 * @returns {Promise<object>} Pass details, student details, approval details
 */
export const verifyQRToken = async (token) => {
  const response = await axiosInstance.post('/qr/verify', {
    token
  })
  return response.data
}

/**
 * Get QR Token and Image for a pass
 * @param {number} passId - Pass ID
 * @returns {Promise<object>} QR token and image
 */
export const getQRForPass = async (passId) => {
  const response = await axiosInstance.get(`/qr/pass/${passId}`)
  return response.data
}

/**
 * Deactivate QR Token for a pass
 * @param {number} passId - Pass ID
 * @returns {Promise<object>} Deactivation result
 */
export const deactivateQR = async (passId) => {
  const response = await axiosInstance.put(`/qr/deactivate/${passId}`)
  return response.data
}

/**
 * Get QR Token details
 * @param {string} token - QR token
 * @returns {Promise<object>} QR token details
 */
export const getQRTokenDetails = async (token) => {
  const response = await axiosInstance.get(`/qr/token/${token}`)
  return response.data
}

export default {
  generateQRToken,
  generateQRCode,
  verifyQRToken,
  getQRForPass,
  deactivateQR,
  getQRTokenDetails
}
