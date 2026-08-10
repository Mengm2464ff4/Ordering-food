// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
}

// User Roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

// Order Status Flow (valid transitions)
const ORDER_STATUS_FLOW = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY],
  [ORDER_STATUS.READY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
}

// Payment Methods
const PAYMENT_METHODS = {
  KHQR: 'KHQR',
  CASH: 'Cash',
}

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

// Food Categories
const FOOD_CATEGORIES = [
  'Khmer Food',
  'Noodles',
  'Rice',
  'Seafood',
  'Desserts',
  'Beverages',
  'Salads',
  'Soups',
  'Appetizers',
]

// Notification Types
const NOTIFICATION_TYPES = {
  ORDER: 'order',
  PAYMENT: 'payment',
  SYSTEM: 'system',
  PROMOTION: 'promotion',
  ALERT: 'alert',
}

// Notification Priority
const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

// File Upload Limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES_PER_UPLOAD: 5,
}

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  FOODS: 300, // 5 minutes
  CATEGORIES: 3600, // 1 hour
  ORDERS: 60, // 1 minute
}

// Regular Expressions
const REGEX = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PHONE: /^(0[1-9]{1}[0-9]{7}|(\+855)[1-9]{1}[0-9]{7})$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
}

// API Response Messages
const MESSAGES = {
  // Success messages
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  
  // Error messages
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  
  // Order messages
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  
  // Payment messages
  PAYMENT_SUCCESS: 'Payment successful',
  PAYMENT_FAILED: 'Payment failed',
  PAYMENT_PENDING: 'Payment pending verification',
}

// Delivery Settings
const DELIVERY = {
  BASE_FEE: 2,
  FREE_DELIVERY_THRESHOLD: 50,
  TAX_RATE: 0.1,
  ESTIMATED_TIME: 30, // minutes
}

// File paths
const PATHS = {
  UPLOADS: 'uploads/',
  FOOD_IMAGES: 'uploads/foods/',
  USER_AVATARS: 'uploads/users/',
  REVIEW_IMAGES: 'uploads/reviews/',
}

// API Routes
const API_ROUTES = {
  AUTH: '/api/auth',
  FOODS: '/api/foods',
  ORDERS: '/api/orders',
  PAYMENTS: '/api/payments',
  USERS: '/api/users',
  ADMIN: '/api/admin',
  REVIEWS: '/api/reviews',
  UPLOADS: '/api/uploads',
}

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  ORDER_STATUS,
  ORDER_STATUS_FLOW,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  FOOD_CATEGORIES,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITY,
  UPLOAD_LIMITS,
  PAGINATION,
  CACHE_TTL,
  REGEX,
  MESSAGES,
  DELIVERY,
  PATHS,
  API_ROUTES,
}