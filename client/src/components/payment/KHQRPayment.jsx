import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import QRCodeDisplay from './QRCodeDisplay'
import { PaymentStatus } from './PaymentStatus'
import { verifyPayment, getPaymentStatus } from '../../api/paymentApi'
import { FiCopy, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import Button from '../common/Button'
import Loader from '../common/Loader'
import toast from 'react-hot-toast'

const KHQRPayment = ({ orderId, paymentId, qrCode, amount, onPaymentComplete }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationCount, setVerificationCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setPaymentStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Auto-verify payment every 5 seconds for the first 5 attempts
    if (paymentStatus === 'pending' && verificationCount < 12) {
      const interval = setInterval(() => {
        handleVerifyPayment()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [paymentStatus, verificationCount])

  const handleVerifyPayment = async () => {
    if (isVerifying) return
    
    setIsVerifying(true)
    setVerificationCount(prev => prev + 1)
    
    try {
      // In production, this would call your backend to verify with KHQR API
      const status = await getPaymentStatus(paymentId)
      
      if (status.status === 'completed') {
        setPaymentStatus('completed')
        toast.success('Payment verified successfully!')
        if (onPaymentComplete) {
          onPaymentComplete()
        }
        setTimeout(() => {
          navigate(`/orders/${orderId}`)
        }, 2000)
      } else if (status.status === 'failed') {
        setPaymentStatus('failed')
        toast.error('Payment verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleManualVerify = () => {
    if (verificationCount >= 10) {
      toast.error('Maximum verification attempts reached. Please contact support.')
      return
    }
    handleVerifyPayment()
  }

  const handleCopyQRCode = () => {
    // Copy QR code as base64 to clipboard
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d').drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
        toast.success('QR Code copied to clipboard!')
      })
    }
    img.src = qrCode
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">KHQR Payment</h1>
          <p className="text-orange-100">Scan QR code to complete payment</p>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono font-semibold">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount to Pay:</span>
              <span className="text-2xl font-bold text-orange-500">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Timer */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <FiRefreshCw className={`text-gray-500 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
              <span className="font-mono font-bold text-lg">
                {formatTime(timeLeft)}
              </span>
              <span className="text-gray-500 text-sm">remaining</span>
            </div>
            {timeLeft < 300 && timeLeft > 0 && (
              <p className="text-red-500 text-sm mt-2">
                ⚠️ Payment session expiring soon!
              </p>
            )}
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <QRCodeDisplay qrCode={qrCode} size={250} />
              <button
                onClick={handleCopyQRCode}
                className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition"
                title="Copy QR Code"
              >
                <FiCopy className="text-gray-600" size={18} />
              </button>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How to pay:</h3>
            <ol className="space-y-2 text-sm text-blue-700">
              <li>1. Open your banking app or KHQR-enabled wallet</li>
              <li>2. Select "Scan QR Code" option</li>
              <li>3. Scan the QR code above</li>
              <li>4. Confirm the payment amount: <strong>${amount.toFixed(2)}</strong></li>
              <li>5. Enter your PIN to complete the transaction</li>
              <li>6. Payment will be automatically verified</li>
            </ol>
          </div>

          {/* Payment Status */}
          <PaymentStatus status={paymentStatus} />

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleManualVerify}
              disabled={isVerifying || paymentStatus !== 'pending'}
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
                  Check Payment Status
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {/* Support Contact */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Having trouble? Contact our support:</p>
            <p className="font-semibold">📞 +855 12 345 678</p>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      {paymentStatus === 'completed' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4 animate-bounce">
            <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been confirmed. Redirecting to order details...
            </p>
            <Loader />
          </div>
        </div>
      )}

      {/* Failure Overlay */}
      {paymentStatus === 'failed' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
            <FiAlertCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">
              There was an issue processing your payment. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default KHQRPayment