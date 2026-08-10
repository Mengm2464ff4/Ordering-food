import React, { useState } from 'react'
import FoodCard from './FoodCard'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import Pagination from '../common/Pagination'
import { generateImageUrl, handleImageError } from '../../utils/generateImageUrl'

const FoodList = ({ foods, loading, pagination, onPageChange }) => {
  const [viewMode, setViewMode] = useState('grid') // grid or list

  if (loading) {
    return <Loader />
  }

  if (!foods || foods.length === 0) {
    return (
      <EmptyState
        title="No foods found"
        message="Try adjusting your search or filter to find what you're looking for."
        icon="search"
      />
    )
  }

  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Food Items */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {foods.map((food) => (
            <FoodListItem key={food._id} food={food} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}

// List view item component
const FoodListItem = ({ food }) => {
  const { addToCart } = useContext(CartContext)
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4">
      <Link to={`/food/${food._id}`} className="sm:w-32 h-32">
        <img
          src={generateImageUrl(food.image)}
          alt={food.name}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => handleImageError(e, 'food')}
        />
      </Link>
      <div className="flex-1">
        <Link to={`/food/${food._id}`}>
          <h3 className="text-xl font-semibold hover:text-orange-500">{food.name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mt-1">{food.description}</p>
        <div className="flex items-center mt-2">
          <FiStar className="text-yellow-400 fill-current" />
          <span className="text-sm ml-1">{food.rating || 0}</span>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="text-2xl font-bold text-orange-500">${food.price}</span>
          <button
            onClick={() => addToCart(food, 1)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default FoodList