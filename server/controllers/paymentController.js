const axios = require('axios')
const crypto = require('crypto')
const Payment = require('../models/Payment')
const Order = require('../models/Order')
const { khqrService } = require('../services/khqrService')
const asyncHandler = require('express-async-handler')

// ==================== KHQR PAYMENT ====================

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
      qrData: existingPayment.khqrData?.qrData,
      md5: existingPayment.khqrData?.md5,
      amount: existingPayment.amount,
      status: existingPayment.status,
    })
  }

  // Generate KHQR code
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
    qrData: khqrData.qrData,
    md5: khqrData.md5,
    amount: payment.amount,
    status: payment.status,
  })
})

// @desc    Verify KHQR payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.body

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
    payment.khqrData?.transactionId,
    md5Hash
  )

  if (verification.status === 'completed') {
    payment.status = 'completed'
    payment.transactionId = verification.transactionId
    payment.paidAt = Date.now()
    await payment.save()

    const order = await Order.findById(payment.order)
    order.isPaid = true
    order.paidAt = Date.now()
    await order.save()

    res.json({ status: 'success', message: 'Payment verified successfully', paid: true })
  } else {
    res.json({ status: 'pending', message: 'Payment pending', paid: false })
  }
})

// ==================== ABA PAYWAY PAYMENT ====================

const createABAHash = (data, apiKey) => {
  // តម្រៀប Key តាមអក្សរ
  const sortedKeys = Object.keys(data).sort()
  // បង្កើត String សម្រាប់ Hash
  const str = sortedKeys.map(key => `${key}=${data[key]}`).join('&')
  // បង្កើត HMAC SHA512
  return crypto.createHmac('sha512', apiKey).update(str).digest('base64')
}

// @desc    Create ABA PayWay Payment
// @route   POST /api/payments/aba-payway
// @access  Private
const createABAPayment = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body

  const order = await Order.findById(orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  const tranId = `ORDER_${orderId}_${Date.now()}`

  const paymentData = {
    merchant_id: process.env.ABA_MERCHANT_ID,
    tran_id: tranId,
    amount: parseFloat(amount).toFixed(2),
    currency: 'USD',
    req_time: new Date().toISOString(),
    return_url: `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel?orderId=${orderId}`,
    continue_success_url: `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`,
    payment_option: 'abapay',
  }

  // បន្ថែម Hash
  paymentData.hash = createABAHash(paymentData, process.env.ABA_API_KEY)

  try {
    // ហៅ API ទៅ ABA PayWay
    const response = await axios.post(
      'https://checkout.payway.com.kh/api/payment-gateway/v1/payments/purchase',
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const { checkout_url, status } = response.data

    if (status?.code === 0 || checkout_url) {
      // រក្សាទុក Payment ក្នុង Database
      await Payment.create({
        order: orderId,
        user: req.user._id,
        amount: amount,
        method: 'ABA_PAYWAY',
        transactionId: tranId,
        status: 'pending',
      })

      res.json({
        success: true,
        checkoutUrl: checkout_url,
        transactionId: tranId,
      })
    } else {
      res.status(400)
      throw new Error(response.data.status?.message || 'ABA PayWay error')
    }
  } catch (error) {
    console.error('ABA Payment error:', error.response?.data || error.message)
    res.status(500)
    throw new Error(error.response?.data?.status?.message || 'Failed to create ABA payment')
  }
})

// @desc    ABA PayWay Callback (Webhook)
// @route   POST /api/payments/aba-callback
// @access  Public
const abaCallback = asyncHandler(async (req, res) => {
  const { tran_id, status, apv, amount } = req.body

  try {
    const payment = await Payment.findOne({ transactionId: tran_id })

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    if (status === '0' || status === 0) {
      // ការទូទាត់ជោគជ័យ
      payment.status = 'completed'
      payment.transactionId = apv || tran_id
      payment.paidAt = Date.now()
      await payment.save()

      // Update Order
      const order = await Order.findById(payment.order)
      if (order) {
        order.isPaid = true
        order.paidAt = Date.now()
        await order.save()
      }
    } else {
      payment.status = 'failed'
      await payment.save()
    }

    res.status(200).json({ message: 'Callback received' })
  } catch (error) {
    console.error('ABA Callback error:', error)
    res.status(500).json({ message: 'Callback processing failed' })
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

  let query = {}
  if (status && status !== 'all') query.status = status

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
  payment.refundReason = reason
  payment.refundedAt = Date.now()
  await payment.save()

  res.json({ message: 'Payment refunded successfully', payment })
})

module.exports = {
  createKHQRPayment,
  verifyPayment,
  createABAPayment, 
  abaCallback,      
  getPaymentStatus,
  getPayments,
  getPaymentHistory,
  getPaymentByOrder,
  refundPayment,
}