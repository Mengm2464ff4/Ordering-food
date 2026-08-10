import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  FiHome, FiShoppingBag, FiUser, FiHeart, FiClock, 
  FiSettings, FiLogOut, FiShoppingCart 
} from 'react-icons/fi'

const Sidebar = ({ user, onLogout, isOpen, onClose }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/profile', icon: FiUser, label: 'My Profile' },
    { path: '/orders', icon: FiClock, label: 'My Orders' },
    { path: '/wishlist', icon: FiHeart, label: 'Wishlist' },
    { path: '/cart', icon: FiShoppingCart, label: 'Cart' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300
        w-64 md:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:z-auto
      `}>
        <div className="p-6">
          {/* User Info */}
          {user && (
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-3xl text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <Link 
              to="/"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiHome size={20} />
              <span>Home</span>
            </Link>

            <Link 
              to="/menu"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/menu' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiShoppingBag size={20} />
              <span>Menu</span>
            </Link>

            {menuItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          {user && (
            <button
              onClick={onLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full mt-4"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar