import React, { useState } from 'react'
import { FiSave, FiBell, FiLock, FiGlobe, FiMail, FiCreditCard, FiTruck } from 'react-icons/fi'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'FoodOrder',
    siteDescription: 'Delicious food delivery service',
    contactEmail: 'info@foodorder.com',
    contactPhone: '+855 12 345 678',
    address: '123 Food Street, Phnom Penh',
    
    // Delivery Settings
    deliveryFee: '2.00',
    freeDeliveryMin: '50.00',
    estimatedDeliveryTime: '30-40',
    maxDeliveryDistance: '10',
    
    // Payment Settings
    khqrEnabled: true,
    cashEnabled: true,
    khqrAccountId: '',
    
    // Notification Settings
    emailNotifications: true,
    telegramNotifications: true,
    telegramBotToken: '',
    telegramChatId: '',
    
    // Security Settings
    requireEmailVerification: true,
    maxLoginAttempts: '5',
    sessionTimeout: '30',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully')
      setIsSaving(false)
    }, 1500)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'delivery', label: 'Delivery', icon: FiTruck },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiLock },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your application settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition ${
                    activeTab === tab.id
                      ? 'border-b-2 border-orange-500 text-orange-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Site Name"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Email"
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Phone"
                  name="contactPhone"
                  value={settings.contactPhone}
                  onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Delivery Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Delivery Fee ($)"
                  type="number"
                  step="0.01"
                  name="deliveryFee"
                  value={settings.deliveryFee}
                  onChange={handleChange}
                />
                <Input
                  label="Free Delivery Minimum ($)"
                  type="number"
                  step="0.01"
                  name="freeDeliveryMin"
                  value={settings.freeDeliveryMin}
                  onChange={handleChange}
                />
                <Input
                  label="Estimated Delivery Time (minutes)"
                  name="estimatedDeliveryTime"
                  value={settings.estimatedDeliveryTime}
                  onChange={handleChange}
                />
                <Input
                  label="Max Delivery Distance (km)"
                  type="number"
                  name="maxDeliveryDistance"
                  value={settings.maxDeliveryDistance}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Payment Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="khqrEnabled"
                    checked={settings.khqrEnabled}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span>Enable KHQR Payment</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="cashEnabled"
                    checked={settings.cashEnabled}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span>Enable Cash on Delivery</span>
                </label>
                {settings.khqrEnabled && (
                  <Input
                    label="KHQR Account ID"
                    name="khqrAccountId"
                    value={settings.khqrAccountId}
                    onChange={handleChange}
                    placeholder="Your ABA Bakong ID (e.g. yourname@aba)"
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span>Enable Email Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="telegramNotifications"
                    checked={settings.telegramNotifications}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span>Enable Telegram Notifications</span>
                </label>
                {settings.telegramNotifications && (
                  <>
                    <Input
                      label="Telegram Bot Token"
                      name="telegramBotToken"
                      value={settings.telegramBotToken}
                      onChange={handleChange}
                      type="password"
                    />
                    <Input
                      label="Telegram Chat ID"
                      name="telegramChatId"
                      value={settings.telegramChatId}
                      onChange={handleChange}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Security Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500"
                  />
                  <span>Require Email Verification</span>
                </label>
                <Input
                  label="Max Login Attempts"
                  type="number"
                  name="maxLoginAttempts"
                  value={settings.maxLoginAttempts}
                  onChange={handleChange}
                />
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
              <FiSave /> {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings