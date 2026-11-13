import axios from './axios'

export const login = async (email, password) => {
  const { data } = await axios.post('/auth/login', { email, password })

  // Save user + token
  localStorage.setItem('userInfo', JSON.stringify(data))
  return data
}

export const register = async (userData) => {
  const { data } = await axios.post('/auth/register', userData)
  // Save user + token
  localStorage.setItem('userInfo', JSON.stringify(data))
  return data
}

export const getProfile = async () => {
  const { data } = await axios.get('/auth/profile')
  return data
}

export const updateProfile = async (userData) => {
  const { data } = await axios.put('/auth/profile', userData)
  return data
}

export const changePassword = async (data) => {
  const { data: response } = await axios.put('/auth/change-password', data)
  return response
}

export const forgotPassword = async (email) => {
  const { data } = await axios.post('/auth/forgot-password', { email })
  return data
}

export const resetPassword = async (token, newPassword) => {
  const { data } = await axios.post('/auth/reset-password', { token, newPassword })
  return data
}
