export const errorHandler = (err, req, res, next) => {
  console.error(err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Duplicate entry',
      field: err.errors[0].path
    })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  })
}
