import React from 'react'
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import { motion } from 'framer-motion'

const AdminStats = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      trend: '+12.5%',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      trend: '+8.2%',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      trend: '+5.1%',
    },
    {
      title: 'Total Foods',
      value: stats?.totalFoods || 0,
      icon: FiPackage,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      trend: '+3.4%',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`${stat.textColor} text-2xl`} />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <FiTrendingUp size={14} />
                <span>{stat.trend}</span>
              </div>
            </div>
            
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-sm text-gray-400">this month</span>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <FiCalendar size={12} />
                <span>Updated just now</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default AdminStats