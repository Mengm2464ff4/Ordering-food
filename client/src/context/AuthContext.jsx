import React, { createContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  login as loginApi,
  register as registerApi,
  getProfile,
  updateProfile as updateProfileApi
} from '../api/authApi'

export const AuthContext = createContext()

/** Profile API does not return JWT — keep token from login when refreshing user. */
const mergeUserSession = (profile, token) => {
  if (!profile) return null
  const savedToken = token || profile.token
  return savedToken ? { ...profile, token: savedToken } : profile
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      const storedUser = localStorage.getItem('userInfo')

      if (!storedUser) {
        setLoading(false)
        return
      }

      try {
        const parsedUser = JSON.parse(storedUser)
        const savedToken = parsedUser?.token

        if (!savedToken) {
          localStorage.removeItem('userInfo')
          setUser(null)
          setLoading(false)
          return
        }

        setUser(parsedUser)

        const isMockSession = String(savedToken).startsWith('mock-token-')
        if (!isMockSession) {
          const freshProfile = await getProfile()
          const merged = mergeUserSession(freshProfile, savedToken)
          setUser(merged)
          localStorage.setItem('userInfo', JSON.stringify(merged))
        }
      } catch (error) {
        localStorage.removeItem('userInfo')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [])

  const login = async (email, password) => {
    try {
      const userData = await loginApi(email, password)

      if (String(userData?.token || '').startsWith('mock-token-')) {
        toast.error('Server is offline. Please start the backend and log in again.')
        return null
      }

      setUser(userData)
      localStorage.setItem('userInfo', JSON.stringify(userData))
      toast.success('Login successful')
      return userData
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to login')
      return null
    }
  }

  const register = async (userData) => {
    try {
      const newUser = await registerApi(userData)
      setUser(newUser)
      localStorage.setItem('userInfo', JSON.stringify(newUser))
      toast.success('Registration successful')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to register')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('userInfo')
    toast.success('Logged out')
  }

  const updateProfile = async (data) => {
    try {
      const updatedProfile = await updateProfileApi(data)
      const merged = mergeUserSession(updatedProfile, user?.token)
      setUser(merged)
      localStorage.setItem('userInfo', JSON.stringify(merged))
      toast.success('Profile updated')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile')
      return false
    }
  }

  const isAdmin = () => user?.role === 'admin'
  const isAuthenticated = () => !!user
  const getToken = () => user?.token

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAdmin,
      isAuthenticated,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}