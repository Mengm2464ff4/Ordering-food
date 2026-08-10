import React, { useState, useEffect } from 'react'
import { 
  FiEdit2, FiTrash2, FiEye, FiPlus, FiSearch, 
  FiX, FiImage, FiDollarSign, FiTag, FiClock,
  FiCheckCircle, FiAlertCircle, FiUpload
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../../api/axios'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import toast from 'react-hot-toast'
import { generateImageUrl, handleImageError } from '../../utils/generateImageUrl'

const AdminFoodTable = ({ foods, loading, onEdit, onDelete, onAdd, onToggleAvailability }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [selectedFood, setSelectedFood] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    ingredients: '',
    preparationTime: 15,
    isAvailable: true,
    isPopular: false
  })
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'Khmer Food', 'Noodles', 'Rice', 'Seafood', 
    'Desserts', 'Beverages', 'Salads', 'Soups'
  ]

  // Filter foods based on search and filters
  const filteredFoods = foods?.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          food.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || food.category === categoryFilter
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'available' && food.isAvailable) ||
                               (availabilityFilter === 'unavailable' && !food.isAvailable)
    return matchesSearch && matchesCategory && matchesAvailability
  })

  // Handle delete food
  const handleDelete = (food) => {
    if (window.confirm(`Are you sure you want to delete "${food.name}"? This action cannot be undone.`)) {
      onDelete(food._id)
    }
  }

  // Handle view food details
  const handleView = (food) => {
    setSelectedFood(food)
    setIsViewModalOpen(true)
  }

  // Handle edit food
  const handleEdit = (food) => {
    setSelectedFood(food)
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
      ingredients: food.ingredients?.join(', ') || '',
      preparationTime: food.preparationTime || 15,
      isAvailable: food.isAvailable,
      isPopular: food.isPopular || false
    })
    setImagePreview(food.image)
    setIsEditModalOpen(true)
  }

  // Handle add new food
  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories[0],
      image: '',
      ingredients: '',
      preparationTime: 15,
      isAvailable: true,
      isPopular: false
    })
    setImagePreview('')
    setIsAddModalOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload to server
    const uploadFormData = new FormData()
    uploadFormData.append('image', file)

    try {
      const response = await axios.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      if (response.data.imageUrl) {
        setFormData(prev => ({ ...prev, image: response.data.imageUrl }))
        toast.success('Image uploaded successfully!')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image')
    }
  }

  // Submit add/edit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Food name is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required')
      return
    }
    if (!formData.image) {
      toast.error('Food image is required')
      return
    }

    setIsSubmitting(true)

    const foodData = {
      ...formData,
      price: parseFloat(formData.price),
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i),
      preparationTime: parseInt(formData.preparationTime)
    }

    try {
      if (isEditModalOpen) {
        if (typeof onEdit === 'function') {
          onEdit(selectedFood._id, foodData)
        }
      } else if (typeof onAdd === 'function') {
        onAdd(foodData)
      }
      setIsEditModalOpen(false)
      setIsAddModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setAvailabilityFilter('all')
  }

  // Get status badge color
  const getStatusBadge = (isAvailable) => {
    return isAvailable 
      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
      : 'bg-red-100 text-red-700 hover:bg-red-200'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="animate-pulse">
          <div className="p-6 border-b border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Food Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your restaurant's menu items
            </p>
          </div>
          <Button 
            onClick={handleAdd} 
            className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <FiPlus size={18} />
            Add New Food
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="all">All Items</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          {(searchTerm || categoryFilter !== 'all' || availabilityFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-500 hover:text-gray-700 flex items-center gap-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <FiX size={16} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredFoods?.length} of {foods?.length} foods
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name & Description</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredFoods?.map((food, index) => (
                <motion.tr
                  key={food._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Image */}
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <img 
                        src={generateImageUrl(food.image)} 
                        alt={food.name} 
                        className="w-14 h-14 object-cover rounded-lg shadow-md group-hover:shadow-lg transition"
                        onError={(e) => handleImageError(e, 'food')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition"></div>
                    </div>
                  </td>
                  
                  {/* Name & Description */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{food.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{food.description}</p>
                      {food.isPopular && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                          <FiTag size={10} />
                          Popular
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {food.category}
                    </span>
                  </td>
                  
                  {/* Price */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <FiDollarSign className="text-orange-500" size={16} />
                      <span className="font-bold text-gray-900">{food.price}</span>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleAvailability(food._id, !food.isAvailable)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition ${getStatusBadge(food.isAvailable)}`}
                    >
                      {food.isAvailable ? (
                        <FiCheckCircle size={12} />
                      ) : (
                        <FiAlertCircle size={12} />
                      )}
                      {food.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  
                  {/* Rating */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{food.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-gray-400 text-xs">({food.numReviews || 0})</span>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleView(food)}
                        className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(food)}
                        className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit Food"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(food)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Food"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredFoods?.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <FiSearch className="text-gray-400 text-3xl" />
          </div>
          <p className="text-gray-500 text-lg">No foods found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
          {(searchTerm || categoryFilter !== 'all' || availabilityFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* View Food Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Food Details" size="lg">
        {selectedFood && (
          <div className="space-y-6">
            {/* Image */}
            <div className="relative">
              <img 
                src={generateImageUrl(selectedFood.image)} 
                alt={selectedFood.name} 
                className="w-full h-72 object-cover rounded-xl shadow-lg"
                onError={(e) => handleImageError(e, 'food')}
              />
              {selectedFood.isPopular && (
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    🔥 Popular
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-xs text-gray-500 uppercase font-semibold">Name</label>
                <p className="font-semibold text-gray-900 mt-1">{selectedFood.name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-xs text-gray-500 uppercase font-semibold">Category</label>
                <p className="font-semibold text-gray-900 mt-1">{selectedFood.category}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-xs text-gray-500 uppercase font-semibold">Price</label>
                <p className="text-2xl font-bold text-orange-500 mt-1">${selectedFood.price}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-xs text-gray-500 uppercase font-semibold">Preparation Time</label>
                <p className="flex items-center gap-1 mt-1">
                  <FiClock className="text-gray-400" />
                  {selectedFood.preparationTime || 15} minutes
                </p>
              </div>
              <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                <label className="text-xs text-gray-500 uppercase font-semibold">Description</label>
                <p className="text-gray-700 mt-1 leading-relaxed">{selectedFood.description}</p>
              </div>
              {selectedFood.ingredients && selectedFood.ingredients.length > 0 && (
                <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                  <label className="text-xs text-gray-500 uppercase font-semibold">Ingredients</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFood.ingredients.map((ingredient, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-white rounded-full shadow-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex gap-3 pt-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                selectedFood.isAvailable 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {selectedFood.isAvailable ? <FiCheckCircle /> : <FiAlertCircle />}
                {selectedFood.isAvailable ? 'Available' : 'Unavailable'}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                <FiTag />
                {selectedFood.category}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Food Modal */}
      <Modal 
        isOpen={isEditModalOpen || isAddModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false)
          setIsAddModalOpen(false)
        }} 
        title={isEditModalOpen ? "Edit Food" : "Add New Food"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg shadow-md" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('')
                      setFormData(prev => ({ ...prev, image: '' }))
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition">
                  <FiUpload className="text-gray-400 text-2xl" />
                  <span className="text-xs text-gray-500 mt-1">Upload</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
              <div className="flex-1 text-sm text-gray-500">
                <p>Recommended size: 400x400px</p>
                <p>Supported formats: JPG, PNG, GIF</p>
                <p>Max file size: 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Food Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter food name"
            />
            
            <Input
              label="Price ($)"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
              placeholder="0.00"
            />
            
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categories.map(cat => ({ value: cat, label: cat }))}
              required
            />
            
            <Input
              label="Preparation Time (minutes)"
              name="preparationTime"
              type="number"
              value={formData.preparationTime}
              onChange={handleInputChange}
              placeholder="15"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Describe the food item..."
              required
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients (comma-separated)
            </label>
            <input
              type="text"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Rice, Chicken, Vegetables, Spices"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Available for order</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Mark as Popular</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : (isEditModalOpen ? 'Update Food' : 'Add Food')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false)
                setIsAddModalOpen(false)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminFoodTable