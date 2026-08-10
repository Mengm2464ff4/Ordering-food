import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import CheckoutLayout from '../layouts/CheckoutLayout'

// Public Pages
import Home from '../pages/Home'
import Menu from '../pages/Menu'
import FoodDetails from '../pages/FoodDetails'
import About from '../pages/About'
import Contact from '../pages/Contact'
import NotFound from '../pages/NotFound'

// Auth Pages
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../components/auth/ForgotPassword'

// Protected Pages
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Payment from '../pages/Payment'
import Orders from '../pages/Orders'
import OrderDetails from '../pages/OrderDetails'
import Profile from '../pages/Profile'

// Admin Pages
import Dashboard from '../pages/admin/Dashboard'
import Foods from '../pages/admin/Foods'
import OrdersAdmin from '../pages/admin/Orders'
import Payments from '../pages/admin/Payments'
import Users from '../pages/admin/Users'
import Reviews from '../pages/admin/Reviews'
import Settings from '../pages/admin/Settings'

// Route Guards
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminRoute from '../components/auth/AdminRoute'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth Routes without Navbar */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Routes (Requires Authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Checkout Flow with special layout */}
        <Route element={<CheckoutLayout />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/:orderId" element={<Payment />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/foods" element={<Foods />} />
          <Route path="/admin/orders" element={<OrdersAdmin />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/reviews" element={<Reviews />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes