import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'  // Add this
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getRevenueChart, getTopSellingFoods } from '../../api/adminApi'
import AdminStats from '../../components/admin/AdminStats'
import AdminCharts from '../../components/admin/AdminCharts'
import { FiRefreshCw, FiDownload, FiCalendar } from 'react-icons/fi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'
import {
  Pizza,
  Package,
  Users,
  CreditCard
} from 'lucide-react';
const Dashboard = () => {
  const [dateRange, setDateRange] = useState('week')
  const navigate = useNavigate()  // Add this

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getDashboardStats
  })

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenueChart', dateRange],
    queryFn: () => getRevenueChart(dateRange)
  })

  const { data: topFoods, isLoading: topFoodsLoading } = useQuery({
    queryKey: ['topSellingFoods'],
    queryFn: getTopSellingFoods
  })

  const handleRefresh = () => {
    refetchStats()
    toast.success('Dashboard refreshed')
  }

  const handleExportReport = () => {
    const reportData = {
      stats: stats?.stats,
      generatedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported')
  }

  const isLoading = statsLoading || revenueLoading || topFoodsLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
          <Button onClick={handleExportReport} variant="outline" className="flex items-center gap-2">
            <FiDownload /> Export
          </Button>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </Button>
        </div>
      </div>

      <AdminStats stats={stats?.stats} loading={isLoading} />
      <AdminCharts revenueData={revenueData} topFoodsData={topFoods} loading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
          {statsLoading ? (
            <Loader />
          ) : (
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-500">${order.totalPrice?.toFixed(2)}</p>
                    <p className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Popular Items</h3>
          {topFoodsLoading ? (
            <Loader />
          ) : (
            <div className="space-y-3">
              {topFoods?.slice(0, 5).map((food, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-orange-500">#{idx + 1}</span>
                    <div>
                      <p className="font-medium">{food._id}</p>
                      <p className="text-sm text-gray-500">{food.totalSold} units sold</p>
                    </div>
                  </div>
                  <p className="font-semibold">${food.revenue?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard 
          title="Add New Food" 
          description="Add a new item to menu"
          icon={<Pizza />}
          link="/admin/foods"
          color="bg-orange-500"
        />
        <QuickActionCard 
          title="View Orders" 
          description="Manage customer orders"
          icon={<Package />}
          link="/admin/orders"
          color="bg-blue-500"
        />
        <QuickActionCard 
          title="Manage Users" 
          description="View and manage users"
          icon={<Users />}
          link="/admin/users"
          color="bg-green-500"
        />
        <QuickActionCard 
          title="Check Payments" 
          description="View payment transactions"
          icon={<CreditCard />}
          link="/admin/payments"
          color="bg-purple-500"
        />
      </div>
    </div>
  )
}

const QuickActionCard = ({ title, description, icon, link, color }) => {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(link)}
      className="bg-white rounded-xl shadow-md p-4 text-left hover:shadow-lg transition group"
    >
      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl mb-3 group-hover:scale-110 transition`}>
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  )
}

export default Dashboard