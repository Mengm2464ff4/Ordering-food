import React, { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFoodById } from '../../api/foodApi'
import { CartContext } from '../../context/CartContext'
import { FiStar, FiClock, FiInfo, FiShoppingCart, FiMinus, FiPlus, FiCheck } from 'react-icons/fi'
import Loader from '../common/Loader'
import ErrorMessage from '../common/ErrorMessage'
import FoodReview from './FoodReview'
import toast from 'react-hot-toast'
import { generateImageUrl, handleImageError } from '../../utils/generateImageUrl'

const FoodDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useContext(CartContext)
  const [quantity, setQuantity] = useState(1)
  const [selectedTab, setSelectedTab] = useState('details')

  const { data: food, isLoading, error, refetch } = useQuery({
    queryKey: ['food', id],
    queryFn: () => getFoodById(id),
    enabled: !!id,
  })

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (food && food.isAvailable) {
      addToCart(food, quantity)
      toast.success(`Added ${quantity} x ${food.name} to cart!`)
      setQuantity(1)
    }
  }

  const handleBuyNow = () => {
    if (food && food.isAvailable) {
      addToCart(food, quantity)
      navigate('/cart')
    }
  }

  if (isLoading) return <Loader />
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />
  if (!food) return <ErrorMessage message="Food not found" />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          
          {/* Image Section */}
          <div className="relative h-96 lg:h-auto min-h-[400px]">
            <img 
              src={generateImageUrl(food.image)} 
              alt={food.name} 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => handleImageError(e, 'food')}
            />
            {!food.isAvailable && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-2xl font-bold px-6 py-3 bg-red-500 rounded-full shadow-lg">
                  Currently Unavailable
                </span>
              </div>
            )}
            {food.isPopular && (
              <div className="absolute top-6 left-6">
                <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  🔥 Popular
                </span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 sm:p-10 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">{food.name}</h1>
            
            <div className="flex items-center mb-6 bg-gray-50 w-fit px-3 py-1.5 rounded-lg">
              <div className="flex items-center">
                <FiStar className="text-yellow-400 fill-current" />
                <span className="text-lg ml-1 font-bold text-gray-800">{food.rating || 0}</span>
              </div>
              <span className="mx-3 text-gray-300">|</span>
              <span className="text-gray-600 font-medium">{food.numReviews || 0} reviews</span>
              <span className="mx-3 text-gray-300">|</span>
              <span className="text-gray-600 font-medium capitalize">{food.category}</span>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-extrabold text-orange-500">${food.price}</span>
              {food.oldPrice && (
                <span className="text-xl text-gray-400 line-through ml-3">${food.oldPrice}</span>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed text-lg">{food.description}</p>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setSelectedTab('details')}
                  className={`pb-3 px-1 font-semibold transition-colors ${selectedTab === 'details' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  <FiInfo className="inline mr-2" /> Details
                </button>
                <button
                  onClick={() => setSelectedTab('ingredients')}
                  className={`pb-3 px-1 font-semibold transition-colors ${selectedTab === 'ingredients' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Ingredients
                </button>
              </div>
            </div>

            <div className="mb-8 min-h-[80px]">
              {selectedTab === 'details' && (
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700 font-medium">
                    <FiClock className="mr-3 text-orange-500 text-lg" />
                    <span>Preparation time: {food.preparationTime || 15} minutes</span>
                  </div>
                  <div className="flex items-center text-gray-700 font-medium">
                    <FiCheck className="mr-3 text-green-500 text-lg" />
                    <span>Fresh ingredients guaranteed</span>
                  </div>
                </div>
              )}
              {selectedTab === 'ingredients' && (
                <div>
                  <p className="text-gray-600 leading-relaxed">
                    {food.ingredients && food.ingredients.length > 0 
                      ? food.ingredients.join(', ') 
                      : 'Ingredients information not available'}
                  </p>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            {food.isAvailable && (
              <>
                <div className="flex items-center space-x-6 mb-8">
                  <span className="font-bold text-gray-900 text-lg">Quantity:</span>
                  <div className="flex items-center space-x-4 bg-gray-50 rounded-xl p-1 border border-gray-200">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition text-gray-700"
                    >
                      <FiMinus />
                    </button>
                    <span className="text-xl font-bold w-8 text-center text-gray-900">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition text-gray-700"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 border-2 border-orange-500 text-orange-500 py-4 rounded-xl font-bold hover:bg-orange-50 transition-all text-lg"
                  >
                    Buy Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section with ID for scrolling */}
      <div id="reviews" className="mt-12 scroll-mt-24">
        <FoodReview foodId={food._id} />
      </div>
    </div>
  )
}

export default FoodDetails