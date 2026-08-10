import { useContext, useCallback, useState, useEffect } from 'react'
import { OrderContext } from '../context/OrderContext'
import { useAuth } from './useAuth'
import { useCart } from './useCart'
import toast from 'react-hot-toast'

export const useOrders = () => {
  const context = useContext(OrderContext)
  const { user } = useAuth()
  const { clearCart, getCartItemsForAPI, getCartTotal, getDeliveryFee, getTaxAmount, getCartSubtotal } = useCart()
  
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider')
  }

  const {
    orders,
    currentOrder,
    loading,
    error,
    createNewOrder,
    fetchOrderById,
    fetchMyOrders,
    updateOrderStatusById,
    getOrderStats,
    clearCurrentOrder,
    refreshOrders,
  } = context

  const [orderHistory, setOrderHistory] = useState([])
  const [activeOrder, setActiveOrder] = useState(null)

  // Load user orders on mount when authenticated
  useEffect(() => {
    if (user) {
      fetchMyOrders()
    }
  }, [user, fetchMyOrders])

  // Create order from current cart
  const createOrderFromCart = useCallback(async (shippingAddress, paymentMethod, instructions = '') => {
    const orderItems = getCartItemsForAPI()
    
    if (orderItems.length === 0) {
      toast.error('Your cart is empty')
      return null
    }

    const orderData = {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: getCartSubtotal(),
      taxPrice: getTaxAmount(),
      deliveryPrice: getDeliveryFee(),
      totalPrice: getCartTotal(),
      instructions,
    }

    const order = await createNewOrder(orderData)
    
    if (order) {
      clearCart()
      return order
    }
    
    return null
  }, [getCartItemsForAPI, getCartSubtotal, getTaxAmount, getDeliveryFee, getCartTotal, createNewOrder, clearCart])

  // Get order by ID with caching
  const getOrder = useCallback(async (orderId) => {
    const cachedOrder = orders.find(o => o._id === orderId)
    if (cachedOrder) return cachedOrder
    
    return await fetchOrderById(orderId)
  }, [orders, fetchOrderById])

  // Get pending orders
  const getPendingOrders = useCallback(() => {
    return orders.filter(order => 
      order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing'
    )
  }, [orders])

  // Get completed orders
  const getCompletedOrders = useCallback(() => {
    return orders.filter(order => order.status === 'delivered')
  }, [orders])

  // Get cancelled orders
  const getCancelledOrders = useCallback(() => {
    return orders.filter(order => order.status === 'cancelled')
  }, [orders])

  // Get orders by date range
  const getOrdersByDateRange = useCallback((startDate, endDate) => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
  }, [orders])

  // Get current month orders
  const getCurrentMonthOrders = useCallback(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return getOrdersByDateRange(startOfMonth, now)
  }, [getOrdersByDateRange])

  // Get last 30 days orders
  const getLast30DaysOrders = useCallback(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return getOrdersByDateRange(thirtyDaysAgo, new Date())
  }, [getOrdersByDateRange])

  // Calculate total spent
  const getTotalSpent = useCallback(() => {
    return orders
      .filter(order => order.isPaid)
      .reduce((sum, order) => sum + order.totalPrice, 0)
  }, [orders])

  // Calculate average order value
  const getAverageOrderValue = useCallback(() => {
    const completedOrders = getCompletedOrders()
    if (completedOrders.length === 0) return 0
    const total = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0)
    return total / completedOrders.length
  }, [getCompletedOrders])

  // Cancel order
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    const confirmed = window.confirm('Are you sure you want to cancel this order?')
    if (!confirmed) return false
    
    const updatedOrder = await updateOrderStatusById(orderId, 'cancelled')
    if (updatedOrder) {
      toast.success('Order cancelled successfully')
      return true
    }
    return false
  }, [updateOrderStatusById])

  // Reorder (create new order from previous order)
  const reorder = useCallback(async (orderId) => {
    const previousOrder = await getOrder(orderId)
    if (!previousOrder) return null
    
    // This would need to add items to cart
    // Implementation depends on your cart system
    toast.info('Reorder functionality: Add items to cart')
    return previousOrder
  }, [getOrder])

  // Get order status text and color
  const getOrderStatusInfo = useCallback((status) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
      confirmed: { text: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: '✓' },
      preparing: { text: 'Preparing', color: 'bg-purple-100 text-purple-700', icon: '🍳' },
      ready: { text: 'Ready', color: 'bg-indigo-100 text-indigo-700', icon: '✅' },
      delivered: { text: 'Delivered', color: 'bg-green-100 text-green-700', icon: '🚚' },
      cancelled: { text: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '✗' },
    }
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-700', icon: '📦' }
  }, [])

  // Check if order can be cancelled
  const canCancelOrder = useCallback((order) => {
    return order && ['pending', 'confirmed'].includes(order.status)
  }, [])

  // Check if order can be reordered
  const canReorder = useCallback((order) => {
    return order && order.status === 'delivered'
  }, [])

  return {
    // State
    orders,
    currentOrder,
    orderHistory,
    activeOrder,
    loading,
    error,
    
    // Statistics
    stats: getOrderStats(),
    totalSpent: getTotalSpent(),
    averageOrderValue: getAverageOrderValue(),
    pendingOrders: getPendingOrders(),
    completedOrders: getCompletedOrders(),
    cancelledOrders: getCancelledOrders(),
    currentMonthOrders: getCurrentMonthOrders(),
    last30DaysOrders: getLast30DaysOrders(),
    
    // Main operations
    createOrderFromCart,
    getOrder,
    fetchMyOrders,
    updateOrderStatus: updateOrderStatusById,
    cancelOrder,
    reorder,
    refreshOrders,
    clearCurrentOrder,
    
    // Helper methods
    getOrderStatusInfo,
    canCancelOrder,
    canReorder,
    getOrdersByDateRange,
  }
}