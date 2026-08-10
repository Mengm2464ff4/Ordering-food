const User = require('../models/User')
const Order = require('../models/Order')
const Food = require('../models/Food')
const Payment = require('../models/Payment')
const Review = require('../models/Review')
const asyncHandler = require('express-async-handler')

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments()
  const totalOrders = await Order.countDocuments()
  const totalFoods = await Food.countDocuments()
  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ])

  const recentOrders = await Order.find()
    .populate('user', 'name')
    .sort('-createdAt')
    .limit(5)

  const recentUsers = await User.find()
    .select('-password')
    .sort('-createdAt')
    .limit(5)

  const lowStockFoods = await Food.find({ isAvailable: true }).limit(5)

  res.json({
    stats: {
      totalUsers,
      totalOrders,
      totalFoods,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    recentOrders,
    recentUsers,
    lowStockFoods,
  })
})

// @desc    Get revenue chart data
// @route   GET /api/admin/charts/revenue
// @access  Private/Admin
const getRevenueChart = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query
  
  const revenueData = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        paidAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ])

  res.json(revenueData)
})

// @desc    Get top selling foods
// @route   GET /api/admin/charts/top-foods
// @access  Private/Admin
const getTopSellingFoods = asyncHandler(async (req, res) => {
  const topFoods = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.name',
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ])

  res.json(topFoods)
})

// @desc    Get order statistics by status
// @route   GET /api/admin/order-stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$totalPrice' }
      }
    }
  ])

  res.json(stats)
})

// @desc    Get user activity stats
// @route   GET /api/admin/user-stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  })

  const activeUsers = await User.countDocuments({ isActive: true })
  const adminCount = await User.countDocuments({ role: 'admin' })
  const customerCount = await User.countDocuments({ role: 'user' })

  res.json({
    newUsersThisMonth,
    activeUsers,
    adminCount,
    customerCount,
    totalUsers: activeUsers + (await User.countDocuments({ isActive: false }))
  })
})

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private/Admin
const getSystemHealth = asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  
  res.json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

module.exports = {
  getDashboardStats,
  getRevenueChart,
  getTopSellingFoods,
  getOrderStats,
  getUserStats,
  getSystemHealth,
}