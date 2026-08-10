import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
      <div className="text-center max-w-lg">
        <div className="text-9xl font-bold text-gray-200">404</div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🍕</div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mt-8 mb-4">
          Oops! Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            <FiHome />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            <FiArrowLeft />
            Go Back
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-gray-500 text-sm mb-4">You might be looking for:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/menu" className="text-orange-500 hover:text-orange-600">Menu</Link>
            <Link to="/about" className="text-orange-500 hover:text-orange-600">About Us</Link>
            <Link to="/contact" className="text-orange-500 hover:text-orange-600">Contact</Link>
            <Link to="/cart" className="text-orange-500 hover:text-orange-600">Cart</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound