import React, { useState } from 'react'
import { FiCreditCard, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi'
import Button from '../common/Button'

const PaymentButton = ({ 
  amount, 
  orderId, 
  onPaymentInitiate, 
  onPaymentSuccess,
  onPaymentError,
  variant = 'primary',
  fullWidth = true 
}) => {
  const [paymentState, setPaymentState] = useState('idle') // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('')

  const handlePayment = async () => {
    setPaymentState('loading')
    setErrorMessage('')
    
    try {
      // Call payment initiation
      if (onPaymentInitiate) {
        const result = await onPaymentInitiate({ orderId, amount })
        
        if (result.success) {
          setPaymentState('success')
          if (onPaymentSuccess) {
            onPaymentSuccess(result)
          }
          
          // Reset after 3 seconds
          setTimeout(() => {
            setPaymentState('idle')
          }, 3000)
        } else {
          throw new Error(result.message || 'Payment initiation failed')
        }
      }
    } catch (error) {
      setPaymentState('error')
      setErrorMessage(error.message || 'Payment failed. Please try again.')
      if (onPaymentError) {
        onPaymentError(error)
      }
      
      // Reset after 3 seconds
      setTimeout(() => {
        setPaymentState('idle')
        setErrorMessage('')
      }, 3000)
    }
  }

  const getButtonConfig = () => {
    switch (paymentState) {
      case 'loading':
        return {
          text: 'Processing Payment...',
          icon: FiLoader,
          disabled: true,
          className: 'opacity-75',
        }
      case 'success':
        return {
          text: 'Payment Successful!',
          icon: FiCheck,
          disabled: true,
          className: 'bg-green-500 hover:bg-green-600',
        }
      case 'error':
        return {
          text: 'Payment Failed',
          icon: FiAlertCircle,
          disabled: false,
          className: 'bg-red-500 hover:bg-red-600',
        }
      default:
        return {
          text: `Pay $${amount.toFixed(2)}`,
          icon: FiCreditCard,
          disabled: false,
          className: '',
        }
    }
  }

  const config = getButtonConfig()
  const Icon = config.icon

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePayment}
        disabled={config.disabled}
        variant={variant}
        className={`${fullWidth ? 'w-full' : ''} ${config.className}`}
      >
        <div className="flex items-center justify-center gap-2">
          <Icon className={paymentState === 'loading' ? 'animate-spin' : ''} />
          {config.text}
        </div>
      </Button>
      
      {errorMessage && (
        <p className="text-red-500 text-sm text-center">{errorMessage}</p>
      )}
      
      {/* Payment Methods Info */}
      <div className="text-center text-xs text-gray-500 mt-2">
        <p>Secure payment powered by KHQR</p>
        <div className="flex justify-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-gray-100 rounded">ABA</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded">ACLEDA</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded">Wing</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded">Pi Pay</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentButton