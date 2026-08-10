const cloudinary = require('../config/cloudinary')
const asyncHandler = require('express-async-handler')
const fs = require('fs')

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error('No file uploaded')
  }

  // Validate file
  const validation = cloudinary.validateImageFile(req.file)
  if (!validation.valid) {
    res.status(400)
    throw new Error(validation.error)
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploadImage(req.file.path, {
    folder: req.body.folder || 'food-ordering',
  })

  // Delete local file after upload
  if (req.file.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path)
  }

  res.json({
    imageUrl: result.secure_url,
    publicId: result.public_id,
  })
})

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400)
    throw new Error('No files uploaded')
  }

  const results = []
  for (const file of req.files) {
    const result = await cloudinary.uploadImage(file.path)
    results.push({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    })
    // Delete local file after upload
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }
  }

  res.json({
    images: results,
    count: results.length,
  })
})

// @desc    Delete image
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params
  
  const deleted = await cloudinary.deleteImage(publicId)
  
  if (deleted) {
    res.json({ message: 'Image deleted successfully' })
  } else {
    res.status(404)
    throw new Error('Image not found')
  }
})

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
}