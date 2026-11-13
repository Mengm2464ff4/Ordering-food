import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext' 
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave } from 'react-icons/fi'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    district: '',
    commune: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        district: user.address?.district || '',
        commune: user.address?.commune || '',
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // updateProfile ត្រឡប់មកវិញ true/false
    const success = await updateProfile({
      name: profileData.name,
      phone: profileData.phone,
      address: {
        street: profileData.street,
        city: profileData.city,
        district: profileData.district,
        commune: profileData.commune,
      },
    })
    setLoading(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    // changePassword ត្រឡប់មកវិញ true/false
    const success = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })
    if (success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  icon={FiUser}
                  required
                />
                <Input
                  label="Email (Cannot be changed)"
                  value={user?.email || ''}
                  icon={FiMail}
                  disabled
                  className="opacity-60"
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  icon={FiPhone}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiMapPin className="text-orange-500" />
                  Delivery Address
                </h3>
                <div className="space-y-3">
                  <Input
                    label="Street Address"
                    name="street"
                    value={profileData.street}
                    onChange={handleProfileChange}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="City"
                      name="city"
                      value={profileData.city}
                      onChange={handleProfileChange}
                    />
                    <Input
                      label="District"
                      name="district"
                      value={profileData.district}
                      onChange={handleProfileChange}
                    />
                    <Input
                      label="Commune"
                      name="commune"
                      value={profileData.commune}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" variant="primary" disabled={loading} className="w-full mt-4">
                <FiSave className="inline mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                icon={FiLock}
                required
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                icon={FiLock}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                icon={FiLock}
                required
              />
              <Button type="submit" variant="primary" disabled={loading} className="w-full mt-4">
                <FiSave className="inline mr-2" />
                {loading ? 'Updating...' : 'Change Password'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile