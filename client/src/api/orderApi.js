import axios from './axios'

export const createOrder = async (orderData) => {
  const { data } = await axios.post('/orders', orderData)
  return data
}

export const getOrderById = async (id) => {
  const { data } = await axios.get(`/orders/${id}`)
  return data
}

export const getMyOrders = async () => {
  const { data } = await axios.get('/orders/myorders')
  return data
}

export const updateOrderStatus = async (id, status) => {
  const { data } = await axios.put(`/orders/${id}/status`, { status })
  return data
}

export const cancelOrder = async (id) => {
  const { data } = await axios.put(`/orders/${id}/cancel`)
  return data
}

export const updateOrderToPaid = async (id, paymentResult) => {
  const { data } = await axios.put(`/orders/${id}/pay`, paymentResult)
  return data
}

// Admin only
export const getAllOrders = async (params = {}) => {
  const { data } = await axios.get('/orders', { params })
  return data
}