const validator = require('express-validator')

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  return emailRegex.test(email)
}

// Phone validation (Cambodian format)
const isValidPhone = (phone) => {
  const phoneRegex = /^(0[1-9]{1}[0-9]{7}|(\+855)[1-9]{1}[0-9]{7})$/
  return phoneRegex.test(phone)
}

// Password validation (min 6 chars, at least one letter and one number)
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
  return passwordRegex.test(password)
}

// Name validation
const isValidName = (name) => {
  return name && name.length >= 2 && name.length <= 50
}

// Price validation
const isValidPrice = (price) => {
  const num = parseFloat(price)
  return !isNaN(num) && num >= 0 && num <= 10000
}

// Quantity validation
const isValidQuantity = (quantity) => {
  const num = parseInt(quantity)
  return !isNaN(num) && num >= 1 && num <= 99
}

// Object ID validation
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/
  return objectIdRegex.test(id)
}

// URL validation
const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Rating validation
const isValidRating = (rating) => {
  const num = parseFloat(rating)
  return !isNaN(num) && num >= 1 && num <= 5
}

// Address validation
const isValidAddress = (address) => {
  return address && 
         address.street && 
         address.city && 
         address.street.length >= 5 &&
         address.city.length >= 2
}

// Express validator rules for common fields
const validateRegister = [
  validator.body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  validator.body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  validator.body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  validator.body('phone')
    .optional()
    .matches(/^(0[1-9]{1}[0-9]{7}|(\+855)[1-9]{1}[0-9]{7})$/).withMessage('Please provide a valid phone number'),
]

const validateLogin = [
  validator.body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  validator.body('password')
    .notEmpty().withMessage('Password is required'),
]

const validateFood = [
  validator.body('name')
    .notEmpty().withMessage('Food name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Food name must be between 2 and 100 characters'),
  validator.body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  validator.body('price')
    .isFloat({ min: 0, max: 10000 }).withMessage('Price must be between 0 and 10000'),
  validator.body('category')
    .notEmpty().withMessage('Category is required'),
  validator.body('image')
    .notEmpty().withMessage('Food image is required'),
]

const validateOrder = [
  validator.body('orderItems')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  validator.body('shippingAddress')
    .notEmpty().withMessage('Shipping address is required'),
  validator.body('paymentMethod')
    .isIn(['KHQR', 'Cash']).withMessage('Invalid payment method'),
]

const validateReview = [
  validator.body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  validator.body('comment')
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 5, max: 500 }).withMessage('Comment must be between 5 and 500 characters'),
]

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidName,
  isValidPrice,
  isValidQuantity,
  isValidObjectId,
  isValidUrl,
  isValidRating,
  isValidAddress,
  validateRegister,
  validateLogin,
  validateFood,
  validateOrder,
  validateReview,
}