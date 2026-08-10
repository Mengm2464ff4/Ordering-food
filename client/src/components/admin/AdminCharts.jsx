import React, { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { FiCalendar, FiTrendingUp, FiTrendingDown, FiDownload } from 'react-icons/fi'
import Button from '../common/Button'

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4']

const AdminCharts = ({ revenueData, topFoodsData, loading }) => {
  const [timeRange, setTimeRange] = useState('week') // week, month, year
  const [chartType, setChartType] = useState('line')

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Format revenue data for charts
  const formattedRevenueData = revenueData?.map(item => ({
    date: item._id,
    revenue: item.revenue,
    orders: item.orders,
  })) || []

  // Calculate totals
  const totalRevenue = formattedRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = formattedRevenueData.reduce((sum, item) => sum + item.orders, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const RevenueChart = () => {
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f97316" name="Revenue ($)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" name="Orders" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedRevenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#f97316" name="Revenue ($)" />
          <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              <p className="text-green-500 text-sm flex items-center gap-1 mt-1">
                <FiTrendingUp /> +12.5% from last period
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiTrendingUp className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <p className="text-green-500 text-sm flex items-center gap-1 mt-1">
                <FiTrendingUp /> +8.2% from last period
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiCalendar className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${averageOrderValue.toFixed(2)}</p>
              <p className="text-green-500 text-sm flex items-center gap-1 mt-1">
                <FiTrendingUp /> +4.1% from last period
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiTrendingDown className="text-purple-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
            <Button variant="outline" size="sm">
              <FiDownload size={14} />
            </Button>
          </div>
        </div>
        <RevenueChart />
      </div>

      {/* Top Selling Foods */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Foods</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topFoodsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="_id" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSold" fill="#f97316" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topFoodsData}
                dataKey="revenue"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {topFoodsData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Delivered', value: 65 },
                  { name: 'Processing', value: 20 },
                  { name: 'Pending', value: 10 },
                  { name: 'Cancelled', value: 5 },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#10b981" />
                <Cell fill="#f97316" />
                <Cell fill="#eab308" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'KHQR', value: 70 },
                  { name: 'Cash', value: 30 },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#f97316" />
                <Cell fill="#3b82f6" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AdminCharts