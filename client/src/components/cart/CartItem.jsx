import React from 'react'
import { FiTrash2, FiPlus, FiMinus, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const CartItem = ({ item, onUpdateQuantity, onRemove, compact = false }) => {
  const itemTotal = item.price * item.quantity

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
        <Link to={`/food/${item.food}`} className="w-12 h-12 flex-shrink-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/food/${item.food}`}>
            <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
          </Link>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-orange-500 font-semibold">${item.price}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.food, item.quantity - 1)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiMinus size={14} />
              </button>
              <span className="text-sm w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.food, item.quantity + 1)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiPlus size={14} />
              </button>
              <button
                onClick={() => onRemove(item.food)}
                className="text-red-400 hover:text-red-600 ml-1"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition">
      {/* Product Image */}
      <Link to={`/food/${item.food}`} className="w-24 h-24 flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/food/${item.food}`}>
          <h3 className="font-semibold text-gray-900 hover:text-orange-500 transition line-clamp-1">
            {item.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">Unit Price: ${item.price}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onUpdateQuantity(item.food, item.quantity - 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50"
          disabled={item.quantity <= 1}
        >
          <FiMinus size={14} />
        </button>
        <span className="font-medium w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.food, item.quantity + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
        >
          <FiPlus size={14} />
        </button>
      </div>

      {/* Item Total */}
      <div className="min-w-[100px] text-right">
        <span className="font-bold text-orange-500">${itemTotal.toFixed(2)}</span>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.food)}
        className="text-gray-400 hover:text-red-500 transition p-2"
        aria-label="Remove item"
      >
        <FiX size={20} />
      </button>
    </div>
  )
}

export default CartItem