const mongoose = require('mongoose')

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    minlength: [2, 'Food name must be at least 2 characters'],
    maxlength: [100, 'Food name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Khmer Food', 'Noodles', 'Rice', 'Seafood', 'Desserts', 'Beverages', 'Salads', 'Soups', 'Appetizers'],
  },
  image: {
    type: String,
    required: [true, 'Food image is required'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: [5, 'Preparation time cannot be less than 5 minutes'],
    max: [120, 'Preparation time cannot exceed 120 minutes'],
  },
  ingredients: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

// Calculate discounted price
foodSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100)
  }
  return this.price
})

// Ensure virtual fields are included in JSON output
foodSchema.set('toJSON', { virtuals: true })
foodSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Food', foodSchema)