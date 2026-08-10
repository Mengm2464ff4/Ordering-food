import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi'
import { AuthContext } from '../../context/AuthContext'
import { CartContext } from '../../context/CartContext'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const { getCartCount } = useContext(CartContext)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const cartCount = getCartCount()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-orange-500">
            FoodOrder
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-orange-500 transition">Home</Link>
            <Link to="/menu" className="text-gray-700 hover:text-orange-500 transition">Menu</Link>
            <Link to="/about" className="text-gray-700 hover:text-orange-500 transition">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-orange-500 transition">Contact</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => navigate('/cart')} className="relative">
              <FiShoppingCart className="text-2xl text-gray-700 hover:text-orange-500" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <FiUser className="text-xl" />
                  <span>{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-100">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link to="/" className="block py-2 hover:text-orange-500">Home</Link>
            <Link to="/menu" className="block py-2 hover:text-orange-500">Menu</Link>
            <Link to="/about" className="block py-2 hover:text-orange-500">About</Link>
            <Link to="/contact" className="block py-2 hover:text-orange-500">Contact</Link>
            <Link to="/cart" className="block py-2 hover:text-orange-500">Cart ({cartCount})</Link>
            {user ? (
              <>
                <Link to="/profile" className="block py-2 hover:text-orange-500">Profile</Link>
                <Link to="/orders" className="block py-2 hover:text-orange-500">Orders</Link>
                <button onClick={logout} className="block w-full text-left py-2 hover:text-orange-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-orange-500">Login</Link>
                <Link to="/register" className="block py-2 bg-orange-500 text-white text-center rounded-lg mt-2">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar