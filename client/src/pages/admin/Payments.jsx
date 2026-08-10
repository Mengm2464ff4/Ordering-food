import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'  // Changed
import { getPayments } from '../../api/adminApi'
import AdminPaymentTable from '../../components/admin/AdminPaymentTable'
import { FiDownload, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

const Payments = () => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  
 const { data: paymentsData, isLoading, refetch } = useQuery({
  queryKey: ['adminPayments', statusFilter, methodFilter],
  queryFn: () => getPayments({ status: statusFilter, method: methodFilter })
})

  const handleExportPayments = () => {
    const payments = paymentsData?.payments || []
    const headers = ['Payment ID', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date']
    const csvData = payments.map(payment => [
      payment._id,
      payment.order?._id || 'N/A',
      payment.user?.name || 'Guest',
      payment.amount,
      payment.method,
      payment.status,
      new Date(payment.createdAt).toLocaleDateString(),
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Payments exported')
  }

  // Calculate summary stats
  const completedPayments = paymentsData?.payments?.filter(p => p.status === 'completed') || []
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  const khqrPayments = paymentsData?.payments?.filter(p => p.method === 'KHQR').length || 0
  const cashPayments = paymentsData?.payments?.filter(p => p.method === 'Cash').length || 0

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Methods</option>
            <option value="KHQR">KHQR</option>
            <option value="Cash">Cash</option>
          </select>
          <Button onClick={handleExportPayments} variant="outline" className="flex items-center gap-2">
            <FiDownload /> Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={<FiDollarSign className="text-2xl" />}
          trend="+12.5%"
          color="bg-green-500"
        />
        <SummaryCard
          title="Total Transactions"
          value={paymentsData?.payments?.length || 0}
          icon={<FiTrendingUp className="text-2xl" />}
          trend="+8.2%"
          color="bg-blue-500"
        />
        <SummaryCard
          title="KHQR Payments"
          value={khqrPayments}
          icon={<FiTrendingUp className="text-2xl" />}
          color="bg-orange-500"
        />
        <SummaryCard
          title="Cash Payments"
          value={cashPayments}
          icon={<FiTrendingDown className="text-2xl" />}
          color="bg-purple-500"
        />
      </div>

      <AdminPaymentTable payments={paymentsData?.payments} loading={isLoading} />
    </div>
  )
}

const SummaryCard = ({ title, value, icon, trend, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        {trend && (
          <span className="text-green-500 text-sm flex items-center gap-1">
            <FiTrendingUp /> {trend}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

export default Payments