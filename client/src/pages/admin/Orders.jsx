import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'  // Changed
import { getOrders, updateOrderStatus } from '../../api/adminApi'
import AdminOrderTable from '../../components/admin/AdminOrderTable'
import { FiFilter, FiDownload } from 'react-icons/fi'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

const Orders = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const { data: ordersData, isLoading, refetch } = useQuery({
  queryKey: ['adminOrders', statusFilter, dateFilter],
  queryFn: () => getOrders({ status: statusFilter, date: dateFilter })
})

  const updateStatusMutation = useMutation(
    ({ id, status }) => updateOrderStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders')
        toast.success('Order status updated')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update order status')
      },
    }
  )

  const handleExportOrders = () => {
    const orders = ordersData?.orders || []
    const headers = ['Order ID', 'Customer', 'Total', 'Status', 'Payment', 'Date', 'Items']
    const csvData = orders.map(order => [
      order._id,
      order.user?.name || 'Guest',
      order.totalPrice,
      order.status,
      order.isPaid ? 'Paid' : 'Unpaid',
      new Date(order.createdAt).toLocaleDateString(),
      order.orderItems?.length || 0,
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Orders exported')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">View and manage all customer orders</p>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Button onClick={handleExportOrders} variant="outline" className="flex items-center gap-2">
            <FiDownload /> Export
          </Button>
        </div>
      </div>

      <AdminOrderTable
        orders={ordersData?.orders}
        loading={isLoading}
        onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
      />

      {/* Order Statistics Summary */}
      {ordersData?.orders && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Order Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{ordersData.total || 0}</p>
              <p className="text-sm">Total Orders</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{ordersData.orders?.filter(o => o.status === 'pending').length || 0}</p>
              <p className="text-sm">Pending</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{ordersData.orders?.filter(o => o.status === 'delivered').length || 0}</p>
              <p className="text-sm">Delivered</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">{ordersData.orders?.filter(o => o.status === 'cancelled').length || 0}</p>
              <p className="text-sm">Cancelled</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold">${ordersData.orders?.reduce((sum, o) => sum + (o.isPaid ? o.totalPrice : 0), 0).toFixed(2)}</p>
              <p className="text-sm">Revenue</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders