import React, { useState, useEffect } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

const FoodSearch = ({ onSearch, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== initialValue) {
        onSearch(searchTerm)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, onSearch, initialValue])

  const handleClear = () => {
    setSearchTerm('')
    onSearch('')
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => setIsExpanded(false)}
          placeholder="Search for food by name or category..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search suggestions (optional) */}
      {isExpanded && searchTerm && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-2">
            <p className="text-sm text-gray-500 px-3 py-2">
              Searching for: <span className="font-semibold text-gray-700">"{searchTerm}"</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FoodSearch