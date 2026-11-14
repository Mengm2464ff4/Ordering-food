const express = require('express')
const {
  createKHQRPayment,
  verifyPayment,
  getPaymentStatus,
  getPayments,
  getPaymentHistory,
  getPaymentByOrder,
  refundPayment,
  createABAPayment,
  abaCallback,
} = require('../controllers/paymentController')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

// ==================== USER ROUTES ====================
router.post('/khqr', protect, createKHQRPayment)
router.post('/verify', protect, verifyPayment)

router.post('/aba-payway', protect, createABAPayment)
router.post('/aba-callback', abaCallback) 

router.get('/status/:id', protect, getPaymentStatus)
router.get('/history', protect, getPaymentHistory)
router.get('/order/:orderId', protect, getPaymentByOrder)

// ==================== ADMIN ROUTES ====================
router.get('/', protect, admin, getPayments)
router.post('/:id/refund', protect, admin, refundPayment)

module.exports = router