import React, { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFoodReviews, createReview, deleteReview } from '../../api/reviewApi'
import { AuthContext } from '../../context/AuthContext'
import { FiStar, FiTrash2, FiUser, FiClock } from 'react-icons/fi'
import Button from '../common/Button'
import Input from '../common/Input'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import toast from 'react-hot-toast'

const FoodReview = ({ foodId }) => {
  const { user } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', foodId],
    queryFn: () => getFoodReviews(foodId),
  })

  const createReviewMutation = useMutation(
    (reviewData) => createReview(reviewData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', foodId])
        queryClient.invalidateQueries(['food', foodId])
        setComment('')
        setRating(5)
        toast.success('Review submitted successfully!')
        setIsSubmitting(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit review')
        setIsSubmitting(false)
      }
    }
  )

  const deleteReviewMutation = useMutation(
    (reviewId) => deleteReview(reviewId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reviews', foodId])
        queryClient.invalidateQueries(['food', foodId])
        toast.success('Review deleted successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete review')
      }
    }
  )

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to submit a review')
      return
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment')
      return
    }
    
    setIsSubmitting(true)
    createReviewMutation.mutate({
      foodId,
      rating,
      comment,
    })
  }

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const averageRating = reviews?.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews?.filter(r => Math.floor(r.rating) === star).length || 0,
    percentage: reviews?.length ? (reviews.filter(r => Math.floor(r.rating) === star).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      {reviews && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b">
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500">{averageRating}</div>
            <div className="flex items-center justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`text-2xl ${
                    star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-gray-500 mt-2">Based on {reviews.length} reviews</div>
          </div>

          <div>
            {ratingDistribution.map(({ star, percentage }) => (
              <div key={star} className="flex items-center gap-2 mb-2">
                <div className="w-12 text-sm">{star} stars</div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-500">{percentage.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {user && (
        <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Write a Review</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <FiStar
                    className={`text-3xl transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Your Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Share your experience with this dish..."
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <Loader />
      ) : !reviews || reviews.length === 0 ? (
        <EmptyState
          title="No Reviews Yet"
          message="Be the first to review this dish!"
          icon="heart"
        />
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b last:border-b-0 pb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                      <FiUser className="text-white" size={16} />
                    </div>
                    <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`text-sm ${
                            star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiClock size={12} />
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                
                {(user?.role === 'admin' || user?._id === review.user?._id) && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 mt-2">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((image, idx) => (
                    <img key={idx} src={image} alt="" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FoodReview