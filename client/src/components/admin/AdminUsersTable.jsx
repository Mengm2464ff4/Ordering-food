import React, { useState } from 'react'
import { FiEye, FiTrash2, FiEdit2, FiSearch, FiX, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { formatDate } from '../../utils/formatDate'

const AdminUsersTable = ({ users, loading, onDelete, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const userList = Array.isArray(users) ? users : []

  const filteredUsers = userList.filter(user => {
    const name = (user.name || '').toLowerCase()
    const email = (user.email || '').toLowerCase()
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                          email.includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleView = (user) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      onDelete(user._id)
    }
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
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <div className="text-sm text-gray-500">
            Total Users: {userList.length}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>

          {(searchTerm || roleFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredUsers?.map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(user.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">
                          {user.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <FiMail size={12} className="text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <FiPhone size={12} className="text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleStatus(user._id, !user.isActive)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleView(user)}
                        className="p-1 text-blue-500 hover:text-blue-600"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1 text-red-500 hover:text-red-600"
                        title="Delete User"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredUsers?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      {/* View User Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="User Details" size="md">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {(selectedUser.name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                <p className="text-gray-500">{selectedUser.role === 'admin' ? 'Administrator' : 'Customer'}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <FiMail className="text-gray-400" />
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              
              {selectedUser.phone && (
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-400" />
                  <div>
                    <label className="text-xs text-gray-500">Phone</label>
                    <p>{selectedUser.phone}</p>
                  </div>
                </div>
              )}
              
              {selectedUser.address && (
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-gray-400" />
                  <div>
                    <label className="text-xs text-gray-500">Address</label>
                    <p>
                      {selectedUser.address.street}, {selectedUser.address.city}
                      {selectedUser.address.district && `, ${selectedUser.address.district}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">Account Created</label>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <label className="text-gray-500">Account Status</label>
                  <p className={selectedUser.isActive ? 'text-green-600' : 'text-red-600'}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminUsersTable