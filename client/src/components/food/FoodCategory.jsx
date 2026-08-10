import React from 'react'
import { FiCoffee, FiPackage, FiDroplet, FiSun, FiMoon, FiSmile } from 'react-icons/fi'

const categoryIcons = {
  'Khmer Food': FiSmile,
  'Noodles': FiPackage,
  'Rice': FiSun,
  'Seafood': FiDroplet,
  'Desserts': FiMoon,
  'Beverages': FiCoffee,
  'Salads': FiSun,
  'Soups': FiDroplet,
}

const FoodCategory = ({ categories, selectedCategory, onSelectCategory }) => {
  const allCategories = ['all', ...categories]

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      <div className="flex flex-wrap gap-3">
        {allCategories.map((category) => {
          const Icon = categoryIcons[category] || FiPackage
          const isSelected = selectedCategory === category
          
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category === 'all' ? 'all' : category)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200
                ${isSelected 
                  ? 'bg-orange-500 text-white shadow-md transform scale-105' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category !== 'all' && <Icon size={18} />}
              <span className="capitalize">
                {category === 'all' ? 'All Categories' : category}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FoodCategory