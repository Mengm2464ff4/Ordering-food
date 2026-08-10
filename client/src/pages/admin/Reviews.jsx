import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'  // Changed
import { getReviews, deleteReview, moderateReview } from '../../api/adminApi'
import { FiStar, FiTrash2, FiCheck, FiX, FiMessageSquare, FiUser } from 'react-icons/fi'
import Loader from '../../components/common/Loader'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
// ... rest of your code
const Reviews = () => {
  const queryClient = useQueryClient()
  const [selectedReview, setSelectedReview] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [filterRating, setFilterRating] = useState('all')

 const { data: reviews, isLoading } = useQuery({
  queryKey: ['adminReviews'],
  queryFn: getReviews
})

  const deleteMutation = useMutation(deleteReview, {
    onSuccess: () => {
      queryClient.invalidateQueries('adminReviews')
      toast.success('Review deleted successfully')
    },
  })

  const moderateMutation = useMutation(({ id, isApproved }) => moderateReview(id, isApproved), {
    onSuccess: () => {
      queryClient.invalidateQueries('adminReviews')
      toast.success('Review moderated successfully')
    },
  })

  const filteredReviews = reviews?.filter(review => {
    if (filterRating === 'all') return true
    return review.rating === parseInt(filterRating)
  })

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleModerate = (id, isApproved) => {
    moderateMutation.mutate({ id, isApproved })
  }

  const averageRating = reviews?.length 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews?.filter(r => Math.floor(r.rating) === star).length || 0,
    percentage: reviews?.length ? (reviews.filter(r => Math.floor(r.rating) === star).length / reviews.length) * 100 : 0,
  }))

  if (isLoading) return <Loader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-500 mt-1">Monitor and manage customer reviews</p>
      </div>

      {/* Rating Overview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-500">{averageRating}</div>
            <div className="flex items-center justify-center mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar key={star} className={`text-2xl ${star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <div className="text-gray-500 mt-2">Based on {reviews?.length || 0} reviews</div>
          </div>
          <div>
            {ratingDistribution.map(({ star, percentage }) => (
              <div key={star} className="flex items-center gap-2 mb-2">
                <div className="w-12 text-sm">{star} stars</div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <div className="w-12 text-sm text-gray-500">{percentage.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['all', 5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating.toString())}
              className={`px-3 py-1 rounded-full text-sm ${
                filterRating === rating.toString()
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {rating === 'all' ? 'All' : `${rating} ★`}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {filteredReviews?.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews?.map((review) => (
          <div key={review._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                    <FiUser className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{review.food?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <FiStar key={star} className={`text-lg ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedReview(review)
                    setIsViewModalOpen(true)
                  }}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                >
                  <FiMessageSquare />
                </button>
                <button
                  onClick={() => handleModerate(review._id, !review.isApproved)}
                  className={`p-2 rounded-lg ${
                    review.isApproved 
                      ? 'text-green-500 hover:bg-green-50' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {review.isApproved ? <FiCheck /> : <FiX />}
                </button>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No reviews found</p>
        </div>
      )}

      {/* View Review Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Review Details" size="md">
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <img src={selectedReview.food?.image} alt="" className="w-16 h-16 object-cover rounded" />
              <div>
                <p className="font-semibold">{selectedReview.food?.name}</p>
                <p className="text-sm text-gray-500">Customer: {selectedReview.user?.name}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <FiStar key={star} className={`text-xl ${star <= selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Review</label>
              <p className="mt-1 text-gray-700">{selectedReview.comment}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <p className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${selectedReview.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {selectedReview.isApproved ? 'Approved' : 'Pending'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Reviews