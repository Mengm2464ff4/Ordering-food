const mongoose = require('mongoose')
const axios = require('axios')
const crypto = require('crypto')
const Payment = require('../models/Payment')
const Order = require('../models/Order')
const { khqrService } = require('../services/khqrService')
const asyncHandler = require('express-async-handler')
const { BakongKHQR, khqrData, IndividualInfo } = require('bakong-khqr')

// Hash for check-transaction API: HMAC-SHA512 of sorted key=value pairs, base64
const createABAHash = (data, apiKey) => {
  const sortedKeys = Object.keys(data).sort()
  const str = sortedKeys.map((key) => `${key}=${data[key]}`).join('&')
  return crypto.createHmac('sha512', apiKey).update(str).digest('base64')
}

// Hash specifically for Purchase API (kept for future use)
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

  // ✅ Validate amount matches order total
  if (Number(amount) !== Number(order.totalPrice)) {
    res.status(400)
    throw new Error('Amount does not match order total')
  }

  const existingPayment = await Payment.findOne({ order: orderId, status: 'pending' })
  if (existingPayment) {
    return res.json({
      paymentId: existingPayment._id,
      qrData: existingPayment.khqrData?.qrData || existingPayment.khqrData?.qrString,
      md5: existingPayment.khqrData?.md5,
      amount: existingPayment.amount,
      status: existingPayment.status,
    })
  }

  let khqrDataRes
  try {
    khqrDataRes = await khqrService.generateQR({
      amount: amount,
      orderId: orderId,
      description: `Order ${String(orderId).slice(-8)}`,
    })
  } catch (error) {
    res.status(400)
    throw new Error(error.message || 'Failed to generate KHQR payment code')
  }

  // ✅ KHQR payments need a transactionId so verifyPayment can hash properly
  const tranId = `KHQR_${Date.now()}_${String(orderId).slice(-6)}`

  const payment = await Payment.create({
    order: orderId,
    user: order.user || req.user._id,
    amount: amount,
    method: 'KHQR',
    transactionId: tranId, // ✅ NEW
    khqrData: khqrDataRes,
    status: 'pending',
  })

  res.json({
    paymentId: payment._id,
    qrData: khqrDataRes.qrData,
    md5: khqrDataRes.md5,
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

    // ✅ Mock path — only in non-production
    if (
      process.env.NODE_ENV !== 'production' &&
      payment.transactionId?.startsWith('MOCK_')
    ) {
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

    if (!payment.transactionId) {
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
      if (status?.code === 0 || status === 0 || status?.code === '00') {
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

// ==================== ABA PAYWAY / BAKONG ====================
const createABAPayment = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body
  const order = await Order.findById(orderId)
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  // ✅ Validate amount matches order total
  if (Number(amount) !== Number(order.totalPrice)) {
    res.status(400)
    throw new Error('Amount does not match order total')
  }

  const bakongAccount = process.env.BAKONG_ACCOUNT || 'abaakhppxxx@abaa'
  const merchantName = process.env.BAKONG_MERCHANT_NAME || 'VUTHY VUTHA'
  const merchantCity = process.env.BAKONG_MERCHANT_CITY || 'Phnom Penh'

  const tranId = orderId.toString().slice(-10) + Date.now().toString().slice(-8)
  const formattedAmount = parseFloat(amount).toFixed(2)
  const expirationTimestamp = Date.now() + 15 * 60 * 1000

  try {
    const { BakongKHQR, khqrData, IndividualInfo } = require('bakong-khqr')

    const optionalData = {
      currency: khqrData.currency.usd,
      amount: formattedAmount,
      billNumber: tranId,
      expirationTimestamp: expirationTimestamp,
      storeLabel: process.env.PAYWAY_MERCHANT_ID || 'ec478717',
    }

    const individualInfo = new IndividualInfo(
      bakongAccount,
      merchantName,
      merchantCity,
      optionalData
    )
    const khqr = new BakongKHQR()
    const qrResponse = khqr.generateIndividual(individualInfo)

    if (!qrResponse || qrResponse.status?.code !== 0) {
      throw new Error('SDK failed to generate QR')
    }

    const qrString = qrResponse.data.qr

    // ✅ FIX: compute deepLink from qrString (was undefined before)
    const deepLink = `https://bakong.nbc.gov.kh/khqr?data=${encodeURIComponent(qrString)}`

    const payment = await Payment.create({
      order: orderId,
      user: order.user || req.user._id,
      amount: amount,
      method: 'ABA_PAYWAY',
      transactionId: tranId,
      // ✅ Unify shape so reads are consistent
      khqrData: { qrData: qrString, md5: qrResponse.data.md5 || null },
      status: 'pending',
    })

    return res.json({
      paymentId: payment._id,
      qrData: qrString,
      deepLink, // ✅ now defined
      transactionId: tranId,
      amount: payment.amount,
      status: payment.status,
    })
  } catch (error) {
    console.error('Bakong QR generation error:', error.message)
    res.status(500)
    throw new Error('Failed to generate Bakong QR code')
  }
})

const abaCallback = asyncHandler(async (req, res) => {
  const { tran_id, status, apv, hash } = req.body

  try {
    const payment = await Payment.findOne({ transactionId: tran_id })
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    // ✅ Verify callback hash (skip only if no hash provided in dev)
    const apiKey = process.env.PAYWAY_API_KEY
    if (apiKey && hash) {
      const payload = { ...req.body }
      delete payload.hash
      const expected = createABAHash(payload, apiKey)
      if (hash !== expected) {
        console.warn('ABA callback hash mismatch — possible spoofing attempt')
        return res.status(400).json({ message: 'Invalid signature' })
      }
    } else if (process.env.NODE_ENV === 'production' && !hash) {
      return res.status(400).json({ message: 'Missing signature' })
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
  // ✅ Add simple pagination
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const payments = await Payment.find({ user: req.user._id })
    .populate('order')
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit)
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

  // ⚠️ NOTE: This only updates the DB. To actually refund money you must call
  // the ABA PayWay refund API here. Otherwise your DB and bank are out of sync.

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