const cloudinary = require('../config/cloudinary')
const fs = require('fs')
const path = require('path')

class UploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads')
    this.ensureUploadDirectory()
  }

  ensureUploadDirectory() {
    const dirs = ['foods', 'users', 'reviews']
    dirs.forEach(dir => {
      const fullPath = path.join(this.uploadDir, dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    })
  }

  async uploadToCloudinary(file, folder = 'food-ordering') {
    if (!cloudinary.isCloudinaryConfigured()) {
      return this.saveToLocal(file, folder)
    }

    try {
      const result = await cloudinary.uploadImage(file, { folder })
      return {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
      }
    } catch (error) {
      console.error('Cloudinary upload failed:', error)
      return this.saveToLocal(file, folder)
    }
  }

  async saveToLocal(file, folder) {
    const uploadFolder = path.join(this.uploadDir, folder)
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true })
    }

    const filename = `${Date.now()}-${file.originalname}`
    const filepath = path.join(uploadFolder, filename)

    // Save file
    fs.writeFileSync(filepath, file.buffer)

    return {
      url: `/uploads/${folder}/${filename}`,
      publicId: filename,
      provider: 'local',
      path: filepath,
    }
  }

  async uploadMultiple(files, folder = 'food-ordering') {
    const uploadPromises = files.map(file => this.uploadToCloudinary(file, folder))
    return Promise.all(uploadPromises)
  }

  async deleteFile(fileUrl, publicId, provider = 'cloudinary') {
    if (provider === 'cloudinary' && publicId) {
      return await cloudinary.deleteImage(publicId)
    } else if (provider === 'local') {
      try {
        const filepath = path.join(this.uploadDir, fileUrl.replace('/uploads/', ''))
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
          return true
        }
      } catch (error) {
        console.error('Local file deletion failed:', error)
      }
    }
    return false
  }

  getFileUrl(filename, folder = 'foods') {
    if (!filename) return null
    return `/uploads/${folder}/${filename}`
  }

  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Maximum size is 5MB.' }
    }

    return { valid: true }
  }
}

module.exports = new UploadService()