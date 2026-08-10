import axios from 'axios'

class TelegramService {
  constructor() {
    this.botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
    this.chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`
  }

  async initTelegramBot() {
    if (!this.botToken || !this.chatId) {
      console.warn('Telegram credentials not configured')
      return false
    }

    try {
      const response = await axios.get(`${this.baseUrl}/getMe`)
      console.log('Telegram bot initialized:', response.data.result.username)
      return true
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error)
      return false
    }
  }

  async sendMessage(message) {
    if (!this.botToken || !this.chatId) return false

    try {
      await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
      })
      return true
    } catch (error) {
      console.error('Failed to send Telegram message:', error)
      return false
    }
  }

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  formatAddress(address = {}) {
    return [
      address.street,
      address.district,
      address.city,
      address.commune,
    ].filter(Boolean).join(', ') || 'N/A'
  }

  async sendUserRegistrationNotification(user) {
    const safeName = this.escapeHtml(user?.name || 'New User')
    const safeEmail = this.escapeHtml(user?.email || 'N/A')
    const safePhone = this.escapeHtml(user?.phone || 'N/A')
    const safeAddress = this.escapeHtml(this.formatAddress(user?.address || {}))

    const message = `
👤 <b>New User Registered</b>

<b>Name:</b> ${safeName}
<b>Email:</b> ${safeEmail}
<b>Phone:</b> ${safePhone}
<b>Address:</b> ${safeAddress}
<b>Role:</b> ${this.escapeHtml(user?.role || 'user')}
<b>User ID:</b> ${this.escapeHtml(user?._id || 'N/A')}
<b>Time:</b> ${this.escapeHtml(new Date().toLocaleString())}
    `

    return this.sendMessage(message)
  }

  async sendUserProfileUpdateNotification(user) {
    const safeName = this.escapeHtml(user?.name || 'User')
    const safeEmail = this.escapeHtml(user?.email || 'N/A')
    const safePhone = this.escapeHtml(user?.phone || 'N/A')
    const safeAddress = this.escapeHtml(this.formatAddress(user?.address || {}))

    const message = `
📝 <b>User Profile Updated</b>

<b>Name:</b> ${safeName}
<b>Email:</b> ${safeEmail}
<b>Phone:</b> ${safePhone}
<b>Address:</b> ${safeAddress}
<b>User ID:</b> ${this.escapeHtml(user?._id || 'N/A')}
<b>Time:</b> ${this.escapeHtml(new Date().toLocaleString())}
    `

    return this.sendMessage(message)
  }

  async sendOrderNotification(order) {
    const customerName = this.escapeHtml(order.user?.name || order.shippingAddress?.name || 'Customer')
    const customerEmail = this.escapeHtml(order.user?.email || 'N/A')
    const customerPhone = this.escapeHtml(order.shippingAddress?.phone || 'N/A')
    const address = this.escapeHtml(this.formatAddress(order.shippingAddress || {}))
    const orderId = this.escapeHtml(order?._id || '')
    const orderShortId = this.escapeHtml((order?._id || '').slice(-8))
    const totalPrice = this.escapeHtml(Number(order?.totalPrice || 0).toFixed(2))
    const paymentMethod = this.escapeHtml(order?.paymentMethod || 'N/A')
    const safeItems = (order?.orderItems || [])
      .map((item) => {
        const itemName = this.escapeHtml(item?.name || 'Item')
        const qty = Number(item?.quantity || 0)
        const price = Number(item?.price || 0)
        return `  • ${itemName} x${qty} - $${(qty * price).toFixed(2)}`
      })
      .join('\n')

    const message = `
🆕 <b>New Order Received!</b>

<b>Order ID:</b> ${orderShortId}
<b>Customer:</b> ${customerName}
<b>Email:</b> ${customerEmail}
<b>Phone:</b> ${customerPhone}
<b>Address:</b> ${address}
<b>Total:</b> $${totalPrice}
<b>Payment:</b> ${paymentMethod}

<b>Items:</b>
${safeItems || '  • N/A'}

<a href="${window.location.origin}/admin/orders/${orderId}">View Order →</a>
    `
    
    return this.sendMessage(message)
  }

  async sendPaymentNotification(payment) {
    const message = `
💰 <b>Payment Received!</b>

<b>Order ID:</b> ${payment.order?.slice(-8)}
<b>Amount:</b> $${payment.amount}
<b>Method:</b> ${payment.method}
<b>Transaction ID:</b> ${payment.transactionId || 'N/A'}

<a href="${window.location.origin}/admin/payments">View Payment →</a>
    `
    
    return this.sendMessage(message)
  }
}

export const telegramService = new TelegramService()
export const initTelegramBot = () => telegramService.initTelegramBot()
export const sendTelegramMessage = (message) => telegramService.sendMessage(message)
export const sendOrderNotification = (order) => telegramService.sendOrderNotification(order)
export const sendPaymentNotification = (payment) => telegramService.sendPaymentNotification(payment)
export const sendUserRegistrationNotification = (user) => telegramService.sendUserRegistrationNotification(user)
export const sendUserProfileUpdateNotification = (user) => telegramService.sendUserProfileUpdateNotification(user)