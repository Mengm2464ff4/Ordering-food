import React from 'react'
import { FiCheckCircle, FiClock, FiAlertCircle, FiXCircle, FiLoader } from 'react-icons/fi'

export const PaymentStatus = ({ status, message }) => {
  const statusConfig = {
    pending: {
      icon: FiClock,
      title: 'Awaiting Payment',
      description: message || 'Please complete the payment by scanning the QR code',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    processing: {
      icon: FiLoader,
      title: 'Processing Payment',
      description: message || 'Verifying your payment, please wait...',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    completed: {
      icon: FiCheckCircle,
      title: 'Payment Successful',
      description: message || 'Your payment has been confirmed. Thank you!',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    failed: {
      icon: FiAlertCircle,
      title: 'Payment Failed',
      description: message || 'Payment could not be processed. Please try again.',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    expired: {
      icon: FiXCircle,
      title: 'Session Expired',
      description: message || 'Payment session has expired. Please create a new order.',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
  }

  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <div className={`${config.color} flex-shrink-0`}>
          {status === 'processing' ? (
            <Icon className="text-2xl animate-spin" />
          ) : (
            <Icon className="text-2xl" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.color}`}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {config.description}
          </p>
          
          {/* Additional info based on status */}
          {status === 'pending' && (
            <div className="mt-3 text-xs text-gray-500">
              <p>⚠️ Do not close this window while payment is in progress</p>
            </div>
          )}
          
          {status === 'processing' && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
          
          {status === 'completed' && (
            <div className="mt-3 text-xs text-green-600">
              <p>✓ Transaction completed successfully</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentStatus