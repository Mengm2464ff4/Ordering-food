const Review = require('../models/Review')
const Food = require('../models/Food')
const asyncHandler = require('express-async-handler')

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { foodId, rating, comment, images } = req.body

  const food = await Food.findById(foodId)
  if (!food) {
    res.status(404)
    throw new Error('Food not found')
  }

  // Check if user already reviewed
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    food: foodId,
  })

  if (alreadyReviewed) {
    res.status(400)
    throw new Error('You have already reviewed this food')
  }

  const review = await Review.create({
    user: req.user._id,
    food: foodId,
    rating: Number(rating),
    comment,
    images: images || [],
  })

  // Update food rating
  const reviews = await Review.find({ food: foodId })
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = totalRating / reviews.length

  food.rating = averageRating
  food.numReviews = reviews.length
  await food.save()

  res.status(201).json(review)
})

// @desc    Get reviews for a food
// @route   GET /api/reviews/food/:foodId
// @access  Public
const getFoodReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ food: req.params.foodId })
    .populate('user', 'name avatar')
    .sort('-createdAt')
  
  res.json(reviews)
})

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }

  await review.deleteOne()

  // Update food rating
  const reviews = await Review.find({ food: review.food })
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

  const food = await Food.findById(review.food)
  food.rating = averageRating
  food.numReviews = reviews.length
  await food.save()

  res.json({ message: 'Review deleted' })
})

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'name email')
    .populate('food', 'name')
    .sort('-createdAt')
  
  res.json(reviews)
})

// @desc    Moderate review (Admin)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }

  review.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : review.isApproved
  await review.save()

  res.json({ message: 'Review moderated successfully', review })
})

module.exports = {
  createReview,
  getFoodReviews,
  deleteReview,
  getAllReviews,
  moderateReview,
}