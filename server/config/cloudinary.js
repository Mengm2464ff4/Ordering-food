const cloudinary = require('cloudinary').v2
const fs = require('fs')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET)
}

// Upload image from file path
const uploadImage = async (filePath, options = {}) => {
  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary not configured - using local storage')
    return { secure_url: filePath, public_id: null }
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'food-ordering',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [
        { width: options.width || 800, height: options.height || 800, crop: 'limit' },
        { quality: options.quality || 'auto' },
      ],
    })
    return result
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return { secure_url: filePath, public_id: null }
  }
}

// Upload multiple images
const uploadMultipleImages = async (files, options = {}) => {
  const uploadPromises = files.map(file => uploadImage(file.path, options))
  return Promise.all(uploadPromises)
}

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId) return false

  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Delete image error:', error)
    return false
  }
}

// Validate image file
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WEBP.' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 5MB.' }
  }
  
  return { valid: true, error: null }
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  validateImageFile,
}