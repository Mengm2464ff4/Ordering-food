import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiUser } from 'react-icons/fi'
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
          {/* Logo */}
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

          {/* Desktop Right Side (Cart & User) */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => navigate('/cart')} className="relative">
              <FiShoppingCart className="text-2xl text-gray-700 hover:text-orange-500 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="relative group flex items-center h-full">
                <button className="flex items-center space-x-2 py-2">
                  <FiUser className="text-xl" />
                  <span>{user.name}</span>
                </button>
                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                  <div className="bg-white rounded-md shadow-lg py-1">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-100">Admin Panel</Link>
                    )}
                    <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Register</Link>
              </div>
            )}
          </div>

          {/* ✅ Mobile Right Side (Cart + Hamburger Menu) */}
          <div className="flex md:hidden items-center space-x-4">
            
            {/* Mobile Cart Icon */}
            <button onClick={() => navigate('/cart')} className="relative p-1">
              <FiShoppingCart className="text-2xl text-gray-700 hover:text-orange-500 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Animated Hamburger Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="relative w-8 h-8 focus:outline-none"
            >
              <span
                className={`absolute block h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ease-in-out ${
                  isOpen ? 'rotate-45 top-4' : 'top-1'
                }`}
              ></span>
              <span
                className={`absolute block h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ease-in-out ${
                  isOpen ? 'opacity-0' : 'top-4'
                }`}
              ></span>
              <span
                className={`absolute block h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ease-in-out ${
                  isOpen ? '-rotate-45 top-4' : 'top-7'
                }`}
              ></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown (Animated) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-2 border-t border-gray-100 flex flex-col space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 px-2 rounded-md hover:text-orange-500 hover:bg-orange-50">Home</Link>
            <Link to="/menu" onClick={() => setIsOpen(false)} className="block py-2 px-2 rounded-md hover:text-orange-500 hover:bg-orange-50">Menu</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block py-2 px-2 rounded-md hover:text-orange-500 hover:bg-orange-50">About</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 px-2 rounded-md hover:text-orange-500 hover:bg-orange-50">Contact</Link>
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block py-2 px-2 rounded-md hover:text-orange-500 hover:bg-orange-50">Profile</Link>
                  <Link to="/orders" onClick={() => setIsOpen(false)} className="block py-2 px-2 rounded-md hover:text-orange-500 hover:bg-orange-50">Orders</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="block py-2 px-2 rounded-md hover:text-orange-500 hover:bg-orange-50">Admin Panel</Link>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left py-2 px-2 rounded-md hover:text-orange-500 hover:bg-orange-50 text-red-500 mt-1">Logout</button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 mt-2">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2 text-center text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50">Login</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block py-2 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar