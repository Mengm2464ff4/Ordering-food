import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { FiMenu, FiBell, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const location = useLocation()

  // Get user from localStorage directly
  const userInfo = localStorage.getItem('userInfo')
  const user = userInfo ? JSON.parse(userInfo) : null

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [location, isMobile])

  // Mock notifications
  useEffect(() => {
    const mockNotifications = [
      { id: 1, title: 'New Order Received', message: 'Order #12345 has been placed', time: '5 min ago', read: false },
      { id: 2, title: 'Payment Verified', message: 'Payment for order #12344 has been verified', time: '1 hour ago', read: false },
    ]
    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 w-64 bg-gray-900 text-white
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}>
        <div className="p-4">
          <h2 className="text-2xl font-bold text-orange-500 mb-8">FoodOrder Admin</h2>
          <nav>
            <a href="/admin/dashboard" className="block py-2 px-4 hover:bg-gray-800 rounded mb-2">Dashboard</a>
            <a href="/admin/foods" className="block py-2 px-4 hover:bg-gray-800 rounded mb-2">Foods</a>
            <a href="/admin/orders" className="block py-2 px-4 hover:bg-gray-800 rounded mb-2">Orders</a>
            <a href="/admin/users" className="block py-2 px-4 hover:bg-gray-800 rounded mb-2">Users</a>
            <a href="/admin/payments" className="block py-2 px-4 hover:bg-gray-800 rounded mb-2">Payments</a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen && !isMobile ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-4 py-4 flex justify-between items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2">
              <FiMenu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle(location.pathname)}</h1>
            
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0) || 'A'}</span>
                </div>
                <span className="hidden md:inline">{user?.name}</span>
                <FiChevronDown size={16} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                    <FiLogOut className="inline mr-2" size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const getPageTitle = (path) => {
  const titles = {
    '/admin/dashboard': 'Dashboard',
    '/admin/foods': 'Food Management',
    '/admin/orders': 'Order Management',
    '/admin/users': 'User Management',
    '/admin/payments': 'Payment Management',
    '/admin/reviews': 'Reviews',
    '/admin/settings': 'Settings',
  }
  return titles[path] || 'Admin Panel'
}

export default AdminLayout