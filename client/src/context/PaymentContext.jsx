import React, { createContext, useState, useCallback, useMemo } from 'react'
import { createKHQRPayment, verifyPayment, getPaymentStatus } from '../api/paymentApi'
import toast from 'react-hot-toast'

export const PaymentContext = createContext()

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([])
  const [currentPayment, setCurrentPayment] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [verificationInterval, setVerificationInterval] = useState(null)

  const createPayment = useCallback(async (orderId, amount) => {
    setLoading(true)
    setError(null)
    try {
      const payment = await createKHQRPayment({ orderId, amount })
      setCurrentPayment(payment)
      setPaymentStatus('pending')
      toast.success('Payment initiated. Please scan QR code.')
      return payment
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to initiate payment'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyPaymentStatus = useCallback(async (paymentId, transactionId) => {
    setLoading(true)
    try {
      const result = await verifyPayment(paymentId, transactionId)
      if (result.status === 'success') {
        setPaymentStatus('completed')
        toast.success('Payment verified successfully!')
        return true
      } else if (result.status === 'failed') {
        setPaymentStatus('failed')
        toast.error('Payment verification failed')
        return false
      }
      return false
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify payment'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPaymentStatus = useCallback(async (paymentId) => {
    setLoading(true)
    try {
      const status = await getPaymentStatus(paymentId)
      setPaymentStatus(status.status)
      return status
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get payment status'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const startVerificationPolling = useCallback((paymentId, transactionId, onComplete) => {
    if (verificationInterval) {
      clearInterval(verificationInterval)
    }

    let attempts = 0
    const maxAttempts = 24

    const interval = setInterval(async () => {
      attempts++
      
      const status = await fetchPaymentStatus(paymentId)
      
      if (status?.status === 'completed') {
        clearInterval(interval)
        setVerificationInterval(null)
        if (onComplete) onComplete(true)
      } else if (attempts >= maxAttempts || status?.status === 'failed') {
        clearInterval(interval)
        setVerificationInterval(null)
        if (onComplete) onComplete(false)
      }
    }, 5000)

    setVerificationInterval(interval)
  }, [fetchPaymentStatus, verificationInterval])

  const stopVerificationPolling = useCallback(() => {
    if (verificationInterval) {
      clearInterval(verificationInterval)
      setVerificationInterval(null)
    }
  }, [verificationInterval])

  const addPaymentToHistory = useCallback((payment) => {
    setPayments(prev => [payment, ...prev])
  }, [])

  const getOrderPayments = useCallback((orderId) => {
    return payments.filter(p => p.order === orderId)
  }, [payments])

  const getTotalPaidForOrder = useCallback((orderId) => {
    return payments
      .filter(p => p.order === orderId && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const clearCurrentPayment = useCallback(() => {
    setCurrentPayment(null)
    setPaymentStatus(null)
    stopVerificationPolling()
  }, [stopVerificationPolling])

  const resetPayment = useCallback(() => {
    setCurrentPayment(null)
    setPaymentStatus(null)
    setError(null)
    stopVerificationPolling()
  }, [stopVerificationPolling])

  return (
    <PaymentContext.Provider value={{
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
    }}>
      {children}
    </PaymentContext.Provider>
  )
}