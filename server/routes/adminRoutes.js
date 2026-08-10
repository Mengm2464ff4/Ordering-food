const express = require('express')
const {
  getDashboardStats,
  getRevenueChart,
  getTopSellingFoods,
  getOrderStats,
  getUserStats,
  getSystemHealth,
} = require('../controllers/adminController')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect, admin)

// Dashboard routes
router.get('/stats', getDashboardStats)
router.get('/charts/revenue', getRevenueChart)
router.get('/charts/top-foods', getTopSellingFoods)
router.get('/order-stats', getOrderStats)
router.get('/user-stats', getUserStats)
router.get('/health', getSystemHealth)

module.exports = router