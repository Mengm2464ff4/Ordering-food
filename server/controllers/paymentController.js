const axios = require('axios')
const crypto = require('crypto')
const Payment = require('../models/Payment')
const Order = require('../models/Order')
const { khqrService } = require('../services/khqrService')
const asyncHandler = require('express-async-handler')


const createABAHash = (data, apiKey) => {
  const sortedKeys = Object.keys(data).sort()
  const str = sortedKeys.map(key => `${key}=${data[key]}`).join('&')
  return crypto.createHmac('sha512', apiKey).update(str).digest('base64')
}

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

  if (payment.transactionId?.startsWith('MOCK_')) {
    payment.status = 'completed'
    payment.paidAt = Date.now()
    await payment.save()

    const order = await Order.findById(payment.order)
    if (order) {
      order.isPaid = true
      order.paidAt = Date.now()
      await order.save()
    }

    return res.json({ status: 'success', paid: true })
  }

  const merchantId = process.env.PAYWAY_MERCHANT_ID
  const apiKey = process.env.PAYWAY_API_KEY
  const baseUrl = process.env.PAYWAY_API_URL || 'https://checkout-sandbox.payway.com.kh'

  if (!merchantId || !apiKey) {
    return res.json({ status: 'pending', paid: false })
  }

  const statusData = {
    merchant_id: merchantId,
    tran_id: payment.transactionId,
  }

  statusData.hash = createABAHash(statusData, apiKey)

  try {
    const response = await axios.post(
      `${baseUrl}/api/payment-gateway/v1/payments/check-transaction`,
      statusData
    )

    const { status } = response.data

    if (status?.code === 0 || status === 0) {
      payment.status = 'completed'
      payment.paidAt = Date.now()
      await payment.save()

      const order = await Order.findById(payment.order)
      if (order) {
        order.isPaid = true
        order.paidAt = Date.now()
        await order.save()
      }

      return res.json({ status: 'success', paid: true })
    }

    return res.json({ status: 'pending', paid: false })
  } catch (error) {
    console.error('ABA verify error:', error.response?.data || error.message)
    return res.json({ status: 'pending', paid: false })
  }
})

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

  if (!process.env.PAYWAY_MERCHANT_ID || !process.env.PAYWAY_API_KEY) {
    const mockQrData = `MOCK_ABA_PAYMENT|Order:${orderId}|Amount:${amount}|Time:${Date.now()}`
    
    const payment = await Payment.create({
      order: orderId,
      user: req.user._id,
      amount: amount,
      method: 'ABA_PAYWAY',
      transactionId: `MOCK_${Date.now()}`,
      khqrData: {
        qrData: mockQrData,
      },
      status: 'pending',
    })

    return res.json({
      paymentId: payment._id,
      qrData: mockQrData,
      amount: payment.amount,
      status: payment.status,
    })
  }

  const tranId = `ORDER_${orderId}_${Date.now()}`
  const merchantId = process.env.PAYWAY_MERCHANT_ID
  const apiKey = process.env.PAYWAY_API_KEY
  const baseUrl = process.env.PAYWAY_API_URL || 'https://checkout-sandbox.payway.com.kh'

  const paymentData = {
    merchant_id: merchantId,
    tran_id: tranId,
    amount: parseFloat(amount).toFixed(2),
    currency: 'USD',
    req_time: new Date().toISOString(),
    return_url: `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel?orderId=${orderId}`,
    continue_success_url: `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`,
    payment_option: 'abapay_khqr',
  }

  paymentData.hash = createABAHash(paymentData, apiKey)

  try {
    const response = await axios.post(
      `${baseUrl}/api/payment-gateway/v1/payments/purchase`,
      paymentData
    )

    const { checkout_url, qr_string, qr_image, status } = response.data

    if (status?.code === 0 || checkout_url || qr_string) {
      const payment = await Payment.create({
        order: orderId,
        user: req.user._id,
        amount: amount,
        method: 'ABA_PAYWAY',
        transactionId: tranId,
        khqrData: {
          qrString: qr_string,
          qrImage: qr_image,
          checkoutUrl: checkout_url,
        },
        status: 'pending',
      })

      return res.json({
        paymentId: payment._id,
        qrData: qr_string || qr_image,
        qrImage: qr_image,
        checkoutUrl: checkout_url,
        transactionId: tranId,
        amount: payment.amount,
        status: payment.status,
      })
    }

    res.status(400)
    throw new Error('Failed to create ABA payment')
  } catch (error) {
    console.error('ABA PayWay error:', error.response?.data || error.message)
    res.status(500)
    throw new Error(error.response?.data?.status?.message || 'Failed to create QR code')
  }
})

// @desc    ABA PayWay Callback (Webhook)
// @route   POST /api/payments/aba-callback
// @access  Public
const abaCallback = asyncHandler(async (req, res) => {
  const { tran_id, status, apv } = req.body

  try {
    const payment = await Payment.findOne({ transactionId: tran_id })

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    if (status === '0' || status === 0) {
      payment.status = 'completed'
      payment.transactionId = apv || tran_id
      payment.paidAt = Date.now()
      await payment.save()

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