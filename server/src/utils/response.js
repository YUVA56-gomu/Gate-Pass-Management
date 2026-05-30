/**
 * Send success response
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} errors - Additional error details
 */
export const sendError = (res, message = 'Error', statusCode = 400, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  })
}

// Aliases for backward compatibility
export const successResponse = sendSuccess
export const errorResponse = sendError

export default { sendSuccess, sendError, successResponse, errorResponse }
