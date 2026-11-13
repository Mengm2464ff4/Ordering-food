const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')

// Load environment variables
dotenv.config()

// Import configurations
const connectDB = require('./config/db')
const { initTelegramBot } = require('./config/telegram')
const { initEmailService } = require('./services/emailService')

// Import routes
const authRoutes = require('./routes/authRoutes')
const foodRoutes = require('./routes/foodRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')

// Import middleware
const { errorMiddleware } = require('./middleware/errorMiddleware')
const { notFoundMiddleware } = require('./middleware/notFoundMiddleware')

// Initialize express app
const app = express()

// ✅ បន្ថែមបន្ទាត់នេះ ដើម្បីដោះស្រាយ X-Forwarded-For
app.set('trust proxy', 1)

// ====================
// Security Middleware
// ====================

// Set security headers
app.use(helmet())

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
})
app.use('/api/auth', authLimiter)

// ====================
// Standard Middleware
// ====================

// Compress responses
app.use(compression())

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Parse JSON and urlencoded bodies
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ====================
// Health Check Route
// ====================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// ====================
// API Routes
// ====================
app.use('/api/auth', authRoutes)
app.use('/api/foods', foodRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)

// ====================
// Root Route
// ====================
app.get('/', (req, res) => {
  res.json({
    name: 'Food Ordering API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      foods: '/api/foods',
      orders: '/api/orders',
      payments: '/api/payments',
      uploads: '/api/upload',
      reviews: '/api/reviews',
      users: '/api/users',
      admin: '/api/admin',
      health: '/api/health',
    },
  })
})

// ====================
// Error Handling Middleware
// ====================
app.use(notFoundMiddleware)
app.use(errorMiddleware)

// ====================
// Start Server Function
// ====================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()
    console.log('✓ MongoDB connected successfully')

    // Initialize Telegram bot (optional)
    initTelegramBot()
    
    // Initialize Email service (optional)
    initEmailService()

    // Start server
    const PORT = process.env.PORT || 5000
    const server = app.listen(PORT, () => {
      console.log(`\n=================================`)
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`✓ API URL: http://localhost:${PORT}/api`)
      console.log(`✓ Health check: http://localhost:${PORT}/api/health`)
      console.log(`=================================\n`)
    })

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`)
      
      server.close(async () => {
        console.log('HTTP server closed')
        
        try {
          await mongoose.connection.close()
          console.log('MongoDB connection closed')
          process.exit(0)
        } catch (error) {
          console.error('Error during shutdown:', error)
          process.exit(1)
        }
      })
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down')
        process.exit(1)
      }, 10000)
    }

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections (only once)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
startServer()

module.exports = app