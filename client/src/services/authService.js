import axios from '../api/axios'

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token'
    this.userKey = 'user_info'
  }

  // Store authentication data
  setAuthData(token, user) {
    localStorage.setItem(this.tokenKey, token)
    localStorage.setItem(this.userKey, JSON.stringify(user))
    this.setAuthHeader(token)
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  // Get stored user
  getUser() {
    const userStr = localStorage.getItem(this.userKey)
    return userStr ? JSON.parse(userStr) : null
  }

  // Set authorization header for axios
  setAuthHeader(token) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
    this.setAuthHeader(null)
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken()
    const user = this.getUser()
    return !!(token && user)
  }

  // Check if user is admin
  isAdmin() {
    const user = this.getUser()
    return user?.role === 'admin'
  }

  // Get user role
  getUserRole() {
    const user = this.getUser()
    return user?.role || 'guest'
  }

  // Login user
  async login(email, password) {
    try {
      const response = await axios.post('/auth/login', { email, password })
      const { token, ...user } = response.data
      this.setAuthData(token, user)
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await axios.post('/auth/register', userData)
      const { token, ...user } = response.data
      this.setAuthData(token, user)
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  // Logout user
  async logout() {
    try {
      // Optional: Call logout endpoint
      await axios.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuthData()
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await axios.get('/auth/profile')
      return { success: true, user: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get profile' 
      }
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await axios.put('/auth/profile', profileData)
      const user = response.data
      localStorage.setItem(this.userKey, JSON.stringify(user))
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      }
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      await axios.put('/auth/change-password', { currentPassword, newPassword })
      return { success: true, message: 'Password changed successfully' }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to change password' 
      }
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      await axios.post('/auth/forgot-password', { email })
      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send reset email' 
      }
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      await axios.post('/auth/reset-password', { token, newPassword })
      return { success: true, message: 'Password reset successfully' }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reset password' 
      }
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await axios.post('/auth/refresh-token')
      const { token } = response.data
      this.setAuthData(token, this.getUser())
      return { success: true, token }
    } catch (error) {
      this.clearAuthData()
      return { success: false, error: 'Session expired' }
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      await axios.post('/auth/verify-email', { token })
      return { success: true, message: 'Email verified successfully' }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to verify email' 
      }
    }
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      await axios.post('/auth/resend-verification', { email })
      return { success: true, message: 'Verification email sent' }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send verification email' 
      }
    }
  }
}

export default new AuthService()