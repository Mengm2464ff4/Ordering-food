const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumOrder: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
  },
  usageLimit: {
    type: Number,
    default: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  applicableCategories: [{
    type: String,
  }],
  applicableFoods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date()
  return (
    this.isActive &&
    this.usedCount < this.usageLimit &&
    now >= this.startDate &&
    now <= this.endDate
  )
}

module.exports = mongoose.model('Coupon', couponSchema)