import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

const CheckoutLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header for Checkout */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-orange-500">
              FoodOrder
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-orange-500 flex items-center gap-2">
              <FiArrowLeft />
              Back to Cart
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Simple Footer for Checkout */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Secure payment powered by KHQR</p>
        </div>
      </footer>
    </div>
  )
}

export default CheckoutLayout