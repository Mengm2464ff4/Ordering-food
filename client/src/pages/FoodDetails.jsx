import React, { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFoodById } from '../api/foodApi'
import { CartContext } from '../context/CartContext'
import { FiStar, FiClock, FiInfo, FiShoppingCart, FiMinus, FiPlus, FiCheck, FiTruck, FiShield } from 'react-icons/fi'
import Loader from '../components/common/Loader'
import ErrorMessage from '../components/common/ErrorMessage'
import FoodReview from '../components/food/FoodReview'
import toast from 'react-hot-toast'
import { generateImageUrl, handleImageError } from '../utils/generateImageUrl'

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
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        <span className="hover:text-orange-500 cursor-pointer" onClick={() => navigate('/')}>Home</span>
        {' / '}
        <span className="hover:text-orange-500 cursor-pointer" onClick={() => navigate('/menu')}>Menu</span>
        {' / '}
        <span className="text-gray-700">{food.name}</span>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative">
            <img 
              src={generateImageUrl(food.image)} 
              alt={food.name} 
              className="w-full h-96 lg:h-full object-cover"
              onError={(e) => handleImageError(e, 'food')}
            />
            {!food.isAvailable && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white text-2xl font-bold px-6 py-3 bg-red-500 rounded-full">
                  Currently Unavailable
                </span>
              </div>
            )}
            {food.isPopular && (
              <div className="absolute top-4 left-4">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  🔥 Popular
                </span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{food.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <FiStar className="text-yellow-400 fill-current" />
                <span className="text-lg ml-1 font-semibold">{food.rating || 0}</span>
              </div>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-600">{food.numReviews || 0} reviews</span>
              <span className="mx-2 text-gray-300">|</span>
              <span className="text-gray-600">{food.category}</span>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-orange-500">${food.price}</span>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">{food.description}</p>

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiTruck className="text-orange-500" />
                <span>Free delivery on orders over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-orange-500" />
                <span>{food.preparationTime || 15} min</span>
              </div>
              <div className="flex items-center gap-2">
                <FiShield className="text-orange-500" />
                <span>Fresh guarantee</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-4">
              <div className="flex space-x-6">
                <button
                  onClick={() => setSelectedTab('details')}
                  className={`pb-2 px-1 font-medium transition ${
                    selectedTab === 'details' 
                      ? 'border-b-2 border-orange-500 text-orange-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiInfo className="inline mr-1" /> Details
                </button>
                <button
                  onClick={() => setSelectedTab('ingredients')}
                  className={`pb-2 px-1 font-medium transition ${
                    selectedTab === 'ingredients' 
                      ? 'border-b-2 border-orange-500 text-orange-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setSelectedTab('nutrition')}
                  className={`pb-2 px-1 font-medium transition ${
                    selectedTab === 'nutrition' 
                      ? 'border-b-2 border-orange-500 text-orange-500' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Nutrition Info
                </button>
              </div>
            </div>

            <div className="mb-6 min-h-[100px]">
              {selectedTab === 'details' && (
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FiCheck className="mr-2 text-green-500" />
                    <span>100% fresh ingredients</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiCheck className="mr-2 text-green-500" />
                    <span>Prepared in hygienic kitchen</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiCheck className="mr-2 text-green-500" />
                    <span>Temperature controlled delivery</span>
                  </div>
                </div>
              )}
              {selectedTab === 'ingredients' && (
                <div>
                  <p className="text-gray-600">
                    {food.ingredients && food.ingredients.length > 0 
                      ? food.ingredients.join(', ') 
                      : 'Ingredients information not available'}
                  </p>
                </div>
              )}
              {selectedTab === 'nutrition' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Calories</p>
                    <p className="font-semibold">~350 kcal</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Protein</p>
                    <p className="font-semibold">~25g</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            {food.isAvailable && (
              <>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="font-semibold">Quantity:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                    >
                      <FiMinus />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 border-2 border-orange-500 text-orange-500 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
                  >
                    Buy Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <FoodReview foodId={food._id} />
      </div>
    </div>
  )
}

export default FoodDetails