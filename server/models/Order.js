const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  image: {
    type: String,
    required: true,
  },
})

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    commune: { type: String },
    phone: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['KHQR', 'Cash'],
    default: 'KHQR',
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    updateTime: { type: String },
    emailAddress: { type: String },
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  deliveryPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  instructions: {
    type: String,
    default: '',
  },
  estimatedDeliveryTime: {
    type: Date,
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

// Calculate estimated delivery time before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'confirmed') {
    const estimatedTime = new Date()
    estimatedTime.setMinutes(estimatedTime.getMinutes() + 45) // 45 minutes delivery estimate
    this.estimatedDeliveryTime = estimatedTime
  }
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('Order', orderSchema)