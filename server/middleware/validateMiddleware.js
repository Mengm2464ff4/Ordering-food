const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      }))
    })
  }
  next()
}

// Validation rules for common fields
const validateObjectId = (req, res, next) => {
  const id = req.params.id || req.params.userId || req.params.orderId
  const objectIdRegex = /^[0-9a-fA-F]{24}$/
  
  if (id && !objectIdRegex.test(id)) {
    return res.status(400).json({ message: 'Invalid ID format' })
  }
  next()
}

// Sanitize input
const sanitizeInput = (req, res, next) => {
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim()
  }
  if (req.body.name) {
    req.body.name = req.body.name.trim()
  }
  next()
}

module.exports = { 
  validate, 
  validateObjectId,
  sanitizeInput,
}