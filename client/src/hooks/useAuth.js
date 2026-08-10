import { useContext, useCallback } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const { user, login, register, logout, updateProfile, isAdmin, isAuthenticated, loading, error } = context
  const navigate = useNavigate()

  // Login with redirect
  const loginWithRedirect = useCallback(async (email, password, redirectPath = '/') => {
    const success = await login(email, password)
    if (success) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate(redirectPath)
      }
    }
    return success
  }, [login, navigate, user])

  // Register with redirect
  const registerWithRedirect = useCallback(async (userData, redirectPath = '/') => {
    const success = await register(userData)
    if (success) {
      navigate(redirectPath)
    }
    return success
  }, [register, navigate])

  // Logout with redirect
  const logoutWithRedirect = useCallback(async (redirectPath = '/') => {
    await logout()
    navigate(redirectPath)
  }, [logout, navigate])

  // Get user full name
  const getUserFullName = useCallback(() => {
    return user?.name || 'Guest'
  }, [user])

  // Get user email
  const getUserEmail = useCallback(() => {
    return user?.email || ''
  }, [user])

  // Get user avatar initials
  const getUserInitials = useCallback(() => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [user])

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false
    if (user.role === 'admin') return true
    // Add more permission checks as needed
    return false
  }, [user])

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    
    // Auth methods
    login,
    register,
    logout,
    updateProfile,
    
    // Extended methods
    loginWithRedirect,
    registerWithRedirect,
    logoutWithRedirect,
    
    // User info helpers
    getUserFullName,
    getUserEmail,
    getUserInitials,
    hasPermission,
  }
}