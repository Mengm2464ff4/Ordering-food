const express = require('express')
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  cancelOrder,
} = require('../controllers/orderController')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

// User routes
router.post('/', protect, addOrderItems)
router.get('/myorders', protect, getMyOrders)
router.put('/:id/pay', protect, updateOrderToPaid)
router.put('/:id/cancel', protect, cancelOrder)
router.get('/:id', protect, getOrderById)

// Admin routes
router.get('/', protect, admin, getOrders)
router.put('/:id/status', protect, admin, updateOrderStatus)

module.exports = router