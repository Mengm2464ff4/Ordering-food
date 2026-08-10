const TelegramBot = require('node-telegram-bot-api')

let bot = null

const initTelegramBot = () => {
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== '') {
    try {
      bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
      console.log('Telegram bot initialized')
      return true
    } catch (error) {
      console.error('Telegram bot initialization failed:', error.message)
      return false
    }
  }
  console.log('Telegram bot not configured - skipping')
  return false
}

// const sendTelegramMessage = async (message, options = {}) => {
//   try {
//     if (bot && process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID !== '') {
//       await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
//         parse_mode: 'HTML',
//         ...options,
//       })
//       return true
//     }
//     return false
//   } catch (error) {
//     console.error('Telegram message error:', error.message)
//     return false
//   }
// }
const sendTelegramMessage = async (message, options = {}) => {
  try {
    // Check configuration
    if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === '') {
      console.log('❌ Telegram bot token not configured')
      return false
    }
    
    if (!process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID === '') {
      console.log('❌ Telegram chat ID not configured')
      return false
    }
    
    if (!bot) {
      console.log('❌ Telegram bot not initialized')
      return false
    }
    
    console.log('📤 Sending Telegram message...')
    console.log('Chat ID:', process.env.TELEGRAM_CHAT_ID)
    console.log('Message preview:', message.substring(0, 100) + '...')
    
    const result = await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
      parse_mode: 'HTML',
      ...options,
    })
    
    console.log('✅ Telegram message sent successfully!')
    return true
  } catch (error) {
    console.error('❌ Telegram message error:')
    console.error('  Code:', error.code)
    console.error('  Response:', error.response?.body)
    console.error('  Message:', error.message)
    
    // Specific error handling
    if (error.message.includes('initiate conversation')) {
      console.error('  → Solution: Send a message to your bot on Telegram first!')
    } else if (error.message.includes('Unauthorized')) {
      console.error('  → Solution: Your bot token is invalid. Generate a new one from @BotFather')
    } else if (error.message.includes('chat not found')) {
      console.error('  → Solution: Your chat ID is incorrect. Use getUpdates to find your real chat ID')
    }
    
    return false
  }
}
const sendOrderNotification = async (order) => {
  const message = `
🆕 <b>New Order Received!</b>

<b>Order ID:</b> ${order._id.toString().slice(-8)}
<b>Customer:</b> ${order.user?.name || 'Guest'}
<b>Total:</b> $${order.totalPrice?.toFixed(2)}
<b>Payment:</b> ${order.paymentMethod}

<b>Items:</b>
${order.orderItems.map(item => `  • ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

<a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/orders/${order._id}">View Order →</a>
  `
  
  return sendTelegramMessage(message)
}

const sendPaymentNotification = async (payment) => {
  const message = `
💰 <b>Payment Received!</b>

<b>Order ID:</b> ${payment.order?.toString().slice(-8) || 'N/A'}
<b>Amount:</b> $${payment.amount?.toFixed(2)}
<b>Method:</b> ${payment.method}
<b>Transaction ID:</b> ${payment.transactionId || 'N/A'}
<b>Status:</b> ${payment.status}

<a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/payments">View Payment →</a>
  `
  
  return sendTelegramMessage(message)
}

// const sendUserRegistrationNotification = async (user) => {
//   const message = `
// 👤 <b>New User Registered!</b>

// <b>Name:</b> ${user.name || 'N/A'}
// <b>Email:</b> ${user.email || 'N/A'}
// <b>Phone:</b> ${user.phone || 'N/A'}
// <b>Address:</b> ${user.address?.street || ''} ${user.address?.district || ''} ${user.address?.city || ''} ${user.address?.commune || ''}
// <b>Role:</b> ${user.role || 'user'}
// <b>User ID:</b> ${user._id?.toString() || 'N/A'}

// <a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/users">View Users →</a>
//   `

//   return sendTelegramMessage(message)
// }
// Add this to sendUserRegistrationNotification function
// const sendUserRegistrationNotification = async (user) => {
//   console.log('📢 Sending Telegram notification for new user:', user.email)
//   console.log('Bot initialized:', bot !== null)
  
//   const message = `
// 👤 <b>New User Registered!</b>

// <b>Name:</b> ${user.name || 'N/A'}
// <b>Email:</b> ${user.email || 'N/A'}
// <b>Phone:</b> ${user.phone || 'N/A'}
// <b>Role:</b> ${user.role || 'user'}

// <a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/users">View Users →</a>
//   `

//   const result = await sendTelegramMessage(message)
//   console.log('Telegram send result:', result)
//   return result
// }
const sendUserRegistrationNotification = async (user) => {
  // Get user ID
  const userId = user._id || user.id || 'N/A'
  const userIdDisplay = userId !== 'N/A' ? userId.toString() : 'N/A'
  
  // Format address properly
  let addressDisplay = 'N/A'
  if (user.address) {
    if (typeof user.address === 'object') {
      const parts = []
      if (user.address.street) parts.push(user.address.street)
      if (user.address.commune) parts.push(user.address.commune)
      if (user.address.district) parts.push(user.address.district)
      if (user.address.city) parts.push(user.address.city)
      addressDisplay = parts.join(', ') || 'N/A'
    } else if (typeof user.address === 'string') {
      addressDisplay = user.address || 'N/A'
    }
  }
  
  const message = `
👤 <b>New User Registered!</b>

<b>🆔 User ID:</b> ${userIdDisplay}
<b>👤 Name:</b> ${user.name || 'N/A'}
<b>📧 Email:</b> ${user.email || 'N/A'}
<b>📱 Phone:</b> ${user.phone || 'N/A'}
<b>📍 Address:</b> ${addressDisplay}
<b>👑 Role:</b> ${user.role || 'user'}
<b>📅 Registered:</b> ${new Date().toLocaleString()}

<a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/users">👥 View All Users</a>
  `
  
  return sendTelegramMessage(message)
}
const sendUserNotification = async (userId, message) => {
  // You can implement user-specific notifications here
  console.log(`Notification for user ${userId}: ${message}`)
  return sendTelegramMessage(`👤 <b>User Notification</b>\n\nUser: ${userId}\nMessage: ${message}`)
}

module.exports = { 
  initTelegramBot, 
  sendTelegramMessage, 
  sendOrderNotification, 
  sendPaymentNotification,
  sendUserRegistrationNotification,
  sendUserNotification 
}