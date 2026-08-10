import toast from 'react-hot-toast'

class NotificationService {
  constructor() {
    this.notifications = []
    this.listeners = []
    this.permission = null
  }

  // Toast notifications
  success(message, options = {}) {
    return toast.success(message, {
      duration: 3000,
      position: 'top-right',
      ...options,
    })
  }

  error(message, options = {}) {
    return toast.error(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    })
  }

  info(message, options = {}) {
    return toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
      ...options,
    })
  }

  warning(message, options = {}) {
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      ...options,
    })
  }

  loading(message, options = {}) {
    return toast.loading(message, {
      duration: Infinity,
      position: 'top-right',
      ...options,
    })
  }

  dismiss(toastId) {
    toast.dismiss(toastId)
  }

  dismissAll() {
    toast.dismiss()
  }

  // Custom toast with action
  action(message, actionText, onAction, options = {}) {
    return toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <span>{message}</span>
          <button
            onClick={() => {
              onAction()
              toast.dismiss(t.id)
            }}
            className="px-2 py-1 bg-orange-500 text-white rounded text-sm"
          >
            {actionText}
          </button>
        </div>
      ),
      {
        duration: 5000,
        position: 'top-right',
        ...options,
      }
    )
  }

  // Browser notifications
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted'
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    }

    return false
  }

  showBrowserNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      this.requestPermission()
      return
    }

    const notification = new Notification(title, {
      icon: '/logo.png',
      badge: '/favicon.ico',
      ...options,
    })

    notification.onclick = () => {
      if (options.onClick) {
        options.onClick()
      }
      window.focus()
    }

    return notification
  }

  // Order notifications
  notifyOrderCreated(order) {
    this.success(`Order #${order._id.slice(-8)} created successfully!`)
    
    this.showBrowserNotification('Order Created!', {
      body: `Your order #${order._id.slice(-8)} has been placed successfully. Total: $${order.totalPrice}`,
      tag: `order-${order._id}`,
    })
  }

  notifyOrderStatusUpdate(order) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      preparing: 'Your order is being prepared!',
      ready: 'Your order is ready for pickup!',
      delivered: 'Your order has been delivered!',
      cancelled: 'Your order has been cancelled.',
    }

    const message = statusMessages[order.status] || `Order status updated to ${order.status}`
    
    this.info(message)
    
    this.showBrowserNotification('Order Update', {
      body: message,
      tag: `order-${order._id}`,
    })
  }

  notifyPaymentSuccess(amount) {
    this.success(`Payment of $${amount} completed successfully!`)
    
    this.showBrowserNotification('Payment Successful', {
      body: `Your payment of $${amount} has been processed successfully.`,
      tag: 'payment-success',
    })
  }

  notifyPaymentFailed(amount) {
    this.error(`Payment of $${amount} failed. Please try again.`)
    
    this.showBrowserNotification('Payment Failed', {
      body: `Your payment of $${amount} could not be processed. Please try again.`,
      tag: 'payment-failed',
    })
  }

  // Cart notifications
  notifyItemAdded(itemName) {
    this.success(`${itemName} added to cart!`)
  }

  notifyItemRemoved(itemName) {
    this.info(`${itemName} removed from cart`)
  }

  notifyCartCleared() {
    this.warning('Cart cleared')
  }

  // Promo notifications
  notifyPromoApplied(code, discount) {
    this.success(`Promo code ${code} applied! You saved $${discount}`)
  }

  notifyPromoInvalid(code) {
    this.error(`Promo code ${code} is invalid or expired`)
  }

  // Error notifications
  notifyNetworkError() {
    this.error('Network error. Please check your connection.')
  }

  notifyServerError() {
    this.error('Server error. Please try again later.')
  }

  notifyAuthError() {
    this.error('Session expired. Please login again.')
  }

  // In-app notification management
  addNotification(notification) {
    this.notifications.unshift({
      id: Date.now(),
      read: false,
      createdAt: new Date(),
      ...notification,
    })
    this.notifyListeners()
  }

  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.notifyListeners()
  }

  clearNotifications() {
    this.notifications = []
    this.notifyListeners()
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }

  getNotifications() {
    return this.notifications
  }

  // Subscribe to notification changes
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications))
  }

  // Welcome notification for new users
  welcomeNewUser(userName) {
    this.success(`Welcome to FoodOrder, ${userName}!`)
    
    this.addNotification({
      title: 'Welcome to FoodOrder!',
      message: 'Explore our menu and get 10% off your first order with code WELCOME10',
      type: 'welcome',
    })
  }

  // Low stock alert (admin)
  notifyLowStock(foodName, quantity) {
    this.warning(`${foodName} is running low! Only ${quantity} left.`)
    
    this.addNotification({
      title: 'Low Stock Alert',
      message: `${foodName} has only ${quantity} items left. Consider restocking.`,
      type: 'alert',
    })
  }

  // New order notification (admin)
  notifyNewOrder(order) {
    this.info(`New order #${order._id.slice(-8)} received!`)
    
    this.showBrowserNotification('New Order!', {
      body: `Order #${order._id.slice(-8)} - Total: $${order.totalPrice}`,
      tag: `new-order-${order._id}`,
    })
    
    this.addNotification({
      title: 'New Order Received',
      message: `Order #${order._id.slice(-8)} from ${order.user?.name}`,
      type: 'order',
      data: { orderId: order._id },
    })
  }
}

export default new NotificationService()