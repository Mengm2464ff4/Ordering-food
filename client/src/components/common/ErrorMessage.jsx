import React from 'react'
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="bg-red-100 rounded-full p-3 mb-4">
        <FiAlertCircle className="text-red-500 text-4xl" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <FiRefreshCw className="mr-2" />
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorMessage