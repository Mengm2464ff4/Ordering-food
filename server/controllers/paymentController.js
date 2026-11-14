const Payment = require('../models/Payment')
const Order = require('../models/Order')
const { sendPaymentNotification } = require('../config/telegram')
const { khqrService } = require('../services/khqrService')
const asyncHandler = require('express-async-handler')

// @desc    Create KHQR payment
// @route   POST /api/payments/khqr
// @access  Private
const createKHQRPayment = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body

  const order = await Order.findById(orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({ order: orderId, status: 'pending' })
  if (existingPayment) {
    return res.json({
      paymentId: existingPayment._id,
      qrCode: existingPayment.khqrData?.qrCode,
      qrData: existingPayment.khqrData?.qrData,
      qrString: existingPayment.khqrData?.qrData,
      md5: existingPayment.khqrData?.md5,
      transactionId: existingPayment.khqrData?.transactionId,
      amount: existingPayment.amount,
      currency: existingPayment.khqrData?.currency || 'USD',
      amountLabel: existingPayment.khqrData?.amountLabel,
      status: existingPayment.status,
    })
  }

  // Generate KHQR code (Bakong EMV standard — scannable by ABA, ACLEDA, etc.)
  let khqrData
  try {
    khqrData = await khqrService.generateQR({
      amount: amount,
      orderId: orderId,
      description: `Order ${String(orderId).slice(-8)}`,
    })
  } catch (error) {
    res.status(400)
    throw new Error(error.message || 'Failed to generate KHQR payment code')
  }

  const payment = await Payment.create({
    order: orderId,
    user: req.user._id,
    amount: amount,
    method: 'KHQR',
    khqrData: khqrData,
    status: 'pending',
  })

  res.json({
    paymentId: payment._id,
    qrCode: khqrData.qrCode,
    qrData: khqrData.qrData,
    qrString: khqrData.qrData,
    md5: khqrData.md5,
    transactionId: khqrData.transactionId,
    amount: payment.amount,
    currency: khqrData.currency,
    amountLabel: khqrData.amountLabel,
    status: payment.status,
  })
})

// @desc    Verify KHQR payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, transactionId } = req.body

  const payment = await Payment.findById(paymentId)
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found')
  }

 
  const md5Hash = payment.khqrData?.md5
  if (!md5Hash) {
    res.status(400)
    throw new Error('No MD5 hash found for this payment')
  }


  const verification = await khqrService.verifyPayment(
    transactionId || payment.khqrData?.transactionId,
    md5Hash
  )

  if (verification.status === 'completed') {
    payment.status = 'completed'
    payment.transactionId = verification.transactionId || transactionId
    payment.paidAt = Date.now()
    await payment.save()

    const order = await Order.findById(payment.order)
    order.isPaid = true
    order.paidAt = Date.now()
    await order.save()

    await sendPaymentNotification(payment)

    res.json({ status: 'success', message: 'Payment verified successfully', paid: true })
  } else if (verification.status === 'failed') {
    payment.status = 'failed'
    await payment.save()
    res.json({ status: 'failed', message: 'Payment verification failed', paid: false })
  } else {
    res.json({ status: 'pending', message: 'Payment pending', paid: false })
  }
})

// @desc    Get payment status
// @route   GET /api/payments/:id/status
// @access  Private
const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
  
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found')
  }

  if (payment.status === 'pending' && payment.khqrData?.md5) {
    const verification = await khqrService.verifyPayment(
      payment.khqrData.transactionId,
      payment.khqrData.md5
    )

    if (verification.status === 'completed') {
      payment.status = 'completed'
      payment.transactionId = verification.transactionId
      payment.paidAt = verification.paidAt || Date.now()
      await payment.save()

      const order = await Order.findById(payment.order)
      if (order) {
        order.isPaid = true
        order.paidAt = Date.now()
        await order.save()
      }

      await sendPaymentNotification(payment)
    }
  }

  res.json({
    status: payment.status,
    paidAt: payment.paidAt,
    transactionId: payment.transactionId,
  })
})

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const status = req.query.status
  const method = req.query.method

  let query = {}
  if (status && status !== 'all') query.status = status
  if (method && method !== 'all') query.method = method

  const count = await Payment.countDocuments(query)
  const payments = await Payment.find(query)
    .populate('user', 'name email')
    .populate('order')
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit)

  res.json({
    payments,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  })
})

// @desc    Get payment history for user
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('order')
    .sort('-createdAt')
  
  res.json(payments)
})

// @desc    Get payment by order ID
// @route   GET /api/payments/order/:orderId
// @access  Private
const getPaymentByOrder = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId })
  
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found for this order')
  }

  res.json(payment)
})

// @desc    Refund payment (Admin)
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
const refundPayment = asyncHandler(async (req, res) => {
  const { reason } = req.body
  const payment = await Payment.findById(req.params.id)

  if (!payment) {
    res.status(404)
    throw new Error('Payment not found')
  }

  if (payment.status !== 'completed') {
    res.status(400)
    throw new Error('Only completed payments can be refunded')
  }

  payment.status = 'refunded'
  await payment.save()

  res.json({ message: 'Payment refunded successfully', payment })
})

module.exports = {
  createKHQRPayment,
  verifyPayment,
  getPaymentStatus,
  getPayments,
  getPaymentHistory,
  getPaymentByOrder,
  refundPayment,
}