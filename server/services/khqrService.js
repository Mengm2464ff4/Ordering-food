const QRCode = require('qrcode')
const md5 = require('md5')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const { BakongKHQR, khqrData, IndividualInfo } = require('bakong-khqr')

class KHQRService {
  constructor() {
    this.bakongAccount = (
      process.env.KHQR_BAKONG_ACCOUNT ||
      process.env.KHQR_ACCOUNT_ID ||
      ''
    ).trim().toLowerCase()

    this.bakongApiToken = process.env.BAKONG_API_TOKEN || process.env.KHQR_API_KEY
    this.bakongApiUrl = (process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh').replace(/\/$/, '')
    this.merchantName = (process.env.KHQR_MERCHANT_NAME || 'FoodOrder').slice(0, 25)
    this.merchantCity = (process.env.KHQR_MERCHANT_CITY || 'Phnom Penh').slice(0, 15)
    this.currency = (process.env.KHQR_CURRENCY || 'USD').toUpperCase()
    this.qrExpiryMinutes = parseInt(process.env.KHQR_QR_EXPIRY_MINUTES || '15', 10)
  }

  isValidBakongAccount(account) {
    if (!account || typeof account !== 'string') return false
    const value = account.trim().toLowerCase()
    if (!value.includes('@')) return false
    if (value.includes('mock') || value.endsWith('@dev')) return false
    return /^[a-z0-9._-]+@[a-z0-9._-]+$/.test(value)
  }

  isConfigured() {
    return this.isValidBakongAccount(this.bakongAccount)
  }

  getCurrencyCode() {
    return this.currency === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd
  }

  formatAmount(amount) {
    const num = Number(amount)
    if (Number.isNaN(num) || num <= 0) {
      throw new Error('Invalid payment amount')
    }
    if (this.currency === 'KHR') {
      return Math.round(num)
    }
    return parseFloat(num.toFixed(2))
  }

  formatAmountLabel(amount) {
    const value = this.formatAmount(amount)
    return this.currency === 'KHR'
      ? `${value.toLocaleString()} ៛`
      : `$${value.toFixed(2)}`
  }

  buildKhqrString({ amount, orderId, description }) {
    const formattedAmount = this.formatAmount(amount)
    const orderRef = String(orderId).replace(/[^a-zA-Z0-9-]/g, '').slice(-25) || 'ORDER'

    const optionalData = {
      currency: this.getCurrencyCode(),
      amount: formattedAmount,
      billNumber: orderRef,
      purposeOfTransaction: (description || 'Food order').slice(0, 25),
      expirationTimestamp: Date.now() + this.qrExpiryMinutes * 60 * 1000,
      merchantCategoryCode: '5814',
    }

    const individualInfo = new IndividualInfo(
      this.bakongAccount,
      this.merchantName,
      this.merchantCity,
      optionalData
    )

    const khqr = new BakongKHQR()
    const response = khqr.generateIndividual(individualInfo)

    if (response.status?.code !== 0 || !response.data?.qr) {
      throw new Error(response.status?.message || 'Failed to generate KHQR code')
    }

    const qrString = response.data.qr
    const verified = BakongKHQR.verify(qrString)

    if (!verified.isValid) {
      throw new Error('Generated KHQR code is invalid')
    }

    return {
      qrString,
      md5: response.data.md5 || md5(qrString),
    }
  }

  async generateQR({ amount, orderId, description }) {
    if (!this.isConfigured()) {
      throw new Error(
        'KHQR is not configured. Add your real ABA Bakong ID to server .env as KHQR_BAKONG_ACCOUNT (example: yourname@aba). Open ABA Mobile → Profile to find your Bakong ID.'
      )
    }

    const { qrString, md5: qrMd5 } = this.buildKhqrString({ amount, orderId, description })

    const qrCode = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 360,
    })

    return {
      qrCode,
      qrData: qrString,
      md5: qrMd5,
      transactionId: uuidv4(),
      bakongAccount: this.bakongAccount,
      currency: this.currency,
      amount: this.formatAmount(amount),
      amountLabel: this.formatAmountLabel(amount),
      expiresAt: Date.now() + this.qrExpiryMinutes * 60 * 1000,
      payload: { orderId, description },
    }
  }

  hasBakongApi() {
    return Boolean(
      this.bakongApiToken &&
      !String(this.bakongApiToken).startsWith('mock')
    )
  }

  async checkTransactionByMd5(md5Hash) {
    const response = await axios.post(
      `${this.bakongApiUrl}/v1/check_transaction_by_md5`,
      { md5: md5Hash },
      {
        headers: {
          Authorization: `Bearer ${this.bakongApiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    )

    const body = response.data || {}
    if (body.responseCode === 0 && body.data) {
      return {
        completed: true,
        hash: body.data.hash,
        amount: body.data.amount,
        currency: body.data.currency,
        fromAccountId: body.data.fromAccountId,
        toAccountId: body.data.toAccountId,
        paidAt: body.data.createdDateMs || body.data.acknowledgedDateMs || Date.now(),
      }
    }

    return { completed: false, responseCode: body.responseCode, message: body.responseMessage }
  }

  async verifyPayment(transactionId, md5Hash) {
    if (md5Hash && this.hasBakongApi()) {
      try {
        const result = await this.checkTransactionByMd5(md5Hash)
        if (result.completed) {
          return {
            status: 'completed',
            transactionId: result.hash || transactionId,
            amount: result.amount,
            paidAt: new Date(Number(result.paidAt) || Date.now()),
          }
        }
        return { status: 'pending', transactionId }
      } catch (error) {
        console.error('Bakong payment check error:', error.response?.data || error.message)
        return { status: 'pending', transactionId, error: error.message }
      }
    }

    return { status: 'pending', transactionId }
  }

  async getTransactionStatus(transactionId) {
    return { status: 'pending', transactionId }
  }
}

const khqrService = new KHQRService()
module.exports = { khqrService }
