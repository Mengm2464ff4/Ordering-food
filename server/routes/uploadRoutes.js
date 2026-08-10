const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { protect, admin } = require('../middleware/authMiddleware')
const router = express.Router()

// Configure storage directly in routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/foods/'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)
  
  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only images are allowed'))
  }
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
})

// Upload single image
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }
  
  const imageUrl = `/uploads/foods/${req.file.filename}`
  res.json({ imageUrl })
})

// Upload multiple images
router.post('/multiple', protect, admin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' })
  }
  
  const images = req.files.map(file => `/uploads/foods/${file.filename}`)
  res.json({ images })
})

module.exports = router