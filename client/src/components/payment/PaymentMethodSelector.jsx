import React from 'react'
import { FiCreditCard, FiDollarSign, FiSmartphone } from 'react-icons/fi'

const paymentMethods = [
  {
    id: 'KHQR',
    name: 'KHQR Payment',
    description: 'Pay using KHQR via any banking app',
    icon: FiSmartphone,
    logo: '/khqr-logo.png',
  },
  {
    id: 'Cash',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: FiDollarSign,
    logo: '/cash-logo.png',
  },
]

const PaymentMethodSelector = ({ selectedMethod, onChange, disabled = false }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Payment Method
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              disabled={disabled}
              className={`
                relative p-4 border-2 rounded-lg text-left transition-all
                ${isSelected 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Icon className={`text-2xl ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${isSelected ? 'text-orange-500' : 'text-gray-900'}`}>
                      {method.name}
                    </h3>
                    {method.logo && (
                      <img src={method.logo} alt={method.name} className="h-6" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {method.description}
                  </p>
                </div>
                
                {/* Radio indicator */}
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                  isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PaymentMethodSelector