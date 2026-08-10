import React from 'react'
import { FiShoppingBag, FiSearch, FiFolder, FiHeart } from 'react-icons/fi'

const icons = {
  cart: FiShoppingBag,
  search: FiSearch,
  folder: FiFolder,
  heart: FiHeart,
}

const EmptyState = ({ 
  title = 'No items found', 
  message = 'There are no items to display at the moment',
  icon = 'folder',
  actionText,
  onAction,
  className = ''
}) => {
  const IconComponent = icons[icon] || FiFolder

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <IconComponent className="text-gray-400 text-5xl" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

export default EmptyState