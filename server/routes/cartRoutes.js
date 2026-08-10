const express = require('express')
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()

router.use(protect) // All cart routes require authentication

router.route('/')
  .get(getCart)
  .delete(clearCart)

router.post('/add', addToCart)
router.put('/item/:foodId', updateCartItem)
router.delete('/item/:foodId', removeFromCart)

module.exports = router