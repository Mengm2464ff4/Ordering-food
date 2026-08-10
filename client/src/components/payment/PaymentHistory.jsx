import React from 'react'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiAlertCircle, FiEye } from 'react-icons/fi'
import { formatDate } from '../../utils/formatDate'

export const PaymentHistory = ({ payments, loading }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-green-500" />
      case 'pending':
        return <FiClock className="text-yellow-500" />
      case 'failed':
        return <FiAlertCircle className="text-red-500" />
      default:
        return <FiClock className="text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No payment history found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(payment.status)}
                <span className={`text-sm font-semibold ${
                  payment.status === 'completed' ? 'text-green-600' :
                  payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {getStatusText(payment.status)}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(payment.createdAt)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-semibold ml-2">${payment.amount?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Method:</span>
                  <span className="ml-2">{payment.method}</span>
                </div>
                {payment.transactionId && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-mono text-xs ml-2">{payment.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Link
              to={`/orders/${payment.order?._id}`}
              className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
            >
              <FiEye />
              <span className="text-sm">View Order</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PaymentHistory