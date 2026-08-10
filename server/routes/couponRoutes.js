const express = require('express')
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

// Public routes
router.post('/validate', protect, validateCoupon)

// Admin routes
router.get('/', protect, admin, getAllCoupons)
router.post('/', protect, admin, createCoupon)
router.put('/:id', protect, admin, updateCoupon)
router.delete('/:id', protect, admin, deleteCoupon)

module.exports = router