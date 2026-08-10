import React, { useState } from 'react'
import { FiEye, FiSearch, FiX, FiDownload, FiCheckCircle, FiClock } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { formatDate } from '../../utils/formatDate'

const AdminPaymentTable = ({ payments, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const statuses = ['all', 'pending', 'completed', 'failed', 'refunded']
  const methods = ['all', 'KHQR', 'Cash']

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = payment._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter
    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'refunded': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const exportToCSV = () => {
    const headers = ['Payment ID', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date']
    const data = filteredPayments.map(payment => [
      payment._id,
      payment.order?._id || 'N/A',
      payment.user?.name || 'N/A',
      `$${payment.amount}`,
      payment.method,
      payment.status,
      formatDate(payment.createdAt)
    ])
    
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Payment Management</h2>
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <FiDownload size={18} />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by payment ID, order ID, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {methods.map(method => (
              <option key={method} value={method}>
                {method === 'all' ? 'All Methods' : method}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setMethodFilter('all')
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <FiX />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredPayments?.map((payment, index) => (
                <motion.tr
                  key={payment._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{payment._id?.slice(-8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{payment.order?._id?.slice(-8) || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{payment.user?.name || 'Guest'}</p>
                      <p className="text-sm text-gray-500">{payment.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-orange-500">${payment.amount?.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === 'completed' && <FiCheckCircle size={12} />}
                      {payment.status === 'pending' && <FiClock size={12} />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment)
                        setIsViewModalOpen(true)
                      }}
                      className="p-1 text-blue-500 hover:text-blue-600"
                      title="View Details"
                    >
                      <FiEye size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredPayments?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No payments found</p>
        </div>
      )}

      {/* View Payment Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Payment Details" size="md">
        {selectedPayment && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm text-gray-500">Payment ID</label>
                <p className="font-mono font-medium">{selectedPayment._id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Order ID</label>
                <p className="font-mono">{selectedPayment.order?._id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Amount</label>
                <p className="text-xl font-bold text-orange-500">${selectedPayment.amount?.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Payment Method</label>
                <p>{selectedPayment.method}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date</label>
                <p>{formatDate(selectedPayment.createdAt)}</p>
              </div>
            </div>

            {selectedPayment.transactionId && (
              <div>
                <label className="text-sm text-gray-500">Transaction ID</label>
                <p className="font-mono text-sm">{selectedPayment.transactionId}</p>
              </div>
            )}

            {selectedPayment.paidAt && (
              <div>
                <label className="text-sm text-gray-500">Paid At</label>
                <p>{formatDate(selectedPayment.paidAt)}</p>
              </div>
            )}

            {selectedPayment.khqrData && (
              <div>
                <label className="text-sm text-gray-500">KHQR Transaction ID</label>
                <p className="font-mono text-sm">{selectedPayment.khqrData.transactionId}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminPaymentTable