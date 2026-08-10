const express = require('express')
const {
  getFoods,
  getFoodById,
  getPopularFoods,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
} = require('../controllers/foodController')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

// Public routes
router.get('/', getFoods)
router.get('/popular', getPopularFoods)
router.get('/categories/all', getCategories)
router.get('/:id', getFoodById)

// Admin only routes
router.post('/', protect, admin, createFood)
router.put('/:id', protect, admin, updateFood)
router.delete('/:id', protect, admin, deleteFood)
router.put('/:id/toggle', protect, admin, toggleFoodAvailability)

module.exports = router