const User = require('../models/User')
const { generateToken } = require('../config/jwt')
const { sendUserRegistrationNotification } = require('../config/telegram')
const asyncHandler = require('express-async-handler')

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, phone, address } = req.body

//   const userExists = await User.findOne({ email })
//   if (userExists) {
//     res.status(400)
//     throw new Error('User already exists')
//   }

//   const user = await User.create({
//     name,
//     email,
//     password,
//     phone,
//     address,
//   })

//   if (user) {
//     await sendUserRegistrationNotification(user)
//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       address: user.address,
//       role: user.role,
//       token: generateToken(user._id),
//     })
//   } else {
//     res.status(400)
//     throw new Error('Invalid user data')
//   }
// })
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body

  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
  })

  if (user) {
    console.log('📢 New user registered, sending Telegram notification...', {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    })
    try {
      await sendUserRegistrationNotification(user)
      console.log('✅ Telegram notification sent')
    } catch (error) {
      console.error('❌ Telegram notification failed:', error.message)
    }
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.phone = req.body.phone || user.phone
    user.address = req.body.address || user.address
    
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user._id)

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } else {
    res.status(401)
    throw new Error('Current password is incorrect')
  }
})

// @desc    Forgot password - send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Generate reset token (simplified - in production use proper token)
  const resetToken = generateToken(user._id)
  
  // In production, send email with reset link
  // For now, just return the token
  res.json({ 
    message: 'Password reset link sent to email',
    resetToken // Remove in production
  })
})

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body
  
  // Verify token and get user
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const user = await User.findById(decoded.id)

  if (!user) {
    res.status(400)
    throw new Error('Invalid or expired reset token')
  }

  user.password = newPassword
  await user.save()
  
  res.json({ message: 'Password reset successfully' })
})

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
}