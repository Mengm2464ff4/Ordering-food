import axios from '../api/axios'

class PaymentService {
  constructor() {
    this.paymentMethods = {
      KHQR: 'KHQR',
      CASH: 'Cash',
    }
  }

  // Create KHQR payment
  async createKHQRPayment(orderId, amount) {
    try {
      const response = await axios.post('/payments/khqr', { orderId, amount })
      return {
        success: true,
        paymentId: response.data.paymentId,
        qrCode: response.data.qrCode,
        transactionId: response.data.transactionId,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create payment',
      }
    }
  }

  // Verify payment status
  async verifyPayment(paymentId, transactionId) {
    try {
      const response = await axios.post('/payments/verify', { paymentId, transactionId })
      return {
        success: true,
        status: response.data.status,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify payment',
      }
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(`/payments/${paymentId}/status`)
      return {
        success: true,
        status: response.data.status,
        paidAt: response.data.paidAt,
        transactionId: response.data.transactionId,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get payment status',
      }
    }
  }

  // Get payment history for user
  async getPaymentHistory() {
    try {
      const response = await axios.get('/payments/history')
      return {
        success: true,
        payments: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get payment history',
      }
    }
  }

  // Get payment by order ID
  async getPaymentByOrder(orderId) {
    try {
      const response = await axios.get(`/payments/order/${orderId}`)
      return {
        success: true,
        payment: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Payment not found',
      }
    }
  }

  // Refund payment
  async refundPayment(paymentId, reason) {
    try {
      const response = await axios.post(`/payments/${paymentId}/refund`, { reason })
      return {
        success: true,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to refund payment',
      }
    }
  }

  // Start payment verification polling
  startVerificationPolling(paymentId, transactionId, onComplete, interval = 5000, maxAttempts = 12) {
    let attempts = 0
    const pollInterval = setInterval(async () => {
      attempts++
      
      const result = await this.verifyPayment(paymentId, transactionId)
      
      if (result.status === 'completed') {
        clearInterval(pollInterval)
        onComplete(true, result)
      } else if (attempts >= maxAttempts || result.status === 'failed') {
        clearInterval(pollInterval)
        onComplete(false, result)
      }
    }, interval)
    
    return () => clearInterval(pollInterval)
  }

  // Format payment amount
  formatAmount(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Get payment method display name
  getPaymentMethodDisplay(method) {
    const methods = {
      KHQR: 'KHQR Payment',
      Cash: 'Cash on Delivery',
    }
    return methods[method] || method
  }

  // Get payment status display
  getPaymentStatusDisplay(status) {
    const statusMap = {
      pending: { text: 'Pending', color: 'warning', icon: '⏳' },
      processing: { text: 'Processing', color: 'info', icon: '🔄' },
      completed: { text: 'Completed', color: 'success', icon: '✅' },
      failed: { text: 'Failed', color: 'error', icon: '❌' },
      refunded: { text: 'Refunded', color: 'default', icon: '↩️' },
    }
    return statusMap[status] || { text: status, color: 'default', icon: '💳' }
  }

  // Validate payment amount
  validateAmount(amount, min = 0.01, max = 10000) {
    if (isNaN(amount)) return 'Invalid amount'
    if (amount < min) return `Minimum amount is ${this.formatAmount(min)}`
    if (amount > max) return `Maximum amount is ${this.formatAmount(max)}`
    return null
  }

  // Get available payment methods
  getAvailablePaymentMethods() {
    return [
      {
        id: 'KHQR',
        name: 'KHQR Payment',
        description: 'Pay using KHQR via any banking app',
        icon: '📱',
        enabled: true,
      },
      {
        id: 'Cash',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        icon: '💵',
        enabled: true,
      },
    ]
  }
}

export default new PaymentService()