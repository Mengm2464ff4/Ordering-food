import { useContext, useCallback, useState, useEffect } from 'react'
import { PaymentContext } from '../context/PaymentContext'
import { useAuth } from './useAuth'
import { useOrders } from './useOrders'
import toast from 'react-hot-toast'

export const usePayment = () => {
  const context = useContext(PaymentContext)
  const { user } = useAuth()
  const { getOrder, updateOrderStatusById } = useOrders()
  
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }

  const {
    payments,
    currentPayment,
    paymentStatus,
    loading,
    error,
    createPayment,
    verifyPaymentStatus,
    fetchPaymentStatus,
    startVerificationPolling,
    stopVerificationPolling,
    addPaymentToHistory,
    getOrderPayments,
    getTotalPaidForOrder,
    clearCurrentPayment,
    resetPayment,
  } = context

  const [paymentHistory, setPaymentHistory] = useState([])

  // Load payment history for user
  useEffect(() => {
    if (user && payments.length > 0) {
      setPaymentHistory(payments.filter(p => p.user === user._id))
    }
  }, [user, payments])

  // Initialize KHQR payment for an order
  const initiateKHQRPayment = useCallback(async (orderId, amount) => {
    const payment = await createPayment(orderId, amount)
    
    if (payment) {
      // Start auto-verification
      startVerificationPolling(payment.paymentId, payment.transactionId, async (success) => {
        if (success) {
          await updateOrderStatusById(orderId, 'confirmed')
          toast.success('Order confirmed! Your food is being prepared.')
        } else {
          toast.error('Payment verification timeout. Please contact support.')
        }
      })
      
      return payment
    }
    
    return null
  }, [createPayment, startVerificationPolling, updateOrderStatusById])

  // Verify payment manually
  const verifyPayment = useCallback(async (paymentId, transactionId) => {
    const verified = await verifyPaymentStatus(paymentId, transactionId)
    if (verified) {
      // Find which order this payment belongs to
      const payment = payments.find(p => p._id === paymentId)
      if (payment) {
        await updateOrderStatusById(payment.order, 'confirmed')
      }
    }
    return verified
  }, [verifyPaymentStatus, payments, updateOrderStatusById])

  // Check payment status
  const checkPaymentStatus = useCallback(async (paymentId) => {
    return await fetchPaymentStatus(paymentId)
  }, [fetchPaymentStatus])

  // Get payment method display name
  const getPaymentMethodDisplay = useCallback((method) => {
    const methods = {
      KHQR: 'KHQR Payment',
      Cash: 'Cash on Delivery',
    }
    return methods[method] || method
  }, [])

  // Get payment status display
  const getPaymentStatusDisplay = useCallback((status) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
      processing: { text: 'Processing', color: 'bg-blue-100 text-blue-700', icon: '🔄' },
      completed: { text: 'Completed', color: 'bg-green-100 text-green-700', icon: '✅' },
      failed: { text: 'Failed', color: 'bg-red-100 text-red-700', icon: '❌' },
      refunded: { text: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: '↩️' },
    }
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-700', icon: '💳' }
  }, [])

  // Check if payment is successful
  const isPaymentSuccessful = useCallback(() => {
    return paymentStatus === 'completed'
  }, [paymentStatus])

  // Check if payment is pending
  const isPaymentPending = useCallback(() => {
    return paymentStatus === 'pending' || paymentStatus === 'processing'
  }, [paymentStatus])

  // Get payment for a specific order
  const getPaymentForOrder = useCallback(async (orderId) => {
    // First check local payments
    const existingPayment = getOrderPayments(orderId)[0]
    if (existingPayment) return existingPayment
    
    // If not found, try to fetch from API
    // This would require an API endpoint to get payment by order ID
    return null
  }, [getOrderPayments])

  // Format payment amount
  const formatPaymentAmount = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }, [])

  // Get total payments for user
  const getTotalPayments = useCallback(() => {
    return paymentHistory
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  }, [paymentHistory])

  // Get recent payments
  const getRecentPayments = useCallback((limit = 5) => {
    return [...paymentHistory]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  }, [paymentHistory])

  return {
    // State
    payments,
    paymentHistory,
    currentPayment,
    paymentStatus,
    loading,
    error,
    
    // Status helpers
    isPaymentSuccessful: isPaymentSuccessful(),
    isPaymentPending: isPaymentPending(),
    
    // Main operations
    initiateKHQRPayment,
    verifyPayment,
    checkPaymentStatus,
    addPaymentToHistory,
    clearCurrentPayment,
    resetPayment,
    startVerificationPolling,
    stopVerificationPolling,
    
    // Utility methods
    getPaymentForOrder,
    getOrderPayments,
    getTotalPaidForOrder,
    getPaymentMethodDisplay,
    getPaymentStatusDisplay,
    formatPaymentAmount,
    getTotalPayments,
    getRecentPayments,
  }
}