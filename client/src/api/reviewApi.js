import axios from './axios'

export const getFoodReviews = async (foodId) => {
  const { data } = await axios.get(`/reviews/food/${foodId}`)
  return data
}

export const createReview = async (reviewData) => {
  const { data } = await axios.post('/reviews', reviewData)
  return data
}

export const deleteReview = async (reviewId) => {
  const { data } = await axios.delete(`/reviews/${reviewId}`)
  return data
}