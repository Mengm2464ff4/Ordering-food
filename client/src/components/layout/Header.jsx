import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiShoppingCart, FiUser, FiSearch, FiX } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'

const Header = ({ onMenuClick, isAdmin = false }) => {
  const { user, logout } = useAuth()
  const { getCartCount } = useCart()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const cartCount = getCartCount()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/menu?search=${searchTerm}`)
      setIsSearchOpen(false)
      setSearchTerm('')
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Menu button (mobile) */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden text-gray-700 hover:text-orange-500"
          >
            <FiMenu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-orange-500">
            FoodOrder
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-orange-500 transition">Home</Link>
            <Link to="/menu" className="text-gray-700 hover:text-orange-500 transition">Menu</Link>
            <Link to="/about" className="text-gray-700 hover:text-orange-500 transition">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-orange-500 transition">Contact</Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-700 hover:text-orange-500"
            >
              <FiSearch size={20} />
            </button>

            {/* Cart button */}
            <Link to="/cart" className="relative">
              <FiShoppingCart className="text-2xl text-gray-700 hover:text-orange-500" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                      <FiUser className="text-white" size={16} />
                    </div>
                  )}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                  {user.role === 'admin' && !isAdmin && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-100">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg p-4 animate-slideDown">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for food..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-orange-500"
                autoFocus
              />
              <button 
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-r-lg hover:bg-orange-600"
              >
                Search
              </button>
              <button 
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header