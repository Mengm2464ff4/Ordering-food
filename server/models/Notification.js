const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'system', 'promotion', 'alert'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Auto-expire old notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true
  this.readAt = Date.now()
  return this.save()
}

module.exports = mongoose.model('Notification', notificationSchema)