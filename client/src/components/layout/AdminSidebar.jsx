import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  FiHome, FiShoppingBag, FiUsers, FiDollarSign, 
  FiStar, FiSettings, FiLogOut, FiPieChart, FiMessageSquare
} from 'react-icons/fi'

const AdminSidebar = ({ onLogout, isOpen, onClose }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/admin/dashboard', icon: FiPieChart, label: 'Dashboard' },
    { path: '/admin/foods', icon: FiShoppingBag, label: 'Food Management' },
    { path: '/admin/orders', icon: FiHome, label: 'Order Management' },
    { path: '/admin/users', icon: FiUsers, label: 'User Management' },
    { path: '/admin/payments', icon: FiDollarSign, label: 'Payment Management' },
    { path: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    { path: '/admin/messages', icon: FiMessageSquare, label: 'Messages' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-900 shadow-xl z-50 transition-transform duration-300
        w-64 lg:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
      `}>
        <div className="p-6">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-orange-500">FoodOrder</h2>
            <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${location.pathname === item.path 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:text-red-300 transition-colors w-full mt-4"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar