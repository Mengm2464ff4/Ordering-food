const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be at least 0.01'],
  },
  method: {
    type: String,
    enum: ['KHQR', 'Cash'],
    required: true,
  },
  khqrData: {
    qrCode: { type: String },
    qrData: { type: String },
    md5: { type: String },
    transactionId: { type: String },
    currency: { type: String },
    bakongAccount: { type: String },
    amountLabel: { type: String },
    expiresAt: { type: Number },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  paidAt: {
    type: Date,
  },
  refundReason: {
    type: String,
  },
  refundedAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
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

// Index for faster queries
paymentSchema.index({ order: 1 })
paymentSchema.index({ user: 1 })
paymentSchema.index({ status: 1 })
paymentSchema.index({ transactionId: 1 })

module.exports = mongoose.model('Payment', paymentSchema)