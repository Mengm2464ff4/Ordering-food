import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyOrders } from '../api/orderApi'
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiEye } from 'react-icons/fi'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'

const Orders = () => {
  const navigate = useNavigate()
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['myOrders'],
    queryFn: getMyOrders,
  })
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    refetch()
  }, [refetch])

  const statusFilter = (order) => {
    if (selectedStatus === 'all') return true
    return order.status === selectedStatus
  }

  const filteredOrders = orders?.filter(statusFilter) || []

  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    confirmed: orders?.filter(o => o.status === 'confirmed').length || 0,
    preparing: orders?.filter(o => o.status === 'preparing').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
  }

  if (isLoading) return <Loader />

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          title="No orders yet"
          message="You haven't placed any orders yet. Browse our menu and place your first order!"
          icon="folder"
          actionText="Start Shopping"
          onAction={() => navigate('/menu')}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-gray-600 mb-8">Track and manage your orders</p>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b">
        {['all', 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 font-medium transition ${
              selectedStatus === status
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {statusCounts[status] > 0 && (
              <span className="ml-2 text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                {statusCounts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map(order => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found with this status</p>
        </div>
      )}
    </div>
  )
}

const OrderCard = ({ order }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" />
      case 'confirmed': return <FiCheckCircle className="text-blue-500" />
      case 'preparing': return <FiPackage className="text-purple-500" />
      case 'delivered': return <FiTruck className="text-green-500" />
      case 'cancelled': return <FiXCircle className="text-red-500" />
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="p-6">
        {/* Order Header */}
        <div className="flex flex-wrap justify-between items-start mb-4">
          <div>
            <Link to={`/orders/${order._id}`} className="text-lg font-semibold hover:text-orange-500">
              Order #{order._id.slice(-8)}
            </Link>
            <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t border-b py-4 mb-4">
          {order.orderItems.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-2">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          {order.orderItems.length > 3 && (
            <p className="text-sm text-gray-500 text-center pt-2">
              +{order.orderItems.length - 3} more items
            </p>
          )}
        </div>

        {/* Order Footer */}
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-orange-500">${order.totalPrice.toFixed(2)}</p>
          </div>
          <div className="flex gap-3">
            {order.status === 'pending' && (
              <button className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50">
                Cancel Order
              </button>
            )}
            <Link
              to={`/orders/${order._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <FiEye /> View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders