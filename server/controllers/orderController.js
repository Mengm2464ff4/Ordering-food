const Order = require('../models/Order')
const Notification = require('../models/Notification')
const { sendOrderNotification } = require('../config/telegram')
const asyncHandler = require('express-async-handler')

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    deliveryPrice,
    totalPrice,
    instructions,
  } = req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error('No order items')
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    deliveryPrice,
    totalPrice,
    instructions,
  })

  const createdOrder = await order.save()

  // Send Telegram notification
  await sendOrderNotification(createdOrder)

  // Create notification for admin
  await Notification.create({
    user: req.user._id,
    type: 'order',
    title: 'New Order Created',
    message: `Order #${createdOrder._id} has been created successfully`,
    data: { orderId: createdOrder._id },
  })

  res.status(201).json(createdOrder)
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')

  if (order && (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin')) {
    res.json(order)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.updateTime,
      emailAddress: req.body.emailAddress,
    }

    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.status = req.body.status
    
    if (req.body.status === 'delivered') {
      order.isDelivered = true
      order.deliveredAt = Date.now()
    }

    const updatedOrder = await order.save()

    // Send notification to user
    await Notification.create({
      user: order.user,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order #${order._id} status has been updated to ${order.status}`,
      data: { orderId: order._id, status: order.status },
    })

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt')
  res.json(orders)
})

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const status = req.query.status
  const date = req.query.date

  let query = {}
  if (status && status !== 'all') {
    query.status = status
  }
  
  if (date) {
    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)
    query.createdAt = { $gte: startDate, $lt: endDate }
  }

  const count = await Order.countDocuments(query)
  const orders = await Order.find(query)
    .populate('user', 'id name email')
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit)

  res.json({
    orders,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  })
})

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order && order.user.toString() === req.user._id.toString()) {
    if (order.status === 'pending' || order.status === 'confirmed') {
      order.status = 'cancelled'
      await order.save()
      res.json({ message: 'Order cancelled successfully', order })
    } else {
      res.status(400)
      throw new Error('Order cannot be cancelled at this stage')
    }
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  cancelOrder,
}