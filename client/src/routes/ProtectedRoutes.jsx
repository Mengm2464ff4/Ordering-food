import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import CheckoutLayout from '../layouts/CheckoutLayout'

// Protected Pages
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Payment from '../pages/Payment'
import Orders from '../pages/Orders'
import OrderDetails from '../pages/OrderDetails'
import Profile from '../pages/Profile'

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        {/* Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Routes with CheckoutLayout */}
        <Route element={<CheckoutLayout />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment/:orderId" element={<Payment />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default ProtectedRoutes