// KHQR Payment Configuration
const KHQRConfig = {
  accountId: process.env.KHQR_ACCOUNT_ID || '',
  apiKey: process.env.KHQR_API_KEY || '',
  merchantName: process.env.KHQR_MERCHANT_NAME || 'Food Ordering App',
  merchantCity: process.env.KHQR_MERCHANT_CITY || 'Phnom Penh',
  merchantId: process.env.KHQR_MERCHANT_ID || '',
  currency: 'KHR',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
}

// Payment Methods
const PAYMENT_METHODS = {
  KHQR: 'KHQR',
  CASH: 'Cash',
}

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

// Transaction Types
const TRANSACTION_TYPES = {
  PAYMENT: 'payment',
  REFUND: 'refund',
}

// Validate KHQR Configuration
const validateKHQRConfig = () => {
  const required = ['accountId', 'apiKey', 'merchantId']
  const missing = required.filter(key => !KHQRConfig[key])
  
  if (missing.length > 0) {
    console.warn(`Missing KHQR configuration: ${missing.join(', ')}`)
    return false
  }
  return true
}

// Get Payment Gateway URL
const getPaymentGatewayUrl = () => {
  return KHQRConfig.environment === 'production'
    ? 'https://api.khqr.com/v1'
    : 'https://sandbox-api.khqr.com/v1'
}

module.exports = {
  KHQRConfig,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  TRANSACTION_TYPES,
  validateKHQRConfig,
  getPaymentGatewayUrl,
}