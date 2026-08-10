import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  // Directly check localStorage instead of using AuthContext
  const userInfo = localStorage.getItem('userInfo')
  
  if (!userInfo) {
    return <Navigate to="/login" replace />
  }
  
  try {
    const user = JSON.parse(userInfo)
    if (!user?.token) {
      return <Navigate to="/login" replace />
    }
    if (String(user.token).startsWith('mock-token-')) {
      return <Navigate to="/login" replace />
    }
    if (user.role !== 'admin') {
      return <Navigate to="/" replace />
    }
  } catch (e) {
    return <Navigate to="/login" replace />
  }
  
  return children || <Outlet />
}

export default AdminRoute