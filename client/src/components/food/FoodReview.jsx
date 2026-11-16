import React, { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFoodReviews, createReview, deleteReview } from '../../api/reviewApi'
import { AuthContext } from '../../context/AuthContext'
import { FiStar, FiTrash2, FiUser, FiClock, FiMessageSquare } from 'react-icons/fi'
import Button from '../common/Button'
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
    if (!user) return toast.error('Please login to submit a review')
    if (!comment.trim()) return toast.error('Please enter a comment')
    
    setIsSubmitting(true)
    createReviewMutation.mutate({ foodId, rating, comment })
  }

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <FiMessageSquare className="text-orange-500" /> Customer Reviews
      </h2>

      {/* Rating Summary */}
      {reviews && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b border-gray-100">
          <div className="flex flex-col items-center justify-center bg-orange-50 rounded-2xl p-6">
            <div className="text-6xl font-extrabold text-orange-500">{averageRating}</div>
            <div className="flex items-center mt-3 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`text-2xl ${
                    star <= averageRating ? 'text-orange-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-gray-600 font-medium">Based on {reviews.length} reviews</div>
          </div>

          <div className="flex flex-col justify-center">
            {ratingDistribution.map(({ star, percentage }) => (
              <div key={star} className="flex items-center gap-3 mb-2.5">
                <div className="w-12 text-sm font-medium text-gray-700">{star} star</div>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-10 text-sm text-gray-500 text-right">{percentage.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {user && (
        <form onSubmit={handleSubmitReview} className="mb-10 bg-gray-50 border border-gray-100 p-6 rounded-2xl">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Write a Review</h3>
          
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <FiStar
                    className={`text-4xl transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-orange-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white resize-none transition-all"
              placeholder="Share your experience with this dish..."
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl shadow-sm">
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
        <div className="space-y-8">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 last:border-0 pb-8 last:pb-0">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                    <FiUser className="text-white" size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block">{review.user?.name || 'Anonymous'}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`text-sm ${
                              star <= review.rating ? 'text-orange-400 fill-current' : 'text-gray-200'
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
                </div>
                
                {(user?.role === 'admin' || user?._id === review.user?._id) && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete review"
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 mt-3 leading-relaxed sm:ml-13">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-4 sm:ml-13">
                  {review.images.map((image, idx) => (
                    <img 
                      key={idx} 
                      src={image} 
                      alt="Review" 
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm" 
                    />
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