import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '../api/orderApi'
import { createKHQRPayment, getPaymentStatus } from '../api/paymentApi'
import { FiCopy, FiCheckCircle, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import QRCodeDisplay from '../components/payment/QRCodeDisplay'
import toast from 'react-hot-toast'

const Payment = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes
  const [copied, setCopied] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const isValidOrderId = Boolean(orderId) && orderId !== 'undefined'

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: isValidOrderId,
  })

  useEffect(() => {
    if (!isValidOrderId) {
      toast.error('Invalid order ID. Please place your order again.')
      navigate('/cart', { replace: true })
    }
  }, [isValidOrderId, navigate])

  useEffect(() => {
    if (order && !payment && !paymentError) {
      initiatePayment()
    }
  }, [order, payment, paymentError])

  useEffect(() => {
    if (paymentStatus === 'pending') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setPaymentStatus('expired')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [paymentStatus])

  useEffect(() => {
    if (paymentStatus === 'pending' && payment) {
      const interval = setInterval(() => {
        checkPaymentStatus()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [paymentStatus, payment])

  const initiatePayment = async () => {
    try {
      const orderKey = order._id || order.id
      const paymentData = await createKHQRPayment({
        orderId: orderKey,
        amount: order.totalPrice,
      })
      if (!paymentData?.qrCode && !paymentData?.qrData && !paymentData?.qrString) {
        throw new Error('Payment QR code was not generated')
      }
      setPayment(paymentData)
      setPaymentError(null)
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to initiate payment'
      setPaymentError(message)
      toast.error(message)
    }
  }

  const checkPaymentStatus = async () => {
    if (!payment) return
    
    setIsVerifying(true)
    try {
      const status = await getPaymentStatus(payment.paymentId)
      if (status.status === 'completed') {
        setPaymentStatus('completed')
        toast.success('Payment confirmed!')
        setTimeout(() => {
          navigate(`/orders/${orderId}`)
        }, 2000)
      } else if (status.status === 'failed') {
        setPaymentStatus('failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleManualVerify = () => {
    checkPaymentStatus()
  }

  const handleCopyQR = () => {
    const qrValue = payment?.qrData || payment?.qrString || payment?.qrCode
    if (qrValue) {
      navigator.clipboard.writeText(qrValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('QR code copied!')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isValidOrderId || orderLoading || !order) return <Loader />

  const qrImage = payment?.qrCode
  const qrPayload = payment?.qrData || payment?.qrString
  const showQr = Boolean(qrPayload || qrImage)
  const payAmountLabel = payment?.amountLabel
    || (payment?.currency === 'KHR'
      ? `${Number(payment?.amount || order.totalPrice).toLocaleString()} ៛`
      : `$${Number(payment?.amount || order.totalPrice).toFixed(2)}`)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white text-center">
            <h1 className="text-2xl font-bold">KHQR Payment</h1>
            <p className="text-orange-100 mt-2">Scan to pay with your banking app</p>
          </div>

          <div className="p-6">
            {/* Order Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-semibold">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount to Pay:</span>
                <span className="text-2xl font-bold text-orange-500">{payAmountLabel}</span>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <FiClock className="text-gray-500" />
                <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                <span className="text-gray-500 text-sm">remaining</span>
              </div>
              {timeLeft < 300 && timeLeft > 0 && (
                <p className="text-red-500 text-sm mt-2">⚠️ Session expiring soon!</p>
              )}
            </div>

            {paymentError && !payment && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {paymentError}
                <Button onClick={initiatePayment} className="mt-3 w-full" variant="outline">
                  Retry payment setup
                </Button>
              </div>
            )}

            {!payment && !paymentError && (
              <div className="flex justify-center mb-6 py-8">
                <Loader />
                <span className="ml-2 text-gray-500">Generating KHQR code...</span>
              </div>
            )}

            {/* QR Code */}
            {showQr && (
              <div className="flex justify-center mb-6">
                <div className="relative bg-white p-4 rounded-xl shadow-lg">
                  <QRCodeDisplay
                    qrCode={qrPayload?.startsWith('000201') ? null : qrImage}
                    value={qrPayload}
                    size={280}
                  />
                  <button
                    onClick={handleCopyQR}
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg"
                  >
                    {copied ? <FiCheckCircle className="text-green-500" /> : <FiCopy />}
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">How to pay:</h3>
              <ol className="space-y-2 text-sm text-blue-700">
                <li>1. Open your banking app (ABA, ACLEDA, Wing, Pi Pay)</li>
                <li>2. Select "Scan QR Code"</li>
                <li>3. Scan the QR code above</li>
                <li>4. Confirm amount: <strong>{payAmountLabel}</strong></li>
                <li>5. Enter your PIN to complete payment</li>
              </ol>
            </div>

            {/* Payment Status */}
            <div className={`p-4 rounded-lg mb-6 ${
              paymentStatus === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
              paymentStatus === 'completed' ? 'bg-green-50 border border-green-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {paymentStatus === 'pending' && <FiClock className="text-yellow-500 text-2xl" />}
                {paymentStatus === 'completed' && <FiCheckCircle className="text-green-500 text-2xl" />}
                {paymentStatus === 'failed' && <FiAlertCircle className="text-red-500 text-2xl" />}
                {paymentStatus === 'expired' && <FiAlertCircle className="text-gray-500 text-2xl" />}
                
                <div>
                  <p className="font-semibold">
                    {paymentStatus === 'pending' && 'Awaiting Payment'}
                    {paymentStatus === 'completed' && 'Payment Successful!'}
                    {paymentStatus === 'failed' && 'Payment Failed'}
                    {paymentStatus === 'expired' && 'Session Expired'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {paymentStatus === 'pending' && 'Please complete the payment by scanning the QR code'}
                    {paymentStatus === 'completed' && 'Your payment has been confirmed. Redirecting...'}
                    {paymentStatus === 'failed' && 'There was an issue processing your payment'}
                    {paymentStatus === 'expired' && 'Payment session has expired. Please create a new order.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {paymentStatus === 'pending' && (
              <div className="flex gap-3">
                <Button
                  onClick={handleManualVerify}
                  disabled={isVerifying}
                  variant="outline"
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <Loader className="mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="mr-2" />
                      Check Status
                    </>
                  )}
                </Button>
                <Button onClick={() => navigate('/')} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            )}

            {paymentStatus === 'expired' && (
              <Button onClick={() => navigate('/cart')} className="w-full">
                Return to Cart
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment