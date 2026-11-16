import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, deleteUser, toggleUserStatus } from '../../api/adminApi'
import AdminUsersTable from '../../components/admin/AdminUsersTable'
import { FiDownload, FiUserPlus, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

const Users = () => {
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  })

  // ✅ Pagination & Search State
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const limit = 10 // Show 10 users per page

  // ✅ Fetch Users
  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getUsers,
  })

  // ✅ Frontend Pagination Logic
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    const lowerSearch = searchTerm.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(lowerSearch) || u.email.toLowerCase().includes(lowerSearch)
    )
  }, [users, searchTerm])

  const totalPages = Math.ceil(filteredUsers.length / limit)
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit)

  // Mutations (Unchanged)
  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    },
  })

  const toggleStatusMutation = useMutation(({ id, isActive }) => toggleUserStatus(id, isActive), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success('User status updated')
    },
  })

  const createMutation = useMutation(
    (userData) => createUser(userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
        toast.success('User created successfully')
        setShowAddModal(false)
        setFormData({ name: '', email: '', password: '', phone: '', role: 'user' })
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create user')
      },
    }
  )

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggleStatus = (id, isActive) => {
    toggleStatusMutation.mutate({ id, isActive })
  }

  const handleCreateUser = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in required fields')
      return
    }
    createMutation.mutate(formData)
  }

  const handleExportUsers = () => {
    const csvData = users?.map((user) => [
      user.name,
      user.email,
      user.phone || '',
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      new Date(user.createdAt).toLocaleDateString(),
    ]) || []

    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined']
    const csvContent = [headers, ...csvData].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Users exported')
  }

  // Stats based on ALL users, not just the current page
  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u) => u.role === 'admin').length || 0,
    customers: users?.filter((u) => u.role === 'user').length || 0,
    active: users?.filter((u) => u.isActive).length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all registered users</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1) // Reset to page 1 on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <FiUserPlus /> Add User
          </Button>
          <Button onClick={handleExportUsers} variant="outline" className="flex items-center gap-2">
            <FiDownload /> Export
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.customers}</p>
          <p className="text-sm text-gray-500">Customers</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">{stats.admins}</p>
          <p className="text-sm text-gray-500">Admins</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
          <p className="text-sm text-gray-500">Active Users</p>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error?.response?.data?.message || error?.message || 'Could not load users.'}
        </div>
      )}

      {/* Table */}
      <AdminUsersTable
        users={paginatedUsers}
        loading={isLoading}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/*  Sticky Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-6 sticky bottom-4 z-10">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
              page === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
            }`}
          >
            <FiChevronLeft /> Previous
          </button>
          
          <span className="text-gray-600 font-medium">
            Page <span className="text-orange-500 font-bold">{page}</span> of {totalPages}
          </span>
          
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
              page === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
            }`}
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User" size="md">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input label="Full Name *" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Email *" type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input label="Password *" type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          <Input label="Phone" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="user">Customer</option>
            <option value="admin">Administrator</option>
          </select>
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={createMutation.isLoading}>
              {createMutation.isLoading ? 'Creating...' : 'Create User'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users