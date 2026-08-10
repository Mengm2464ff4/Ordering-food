const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure upload directories exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/'
    
    if (file.fieldname === 'foodImage') {
      folder += 'foods/'
    } else if (file.fieldname === 'userAvatar') {
      folder += 'users/'
    } else if (file.fieldname === 'reviewImage') {
      folder += 'reviews/'
    }
    
    ensureDirectoryExists(folder)
    cb(null, folder)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only images are allowed'), false)
  }
}

// Create multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
})

// Single file upload
const uploadSingle = (fieldName) => upload.single(fieldName)

// Multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount)

// Delete uploaded file
const deleteUploadedFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    return true
  }
  return false
}

// Get file URL
const getFileUrl = (req, filename) => {
  if (!filename) return null
  const baseUrl = `${req.protocol}://${req.get('host')}`
  return `${baseUrl}/uploads/${filename}`
}

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  deleteUploadedFile,
  getFileUrl,
}