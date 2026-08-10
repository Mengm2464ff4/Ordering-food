import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFoods, getCategories } from '../api/foodApi'
import FoodCard from '../components/food/FoodCard'
import FoodSearch from '../components/food/FoodSearch'
import Loader from '../components/common/Loader'
import { CartContext } from '../context/CartContext'
import { FiGrid, FiList, FiFilter, FiX } from 'react-icons/fi'
import { generateImageUrl, handleImageError } from '../utils/generateImageUrl'

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('-createdAt')
  const [viewMode, setViewMode] = useState('grid')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 })
  const [showFilters, setShowFilters] = useState(false)
    
  const [currentPage, setCurrentPage] = useState(1) // 👈 ADD THIS HERE
 
const { data: foodsData, isLoading } = useQuery({
  queryKey: ['foods', selectedCategory, searchTerm, sortBy, priceRange.min, priceRange.max, currentPage],
  queryFn: () => getFoods({
    category: selectedCategory,
    search: searchTerm,
    sort: sortBy,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    page: currentPage
  }),
})

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setSearchParams({ category: selectedCategory })
    } else {
      setSearchParams({})
    }
  }, [selectedCategory, setSearchParams])

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-rating', label: 'Top Rated' },
    { value: 'name', label: 'Name: A to Z' },
  ]

  const clearFilters = () => {
    setSelectedCategory('all')
    setSearchTerm('')
    setSortBy('-createdAt')
    setPriceRange({ min: 0, max: 100 })
  }

  const hasActiveFilters = selectedCategory !== 'all' || searchTerm || sortBy !== '-createdAt' || priceRange.min > 0 || priceRange.max < 100

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">Our Menu</h1>
        <p className="text-gray-600">Discover delicious dishes from our kitchen</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <FoodSearch onSearch={setSearchTerm} initialValue={searchTerm} />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
            >
              <FiFilter />
              Filters
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === 'all' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {categories?.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategory === category 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-24 px-3 py-1 border rounded"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-24 px-3 py-1 border rounded"
                  />
                </div>
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  <FiX /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        Found {foodsData?.total || 0} items
      </div>

      {/* Food Grid/List */}
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {foodsData?.foods.map(food => (
                <FoodCard key={food._id} food={food} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {foodsData?.foods.map(food => (
                <FoodListItem key={food._id} food={food} />
              ))}
            </div>
          )}
          
          {foodsData?.foods.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No foods found matching your criteria</p>
              <button onClick={clearFilters} className="mt-4 text-orange-500 hover:text-orange-600">
                Clear all filters
              </button>
            </div>
          )}
          
          {/* Pagination */}
          {foodsData && foodsData.pages > 1 && (
            <Pagination 
              currentPage={foodsData.page}
              totalPages={foodsData.pages}
              // onPageChange={(page) => refetch()}
               onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </div>
  )
}

// List view item component
const FoodListItem = ({ food }) => {
  const { addToCart } = React.useContext(CartContext)
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg transition">
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
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{food.description}</p>
        <div className="flex items-center mt-2">
          <span className="text-yellow-500">★</span>
          <span className="text-sm ml-1">{food.rating || 0}</span>
          <span className="text-gray-400 text-sm ml-2">({food.numReviews || 0} reviews)</span>
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 3))
  
  return (
    <div className="flex justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
      >
        Previous
      </button>
      
      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 border rounded-lg ${
            currentPage === page ? 'bg-orange-500 text-white border-orange-500' : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  )
}

export default Menu