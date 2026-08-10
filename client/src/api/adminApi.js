import axios from './axios'

/** Ensure list endpoints always return an array (avoids rendering raw API/Mongo objects). */
export const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.foods)) return data.foods
  return []
}

/** Map MongoDB user documents to safe display fields. */
export const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return null
  const id = user._id || user.id
  return {
    _id: typeof id === 'object' && id?.toString ? id.toString() : String(id || ''),
    name: user.name || 'Unknown',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    isActive: user.isActive !== false,
    createdAt: user.createdAt,
    address: user.address,
    username: user.username,
  }
}

// Dashboard Stats
export const getDashboardStats = async () => {
  const { data } = await axios.get('/admin/stats')
  return data
}

export const getRevenueChart = async (days = 30) => {
  const { data } = await axios.get(`/admin/charts/revenue?days=${days}`)
  return data
}

export const getTopSellingFoods = async () => {
  const { data } = await axios.get('/admin/charts/top-foods')
  return data
}

// Food Management
export const getFoods = async (params = {}) => {
  const { data } = await axios.get('/foods', { params })
  return data
}

export const createFood = async (foodData) => {
  const { data } = await axios.post('/foods', foodData)
  return data
}

export const updateFood = async (id, foodData) => {
  const { data } = await axios.put(`/foods/${id}`, foodData)
  return data
}

export const deleteFood = async (id) => {
  const { data } = await axios.delete(`/foods/${id}`)
  return data
}

export const toggleFoodAvailability = async (id, isAvailable) => {
  const { data } = await axios.put(`/foods/${id}/toggle`, { isAvailable })
  return data
}

// Order Management
export const getOrders = async (params = {}) => {
  const { data } = await axios.get('/orders', { params })
  return data
}

export const updateOrderStatus = async (id, status) => {
  const { data } = await axios.put(`/orders/${id}/status`, { status })
  return data
}

// User Management
export const getUsers = async () => {
  const { data } = await axios.get('/users')
  return normalizeList(data).map(normalizeUser).filter(Boolean)
}

export const getUserById = async (id) => {
  const { data } = await axios.get(`/users/${id}`)
  return data
}

export const updateUser = async (id, userData) => {
  const { data } = await axios.put(`/users/${id}`, userData)
  return data
}

export const deleteUser = async (id) => {
  const { data } = await axios.delete(`/users/${id}`)
  return data
}

export const createUser = async (userData) => {
  const { data } = await axios.post('/users', userData)
  return data
}

export const toggleUserStatus = async (id, isActive) => {
  const { data } = await axios.put(`/users/${id}/toggle-status`, { isActive })
  return data
}

// Payment Management
export const getPayments = async (params = {}) => {
  const { data } = await axios.get('/payments', { params })
  return data
}

// Review Management
export const getReviews = async () => {
  const { data } = await axios.get('/reviews')
  return data
}

export const deleteReview = async (id) => {
  const { data } = await axios.delete(`/reviews/${id}`)
  return data
}

export const moderateReview = async (id, isApproved) => {
  const { data } = await axios.put(`/reviews/${id}/moderate`, { isApproved })
  return data
}