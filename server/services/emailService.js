const nodemailer = require('nodemailer')

let transporter = null

const initEmailService = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email service not configured - skipping initialization')
    return false
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
    console.log('Email service initialized')
    return true
  } catch (error) {
    console.error('Email service initialization failed:', error.message)
    return false
  }
}

const sendEmail = async (to, subject, html, text = null) => {
  if (!transporter) {
    console.log('Email service not initialized - email not sent')
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"FoodOrder" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
    })
    console.log('Email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send email:', error.message)
    return false
  }
}

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to FoodOrder!</h1>
      </div>
      <div style="padding: 30px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 16px; color: #374151;">Thank you for joining FoodOrder! We're excited to have you on board.</p>
        <p style="font-size: 16px; color: #374151;">Start exploring our delicious menu and get 10% off your first order with code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; font-size: 20px; font-weight: bold; letter-spacing: 2px;">WELCOME10</span>
        </div>
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/menu" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Start Ordering</a>
        <hr style="margin: 30px 0; border-color: #e5e7eb;">
        <p style="font-size: 14px; color: #6b7280; text-align: center;">If you have any questions, contact us at support@foodorder.com</p>
      </div>
    </div>
  `

  return sendEmail(user.email, 'Welcome to FoodOrder!', html)
}

const sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Order Confirmation</h1>
      </div>
      <div style="padding: 30px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 16px; color: #374151;">Thank you for your order! Your order has been confirmed.</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8)}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${order.totalPrice.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>

        <h3>Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: right;">
          <strong>Total: $${order.totalPrice.toFixed(2)}</strong>
        </div>

        <a href="${process.env.APP_URL || 'http://localhost:3000'}/orders/${order._id}" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px;">Track Your Order</a>
      </div>
    </div>
  `

  return sendEmail(user.email, `Order Confirmation #${order._id.toString().slice(-8)}`, html)
}

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Reset Your Password</h1>
      </div>
      <div style="padding: 30px; background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151;">Hello <strong>${user.name}</strong>,</p>
        <p style="font-size: 16px; color: #374151;">We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">Reset Password</a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email. This link will expire in 1 hour.</p>
        
        <hr style="margin: 30px 0; border-color: #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">If the button doesn't work, copy and paste this URL: ${resetUrl}</p>
      </div>
    </div>
  `

  return sendEmail(user.email, 'Reset Your Password', html)
}

module.exports = {
  initEmailService,
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
}