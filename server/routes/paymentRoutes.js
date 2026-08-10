const express = require('express')
const {
  createKHQRPayment,
  verifyPayment,
  getPaymentStatus,
  getPayments,
  getPaymentHistory,
  getPaymentByOrder,
  refundPayment,
} = require('../controllers/paymentController')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

// User routes
router.post('/khqr', protect, createKHQRPayment)
router.post('/verify', protect, verifyPayment)
router.get('/status/:id', protect, getPaymentStatus)
router.get('/history', protect, getPaymentHistory)
router.get('/order/:orderId', protect, getPaymentByOrder)

// Admin routes
router.get('/', protect, admin, getPayments)
router.post('/:id/refund', protect, admin, refundPayment)

module.exports = router