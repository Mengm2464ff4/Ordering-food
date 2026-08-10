import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AdminRoute from '../components/auth/AdminRoute'

// Admin Pages
import Dashboard from '../pages/admin/Dashboard'
import Foods from '../pages/admin/Foods'
import Orders from '../pages/admin/Orders'
import Payments from '../pages/admin/Payments'
import Users from '../pages/admin/Users'
import Reviews from '../pages/admin/Reviews'
import Settings from '../pages/admin/Settings'

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="foods" element={<Foods />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="users" element={<Users />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AdminRoutes