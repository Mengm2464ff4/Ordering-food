import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'  // Changed
import { getUsers, createUser, deleteUser, toggleUserStatus } from '../../api/adminApi'
// import {
//   getUsers,
//   createUser,
//   deleteUser,
//   updateUser,
//   toggleUserStatus,
// } from '../api/adminApi'
import AdminUsersTable from '../../components/admin/AdminUsersTable'
import { FiDownload, FiUserPlus } from 'react-icons/fi'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

const Users = () => {
  const queryClient = useQueryClient()
  const [ showAddModal, setShowAddModal ] = useState( false )
  const [ formData, setFormData ] = useState( {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
  } )

  const { data: users = [], isLoading, isError, error } = useQuery( {
    queryKey: [ 'adminUsers' ],
    queryFn: getUsers,
  } )

  const deleteMutation = useMutation( deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: [ 'adminUsers' ] } )
      toast.success( 'User deleted successfully' )
    },
    onError: ( error ) => {
      toast.error( error.response?.data?.message || 'Failed to delete user' )
    },
  } )

  const toggleStatusMutation = useMutation( ( { id, isActive } ) => toggleUserStatus( id, isActive ), {
    onSuccess: () => {
      queryClient.invalidateQueries( { queryKey: [ 'adminUsers' ] } )
      toast.success( 'User status updated' )
    },
  } )

  const createMutation = useMutation(
    ( userData ) => createUser( userData ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries( { queryKey: [ 'adminUsers' ] } )
        toast.success( 'User created successfully' )
        setShowAddModal( false )
        setFormData( { name: '', email: '', password: '', phone: '', role: 'user' } )
      },
      onError: ( error ) => {
        toast.error( error.response?.data?.message || 'Failed to create user' )
      },
    }
  )

  const handleDelete = ( id ) => {
    if ( window.confirm( 'Are you sure you want to delete this user?' ) ) {
      deleteMutation.mutate( id )
    }
  }

  const handleToggleStatus = ( id, isActive ) => {
    toggleStatusMutation.mutate( { id, isActive } )
  }

  const handleCreateUser = ( e ) => {
    e.preventDefault()
    if ( !formData.name || !formData.email || !formData.password ) {
      toast.error( 'Please fill in required fields' )
      return
    }
    createMutation.mutate( formData )
  }

  const handleExportUsers = () => {
    const csvData = users?.map( user => [
      user.name,
      user.email,
      user.phone || '',
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      new Date( user.createdAt ).toLocaleDateString(),
    ] ) || []

    const headers = [ 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined' ]
    const csvContent = [ headers, ...csvData ].map( row => row.join( ',' ) ).join( '\n' )
    const blob = new Blob( [ csvContent ], { type: 'text/csv' } )
    const url = URL.createObjectURL( blob )
    const a = document.createElement( 'a' )
    a.href = url
    a.download = `users-${ new Date().toISOString().split( 'T' )[ 0 ] }.csv`
    a.click()
    URL.revokeObjectURL( url )
    toast.success( 'Users exported' )
  }

  const stats = {
    total: users?.length || 0,
    admins: users?.filter( u => u.role === 'admin' ).length || 0,
    customers: users?.filter( u => u.role === 'user' ).length || 0,
    active: users?.filter( u => u.isActive ).length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all registered users</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowAddModal( true )} className="flex items-center gap-2">
            <FiUserPlus /> Add User
          </Button>
          <Button onClick={handleExportUsers} variant="outline" className="flex items-center gap-2">
            <FiDownload /> Export
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.customers}</p>
          <p className="text-sm text-gray-500">Customers</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-purple-500">{stats.admins}</p>
          <p className="text-sm text-gray-500">Admins</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
          <p className="text-sm text-gray-500">Active Users</p>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error?.response?.data?.message || error?.message || 'Could not load users. Check that the server and MongoDB are running.'}
        </div>
      )}

      <AdminUsersTable
        users={users}
        loading={isLoading}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal( false )} title="Add New User" size="md">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={( e ) => setFormData( { ...formData, name: e.target.value } )}
            required
          />
          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={( e ) => setFormData( { ...formData, email: e.target.value } )}
            required
          />
          <Input
            label="Password *"
            type="password"
            name="password"
            value={formData.password}
            onChange={( e ) => setFormData( { ...formData, password: e.target.value } )}
            required
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={( e ) => setFormData( { ...formData, phone: e.target.value } )}
          />
          <select
            value={formData.role}
            onChange={( e ) => setFormData( { ...formData, role: e.target.value } )}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="user">Customer</option>
            <option value="admin">Administrator</option>
          </select>
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={createMutation.isLoading}>
              {createMutation.isLoading ? 'Creating...' : 'Create User'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddModal( false )}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users