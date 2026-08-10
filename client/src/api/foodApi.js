import axios from './axios'

export const getFoods = async (params = {}) => {
  const { data } = await axios.get('/foods', { params })
  return data
}

export const getFoodById = async (id) => {
  const { data } = await axios.get(`/foods/${id}`)
  return data
}

export const getPopularFoods = async () => {
  const { data } = await axios.get('/foods/popular')
  return data
}

export const getCategories = async () => {
  const { data } = await axios.get('/foods/categories/all')
  return data
}

// Admin only
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