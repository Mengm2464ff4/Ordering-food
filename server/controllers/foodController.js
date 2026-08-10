const Food = require('../models/Food')
const asyncHandler = require('express-async-handler')

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
const getFoods = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 12
  const category = req.query.category
  const search = req.query.search
  const sort = req.query.sort || '-createdAt'
  const minPrice = parseFloat(req.query.minPrice) || 0
  const maxPrice = parseFloat(req.query.maxPrice) || 1000

  let query = {}

  if (category && category !== 'all') {
    query.category = category
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' }
  }

  query.price = { $gte: minPrice, $lte: maxPrice }

  const count = await Food.countDocuments(query)
  const foods = await Food.find(query)
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)

  res.json({
    foods,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  })
})

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id)

  if (food) {
    res.json(food)
  } else {
    res.status(404)
    throw new Error('Food not found')
  }
})

// @desc    Get popular foods
// @route   GET /api/foods/popular
// @access  Public
const getPopularFoods = asyncHandler(async (req, res) => {
  const foods = await Food.find({ isPopular: true, isAvailable: true })
    .limit(8)
    .sort('-rating')
  res.json(foods)
})

// @desc    Get categories
// @route   GET /api/foods/categories/all
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Food.distinct('category')
  res.json(categories)
})

// @desc    Create food (Admin)
// @route   POST /api/foods
// @access  Private/Admin
const createFood = asyncHandler(async (req, res) => {
  const { name, description, price, category, image, ingredients, preparationTime, isPopular, isAvailable } = req.body

  const food = await Food.create({
    name,
    description,
    price,
    category,
    image,
    ingredients: ingredients || [],
    preparationTime: preparationTime || 15,
    isPopular: isPopular || false,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
  })

  res.status(201).json(food)
})

// @desc    Update food (Admin)
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id)

  if (food) {
    food.name = req.body.name || food.name
    food.description = req.body.description || food.description
    food.price = req.body.price || food.price
    food.category = req.body.category || food.category
    food.image = req.body.image || food.image
    food.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : food.isAvailable
    food.isPopular = req.body.isPopular !== undefined ? req.body.isPopular : food.isPopular
    food.ingredients = req.body.ingredients || food.ingredients
    food.preparationTime = req.body.preparationTime || food.preparationTime

    const updatedFood = await food.save()
    res.json(updatedFood)
  } else {
    res.status(404)
    throw new Error('Food not found')
  }
})

// @desc    Delete food (Admin)
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id)

  if (food) {
    await food.deleteOne()
    res.json({ message: 'Food removed' })
  } else {
    res.status(404)
    throw new Error('Food not found')
  }
})

// @desc    Toggle food availability (Admin)
// @route   PUT /api/foods/:id/toggle
// @access  Private/Admin
const toggleFoodAvailability = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id)

  if (food) {
    food.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : !food.isAvailable
    await food.save()
    res.json({ message: `Food is now ${food.isAvailable ? 'available' : 'unavailable'}`, food })
  } else {
    res.status(404)
    throw new Error('Food not found')
  }
})

module.exports = {
  getFoods,
  getFoodById,
  getPopularFoods,
  getCategories,
  createFood,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
}