const express = require('express')
const {
  createReview,
  getFoodReviews,
  deleteReview,
  getAllReviews,
  moderateReview,
} = require('../controllers/reviewController')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

// Public routes
router.get('/food/:foodId', getFoodReviews)

// User routes
router.post('/', protect, createReview)

// Admin routes
router.get('/', protect, admin, getAllReviews)
router.delete('/:id', protect, admin, deleteReview)
router.put('/:id/moderate', protect, admin, moderateReview)

module.exports = router