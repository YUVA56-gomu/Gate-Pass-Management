import axiosInstance from './axios'

/**
 * Generate PDF for a pass
 * @param {number} passId - Pass ID
 * @returns {Promise<object>} PDF generation result
 */
export const generatePDF = async (passId) => {
  const response = await axiosInstance.post(`/pdf/generate/${passId}`)
  return response.data
}

/**
 * Download PDF file for a pass
 * @param {number} passId - Pass ID
 * @returns {Promise<Blob>} PDF file blob
 */
export const downloadPDF = async (passId) => {
  const response = await axiosInstance.get(`/pdf/download/${passId}`, {
    responseType: 'blob'
  })
  return response.data
}

/**
 * Get PDF metadata for a pass
 * @param {number} passId - Pass ID
 * @returns {Promise<object>} PDF metadata
 */
export const getPDFMetadata = async (passId) => {
  const response = await axiosInstance.get(`/pdf/${passId}`)
  return response.data
}

export default {
  generatePDF,
  downloadPDF,
  getPDFMetadata
}
