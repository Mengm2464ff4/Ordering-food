const express = require('express')
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)

router.put('/change-password', protect, changePassword)

module.exports = router