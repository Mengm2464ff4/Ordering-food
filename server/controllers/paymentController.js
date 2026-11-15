const mongoose = require('mongoose')
const axios = require('axios')
const crypto = require('crypto')
const Payment = require('../models/Payment')
const Order = require('../models/Order')
const { khqrService } = require('../services/khqrService')
const asyncHandler = require('express-async-handler')

// Hash for check-transaction API: concatenate merchant_id + tran_id
const createABAHash = (data, apiKey) => {
  const sortedKeys = Object.keys(data).sort()
  const str = sortedKeys.map(key => `${key}=${data[key]}`).join('&')
  return crypto.createHmac('sha512', apiKey).update(str).digest('base64')
}

// ✅ Hash specifically for Purchase API, concatenating in official field order
const createPurchaseHash = (data, apiKey) => {
  const b4hash =
    (data.req_time || '') +
    (data.merchant_id || '') +
    (data.tran_id || '') +
    (data.amount || '') +
    (data.items || '') +
    (data.shipping || '') +
    (data.firstname || '') +
    (data.lastname || '') +
    (data.email || '') +
    (data.phone || '') +
    (data.type || '') +
    (data.payment_option || '') +
    (data.return_url || '') +
    (data.cancel_url || '') +
    (data.continue_success_url || '') +
    (data.return_deeplink || '') +
    (data.currency || '') +
    (data.custom_fields || '') +
    (data.return_params || '') +
    (data.payout || '') +
    (data.lifetime || '') +
    (data.additional_params || '') +
    (data.google_pay_token || '') +
    (data.skip_success_page || '')

  return crypto.createHmac('sha512', apiKey).update(b4hash).digest('base64')
}

// ==================== KHQR PAYMENT ====================

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

const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { paymentId } = req.body
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid payment ID format' })
    }

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ status: 'error', message: 'Payment not found' })
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
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message })
  }
})

// ==================== ABA PAYWAY ====================

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
      khqrData: { qrData: mockQrData },
      status: 'pending',
    })
    return res.json({
      paymentId: payment._id,
      qrData: mockQrData,
      amount: payment.amount,
      status: payment.status,
    })
  }

  const tranId = orderId.toString().slice(-10) + Date.now().toString().slice(-8)

  const reqTime = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14)

  const merchantId = process.env.PAYWAY_MERCHANT_ID
  const apiKey = process.env.PAYWAY_API_KEY
  const baseUrl = process.env.PAYWAY_API_URL || 'https://checkout-sandbox.payway.com.kh'

  // ✅ return_url and cancel_url must be Base64-encoded before hashing and sending
  const returnUrlEncoded = Buffer.from(
    `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`
  ).toString('base64')
  const cancelUrlEncoded = Buffer.from(
    `${process.env.CLIENT_URL}/payment/cancel?orderId=${orderId}`
  ).toString('base64')

  const paymentData = {
    merchant_id: merchantId,
    tran_id: tranId,
    amount: parseFloat(amount).toFixed(2),
    currency: 'USD',
    req_time: reqTime,
    return_url: returnUrlEncoded,
    cancel_url: cancelUrlEncoded,
    continue_success_url: `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`,
    payment_option: 'abapay_khqr',
  }

  paymentData.hash = createPurchaseHash(paymentData, apiKey)

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

const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('order')
    .sort('-createdAt')
  res.json(payments)
})

const getPaymentByOrder = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId })
  if (!payment) {
    res.status(404)
    throw new Error('Payment not found for this order')
  }
  res.json(payment)
})

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