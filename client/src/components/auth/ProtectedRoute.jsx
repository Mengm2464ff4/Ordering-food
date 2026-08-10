import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import Loader from '../common/Loader'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (requireAuth && !user) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />
  }

  if (!requireAuth && user) {
    // Redirect to home if already logged in
    return <Navigate to="/" replace />
  }

  return children || <Outlet />
}

export default ProtectedRoute