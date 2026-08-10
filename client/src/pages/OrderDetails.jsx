import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '../api/orderApi'
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiMapPin, FiPhone, FiMail, FiDollarSign, FiArrowLeft } from 'react-icons/fi'
import Loader from '../components/common/Loader'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'

const OrderDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: order, isLoading, error, refetch } = useQuery({
  queryKey: ['order', id],
  queryFn: () => getOrderById(id),
  enabled: !!id
})

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" />
      case 'confirmed': return <FiCheckCircle className="text-blue-500" />
      case 'preparing': return <FiPackage className="text-purple-500" />
      case 'delivered': return <FiTruck className="text-green-500" />
      default: return <FiPackage className="text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    }
    return texts[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      preparing: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />
  if (!order) return <ErrorMessage message="Order not found" />
   
 
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <FiArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-gray-500">Order #{order._id.slice(-8)}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order Status Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Status</h2>
          <div className="relative">
            <div className="flex justify-between">
              {['pending', 'confirmed', 'preparing', 'delivered'].map((status, index) => {
                const isCompleted = getStatusIndex(order.status) >= index
                const isCurrent = order.status === status
                
                return (
                  <div key={status} className="flex-1 text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? <FiCheckCircle /> : getStatusIcon(status)}
                    </div>
                    <p className={`text-sm font-medium ${isCurrent ? 'text-orange-500' : isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                      {getStatusText(status)}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(getStatusIndex(order.status) / 3) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FiMapPin className="text-orange-500" />
              Delivery Address
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
              <p className="flex items-center gap-2">
                <FiPhone size={14} />
                {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FiDollarSign className="text-orange-500" />
              Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.itemsPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>${order.deliveryPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${order.taxPrice?.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-orange-500">${order.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
                <span className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <Link to={`/food/${item.food}`} className="font-semibold hover:text-orange-500">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">${item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <p className="text-sm text-gray-600">Order Date: {formatDate(order.createdAt)}</p>
              <p className="text-sm text-gray-600">Payment Method: {order.paymentMethod}</p>
            </div>
            {order.estimatedDelivery && (
              <div>
                <h3 className="font-semibold mb-2">Estimated Delivery</h3>
                <p className="text-sm text-gray-600">{formatDate(order.estimatedDelivery)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {order.status === 'pending' && (
            <Button variant="danger"
              onClick={()=>navigate('/orders')}>
              Cancel Order
            </Button>
          )}
          <Button onClick={() => navigate('/menu')}>Order Again</Button>
          <Button variant="outline" onClick={() => window.print()}>Print Receipt</Button>
        </div>
      </div>
    </div>
  )
}

// Helper function to get status index for progress bar
const getStatusIndex = (status) => {
  const statuses = ['pending', 'confirmed', 'preparing', 'delivered']
  const index = statuses.indexOf(status)
  return index === -1 ? 0 : index
}

export default OrderDetails