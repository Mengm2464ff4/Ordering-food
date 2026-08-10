const express = require('express')
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  createUser,
} = require('../controllers/userController')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

router.use(protect, admin) // All user routes require admin access

router.route('/')
  .get(getUsers)
  .post(createUser)

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser)

router.put('/:id/toggle-status', toggleUserStatus)

module.exports = router