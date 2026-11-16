const mongoose = require('mongoose')
const axios = require('axios')
const crypto = require('crypto')
const Payment = require('../models/Payment')
const Order = require('../models/Order')
const { khqrService } = require('../services/khqrService')
const asyncHandler = require('express-async-handler')

// Hash for check-transaction API
const createABAHash = (data, apiKey) => {
  const sortedKeys = Object.keys(data).sort()
  const str = sortedKeys.map(key => `${key}=${data[key]}`).join('&')
  return crypto.createHmac('sha512', apiKey).update(str).digest('base64')
}

// Hash specifically for Purchase API
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

  const payment = await Payment.create({
    order: orderId,
    user: req.user._id,
    amount: amount,
    method: 'KHQR',
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
      if (status?.code === 0 || status === 0 || status?.code === "00") {
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

// ==================== ABA PAYWAY OFFICIAL API ====================
const createABAPayment = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body
  const order = await Order.findById(orderId)
  if (!order) { 
    res.status(404)
    throw new Error('Order not found') 
  }

  const merchantId = process.env.PAYWAY_MERCHANT_ID
  const apiKey = process.env.PAYWAY_API_KEY
  const baseUrl = process.env.PAYWAY_API_URL || 'https://checkout.payway.com.kh'

  const tranId = orderId.toString().slice(-10) + Date.now().toString().slice(-8)
  
  const now = new Date()
  const reqTime = now.getUTCFullYear().toString() +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    String(now.getUTCDate()).padStart(2, '0') +
    String(now.getUTCHours()).padStart(2, '0') +
    String(now.getUTCMinutes()).padStart(2, '0') +
    String(now.getUTCSeconds()).padStart(2, '0')

  const returnUrlEncoded = Buffer.from(`${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`).toString('base64')
  const cancelUrlEncoded = Buffer.from(`${process.env.CLIENT_URL}/payment/cancel?orderId=${orderId}`).toString('base64')

  const paymentData = {
    merchant_id: merchantId,
    tran_id: tranId,
    amount: parseFloat(amount).toFixed(2),
    currency: 'USD',
    req_time: reqTime,
    type: 'purchase',
    return_url: returnUrlEncoded,
    cancel_url: cancelUrlEncoded,
    continue_success_url: `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`,
    payment_option: 'abapay_khqr',
  }

  paymentData.hash = createPurchaseHash(paymentData, apiKey)

  try {
    // ✅ MUST send as Form URL Encoded
    const formData = new URLSearchParams()
    for (const key in paymentData) {
      formData.append(key, paymentData[key])
    }

    const response = await axios.post(
      `${baseUrl}/api/payment-gateway/v1/payments/purchase`,
      formData.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    console.log('👉 PAYWAY RESPONSE:', response.data)

    const qrString = response.data.qrString
    const checkoutUrl = response.data.checkout_url

    if (!qrString && !checkoutUrl) {
      throw new Error('No QR code or Checkout URL returned from ABA')
    }

    const payment = await Payment.create({
      order: orderId,
      user: req.user._id,
      amount: amount,
      method: 'ABA_PAYWAY',
      transactionId: tranId,
      khqrData: { qrString: qrString, checkoutUrl: checkoutUrl },
      status: 'pending',
    })

    return res.json({
      paymentId: payment._id,
      qrData: qrString || checkoutUrl, // If no QR, frontend redirects to URL
      checkoutUrl: checkoutUrl,
      transactionId: tranId,
      amount: payment.amount,
      status: payment.status,
    })

  } catch (error) {
    console.error('ABA PayWay API Error:', error.response?.data || error.message)
    res.status(500)
    throw new Error(error.response?.data?.status?.message || 'Failed to create ABA payment')
  }
})

const abaCallback = asyncHandler(async (req, res) => {
  // ... (keep your existing callback logic)
  const { tran_id, status, apv } = req.body
  try {
    const payment = await Payment.findOne({ transactionId: tran_id })
    if (!payment) return res.status(404).json({ message: 'Payment not found' })

    if (status === '0' || status === 0) {
      payment.status = 'completed'
      payment.transactionId = apv || tran_id
      payment.paidAt = Date.now()
      await payment.save()
      const order = await Order.findById(payment.order)
      if (order) { order.isPaid = true; order.paidAt = Date.now(); await order.save() }
    } else {
      payment.status = 'failed'
      await payment.save()
    }
    res.status(200).json({ message: 'Callback received' })
  } catch (error) {
    res.status(500).json({ message: 'Callback processing failed' })
  }
})

const getPaymentStatus = asyncHandler(async (req, res) => { /* keep existing */ })
const getPayments = asyncHandler(async (req, res) => { /* keep existing */ })
const getPaymentHistory = asyncHandler(async (req, res) => { /* keep existing */ })
const getPaymentByOrder = asyncHandler(async (req, res) => { /* keep existing */ })
const refundPayment = asyncHandler(async (req, res) => { /* keep existing */ })

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