const Notification = require('../models/Notification')

class NotificationService {
  async createNotification(userId, type, title, message, data = null, priority = 'medium') {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      priority,
    })
    return notification
  }

  async getUserNotifications(userId, limit = 50, offset = 0) {
    const notifications = await Notification.find({ user: userId })
      .sort('-createdAt')
      .skip(offset)
      .limit(limit)

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    })

    return {
      notifications,
      unreadCount,
      total: await Notification.countDocuments({ user: userId }),
    }
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, user: userId })
    if (notification && !notification.isRead) {
      await notification.markAsRead()
      return true
    }
    return false
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: Date.now() }
    )
    return true
  }

  async deleteNotification(notificationId, userId) {
    const result = await Notification.findOneAndDelete({ _id: notificationId, user: userId })
    return !!result
  }

  async deleteOldNotifications(days = 30) {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() - days)
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: expiryDate },
      isRead: true,
    })
    
    return result.deletedCount
  }

  // Order notifications
  async notifyOrderCreated(order) {
    return this.createNotification(
      order.user,
      'order',
      'Order Created',
      `Your order #${order._id.toString().slice(-8)} has been created successfully.`,
      { orderId: order._id, status: order.status },
      'high'
    )
  }

  async notifyOrderStatusUpdate(order, oldStatus) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      preparing: 'Your order is being prepared!',
      ready: 'Your order is ready for pickup!',
      delivered: 'Your order has been delivered!',
      cancelled: 'Your order has been cancelled.',
    }

    const message = statusMessages[order.status] || `Order status updated to ${order.status}`

    return this.createNotification(
      order.user,
      'order',
      'Order Status Update',
      message,
      { orderId: order._id, status: order.status, oldStatus },
      order.status === 'cancelled' ? 'high' : 'medium'
    )
  }

  // Payment notifications
  async notifyPaymentSuccess(payment) {
    return this.createNotification(
      payment.user,
      'payment',
      'Payment Successful',
      `Your payment of $${payment.amount.toFixed(2)} for order #${payment.order.toString().slice(-8)} was successful.`,
      { paymentId: payment._id, orderId: payment.order, amount: payment.amount },
      'high'
    )
  }

  async notifyPaymentFailed(payment) {
    return this.createNotification(
      payment.user,
      'payment',
      'Payment Failed',
      `Your payment of $${payment.amount.toFixed(2)} failed. Please try again.`,
      { paymentId: payment._id, orderId: payment.order, amount: payment.amount },
      'high'
    )
  }

  // System notifications
  async notifyWelcome(user) {
    return this.createNotification(
      user._id,
      'system',
      'Welcome to FoodOrder!',
      `Welcome ${user.name}! Get 10% off your first order with code: WELCOME10`,
      null,
      'high'
    )
  }

  async notifyPromotion(user, title, message, code = null) {
    const data = code ? { promoCode: code } : null
    return this.createNotification(
      user._id,
      'promotion',
      title,
      message,
      data,
      'low'
    )
  }

  async notifyLowStock(foodName, currentStock) {
    // Notify admins (you would need to get admin user IDs)
    const admins = await User.find({ role: 'admin' })
    
    const notifications = admins.map(admin =>
      this.createNotification(
        admin._id,
        'alert',
        'Low Stock Alert',
        `${foodName} is running low! Only ${currentStock} items left.`,
        { foodName, currentStock },
        'high'
      )
    )
    
    return Promise.all(notifications)
  }
}

module.exports = new NotificationService()