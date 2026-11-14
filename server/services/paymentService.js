const Payment = require('../models/Payment')
const Order = require('../models/Order')
const { khqrService } = require('./khqrService')

class PaymentService {
  async processKHQRPayment(orderId, userId, amount) {
    try {
      // Generate KHQR payment
      const khqrData = await khqrService.generateQR({
        amount: amount,
        orderId: orderId,
        description: `Payment for order #${orderId}`,
      })

      // Create payment record
      const payment = await Payment.create({
        order: orderId,
        user: userId,
        amount: amount,
        method: 'KHQR',
        khqrData: khqrData,
        status: 'pending',
      })

      return {
        success: true,
        paymentId: payment._id,
        qrCode: khqrData.qrCode,
        transactionId: khqrData.transactionId,
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

async verifyKHQRPayment(paymentId, transactionId) {
  try {
    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return { success: false, error: 'Payment not found' }
    }

    
    const md5Hash = payment.khqrData?.md5
    if (!md5Hash) {
      return { success: false, error: 'No MD5 hash found for this payment' }
    }

  
    const verification = await khqrService.verifyPayment(transactionId, md5Hash)

    if (verification.status === 'completed') {
      payment.status = 'completed'
      payment.transactionId = verification.transactionId || transactionId
      payment.paidAt = verification.paidAt || Date.now()
      await payment.save()

      await Order.findByIdAndUpdate(payment.order, {
        isPaid: true,
        paidAt: Date.now(),
      })

      return { success: true, status: 'completed' }
    } else if (verification.status === 'failed') {
      payment.status = 'failed'
      await payment.save()
      return { success: false, status: 'failed' }
    }

    return { success: false, status: 'pending' }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { success: false, error: error.message }
  }
}

  async getPaymentStatus(paymentId) {
    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return null
    }
    return {
      status: payment.status,
      paidAt: payment.paidAt,
      transactionId: payment.transactionId,
    }
  }

  async refundPayment(paymentId, reason) {
    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return { success: false, error: 'Payment not found' }
    }

    if (payment.status !== 'completed') {
      return { success: false, error: 'Only completed payments can be refunded' }
    }

    payment.status = 'refunded'
    payment.refundReason = reason
    payment.refundedAt = Date.now()
    await payment.save()

    // Update order
    await Order.findByIdAndUpdate(payment.order, {
      status: 'cancelled',
    })

    return { success: true, message: 'Payment refunded successfully' }
  }

  async getUserPaymentHistory(userId) {
    return await Payment.find({ user: userId })
      .populate('order')
      .sort('-createdAt')
  }

  async getOrderPayment(orderId) {
    return await Payment.findOne({ order: orderId })
  }
}

module.exports = new PaymentService()