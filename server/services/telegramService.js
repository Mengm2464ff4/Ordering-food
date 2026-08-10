const TelegramBot = require('node-telegram-bot-api')

let bot = null
let isInitialized = false

const initTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === '') {
    console.log('Telegram bot token not configured - skipping initialization')
    return false
  }

  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
    isInitialized = true
    console.log('Telegram bot initialized successfully')
    return true
  } catch (error) {
    console.error('Telegram bot initialization failed:', error.message)
    return false
  }
}

const sendMessage = async (chatId, message, options = {}) => {
  if (!isInitialized || !bot) {
    console.log('Telegram bot not initialized - message not sent')
    return false
  }

  try {
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options,
    })
    return true
  } catch (error) {
    console.error('Failed to send Telegram message:', error.message)
    return false
  }
}

const sendOrderNotification = async (order) => {
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) {
    console.log('Telegram chat ID not configured')
    return false
  }

  const orderItems = order.orderItems.map(item => 
    `  • ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n')

  const message = `
🆕 <b>New Order Received!</b>

<b>Order ID:</b> <code>${order._id.toString().slice(-8)}</code>
<b>Customer:</b> ${order.user?.name || 'Guest'}
<b>Phone:</b> ${order.shippingAddress?.phone || 'N/A'}
<b>Total:</b> <b>$${order.totalPrice?.toFixed(2)}</b>
<b>Payment:</b> ${order.paymentMethod}

<b>Items:</b>
${orderItems}

<b>Delivery Address:</b>
${order.shippingAddress?.street}, ${order.shippingAddress?.city}

<a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/orders/${order._id}">🔍 View Order</a>
  `

  return sendMessage(chatId, message)
}

const sendPaymentNotification = async (payment) => {
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) return false

  const message = `
💰 <b>Payment Received!</b>

<b>Order ID:</b> <code>${payment.order?.toString().slice(-8) || 'N/A'}</code>
<b>Amount:</b> <b>$${payment.amount?.toFixed(2)}</b>
<b>Method:</b> ${payment.method}
<b>Transaction ID:</b> <code>${payment.transactionId || 'N/A'}</code>
<b>Status:</b> ${payment.status}

<a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/payments">🔍 View Payment</a>
  `

  return sendMessage(chatId, message)
}

const sendUserRegistrationNotification = async (user) => {
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) return false

  const message = `
👤 <b>New User Registered!</b>

<b>Name:</b> ${user.name}
<b>Email:</b> ${user.email}
<b>Phone:</b> ${user.phone || 'N/A'}
<b>Joined:</b> ${new Date(user.createdAt).toLocaleString()}

<a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/users/${user._id}">🔍 View User</a>
  `

  return sendMessage(chatId, message)
}

const sendLowStockAlert = async (food) => {
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!chatId) return false

  const message = `
⚠️ <b>Low Stock Alert!</b>

<b>Food:</b> ${food.name}
<b>Current Stock:</b> ${food.stock || 0} units remaining
<b>Category:</b> ${food.category}

Please restock soon to avoid running out!
  `

  return sendMessage(chatId, message)
}

module.exports = {
  initTelegramBot,
  sendMessage,
  sendOrderNotification,
  sendPaymentNotification,
  sendUserRegistrationNotification,
  sendLowStockAlert,
}