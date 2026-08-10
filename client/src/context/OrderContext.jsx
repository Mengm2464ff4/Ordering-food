import React, { createContext, useState, useCallback, useMemo } from 'react'
import { createOrder, getOrderById, getMyOrders, updateOrderStatus } from '../api/orderApi'
import toast from 'react-hot-toast'

export const OrderContext = createContext()

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createNewOrder = useCallback(async (orderData) => {
    setLoading(true)
    setError(null)
    try {
      const order = await createOrder(orderData)
      setOrders(prev => [order, ...prev])
      toast.success('Order created successfully!')
      return order
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create order'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOrderById = useCallback(async (orderId) => {
    setLoading(true)
    setError(null)
    try {
      const order = await getOrderById(orderId)
      setCurrentOrder(order)
      return order
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch order'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const userOrders = await getMyOrders()
      setOrders(userOrders)
      return userOrders
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch orders'
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const updateOrderStatusById = useCallback(async (orderId, status) => {
    setLoading(true)
    setError(null)
    try {
      const updatedOrder = await updateOrderStatus(orderId, status)
      setOrders(prev => prev.map(order => 
        order._id === orderId ? updatedOrder : order
      ))
      if (currentOrder?._id === orderId) {
        setCurrentOrder(updatedOrder)
      }
      toast.success(`Order status updated to ${status}`)
      return updatedOrder
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update order status'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [currentOrder])

  const getOrderStats = useCallback(() => {
    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'delivered').length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
    const totalSpent = orders
      .filter(o => o.isPaid)
      .reduce((sum, o) => sum + o.totalPrice, 0)

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalSpent,
      completionRate: totalOrders ? (completedOrders / totalOrders) * 100 : 0,
    }
  }, [orders])

  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null)
  }, [])

  const refreshOrders = useCallback(async () => {
    await fetchMyOrders()
  }, [fetchMyOrders])

  return (
    <OrderContext.Provider value={{
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
    }}>
      {children}
    </OrderContext.Provider>
  )
}