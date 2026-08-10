import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi'
import { CartContext } from '../../context/CartContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { generateImageUrl, handleImageError } from '../../utils/generateImageUrl'

const FoodCard = ({ food }) => {
  const { addToCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)

  const handleAddToCart = () => {
    addToCart(food, 1)
    toast.success(`${food.name} added to cart!`)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Image Container */}
      <Link to={`/food/${food._id}`} className="relative block overflow-hidden h-48">
        <img 
          src={generateImageUrl(food.image)} 
          alt={food.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => handleImageError(e, 'food')}
        />
        {!food.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold px-3 py-1 bg-red-500 rounded-full">Out of Stock</span>
          </div>
        )}
        {food.isPopular && (
          <div className="absolute top-2 left-2">
            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Popular
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/food/${food._id}`}>
          <h3 className="text-lg font-semibold mb-1 hover:text-orange-500 transition line-clamp-1">
            {food.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {food.description}
        </p>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <FiStar className="text-yellow-400 fill-current" />
            <span className="text-sm ml-1 font-medium">{food.rating || 0}</span>
          </div>
          <span className="text-gray-400 text-xs ml-2">
            ({food.numReviews || 0} reviews)
          </span>
        </div>

        {/* Price and Actions */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-orange-500">${food.price}</span>
            {food.oldPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">${food.oldPrice}</span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!food.isAvailable}
            className={`p-2 rounded-full transition-all duration-200 ${
              food.isAvailable 
                ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-110' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default FoodCard