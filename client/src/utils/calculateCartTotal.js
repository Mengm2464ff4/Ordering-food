import { formatPrice } from './formatPrice'

/**
 * Calculate cart subtotal
 * @param {Array} cartItems - Array of cart items
 * @returns {number} Subtotal amount
 */
export const calculateSubtotal = (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems)) return 0
  
  return cartItems.reduce((total, item) => {
    const itemPrice = item.price || 0
    const quantity = item.quantity || 0
    return total + (itemPrice * quantity)
  }, 0)
}

/**
 * Calculate delivery fee
 * @param {number} subtotal - Cart subtotal
 * @param {number} freeDeliveryThreshold - Threshold for free delivery (default: 50)
 * @param {number} deliveryFee - Standard delivery fee (default: 2)
 * @returns {number} Delivery fee amount
 */
export const calculateDeliveryFee = (subtotal, freeDeliveryThreshold = 50, deliveryFee = 2) => {
  if (subtotal >= freeDeliveryThreshold) return 0
  return deliveryFee
}

/**
 * Calculate tax amount
 * @param {number} subtotal - Cart subtotal
 * @param {number} taxRate - Tax rate (default: 0.1 for 10%)
 * @returns {number} Tax amount
 */
export const calculateTax = (subtotal, taxRate = 0.1) => {
  return subtotal * taxRate
}

/**
 * Calculate discount amount
 * @param {number} subtotal - Cart subtotal
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Discount amount
 */
export const calculateDiscount = (subtotal, discountPercent) => {
  if (!discountPercent || discountPercent <= 0) return 0
  return subtotal * (discountPercent / 100)
}

/**
 * Calculate cart total
 * @param {Array} cartItems - Array of cart items
 * @param {Object} options - Calculation options
 * @returns {Object} Cart total details
 */
export const calculateCartTotal = (cartItems, options = {}) => {
  const {
    freeDeliveryThreshold = 50,
    deliveryFee = 2,
    taxRate = 0.1,
    discountPercent = 0,
  } = options

  const subtotal = calculateSubtotal(cartItems)
  const delivery = calculateDeliveryFee(subtotal, freeDeliveryThreshold, deliveryFee)
  const tax = calculateTax(subtotal, taxRate)
  const discount = calculateDiscount(subtotal, discountPercent)
  const total = subtotal + delivery + tax - discount

  return {
    subtotal,
    delivery,
    tax,
    discount,
    total,
    itemCount: cartItems.reduce((count, item) => count + (item.quantity || 0), 0),
    hasItems: cartItems.length > 0,
    isFreeDelivery: delivery === 0,
  }
}

/**
 * Get cart summary for display
 * @param {Array} cartItems - Array of cart items
 * @param {Object} options - Calculation options
 * @returns {Object} Formatted cart summary
 */
export const getCartSummary = (cartItems, options = {}) => {
  const totals = calculateCartTotal(cartItems, options)
  
  return {
    ...totals,
    formattedSubtotal: formatPrice(totals.subtotal),
    formattedDelivery: formatPrice(totals.delivery),
    formattedTax: formatPrice(totals.tax),
    formattedDiscount: formatPrice(totals.discount),
    formattedTotal: formatPrice(totals.total),
  }
}

/**
 * Validate cart items (check for availability and price changes)
 * @param {Array} cartItems - Array of cart items
 * @param {Array} currentFoods - Array of current food items from API
 * @returns {Object} Validation results
 */
export const validateCartItems = (cartItems, currentFoods) => {
  const results = {
    valid: true,
    invalidItems: [],
    priceChangedItems: [],
    unavailableItems: [],
  }

  cartItems.forEach(cartItem => {
    const currentFood = currentFoods.find(food => food._id === cartItem.food)
    
    if (!currentFood || !currentFood.isAvailable) {
      results.valid = false
      results.unavailableItems.push({
        ...cartItem,
        reason: 'Item is no longer available',
      })
    } else if (currentFood.price !== cartItem.price) {
      results.valid = false
      results.priceChangedItems.push({
        ...cartItem,
        oldPrice: cartItem.price,
        newPrice: currentFood.price,
        reason: `Price changed from $${cartItem.price} to $${currentFood.price}`,
      })
    }
  })

  results.invalidItems = [...results.unavailableItems, ...results.priceChangedItems]
  
  return results
}

/**
 * Apply promo code to cart
 * @param {number} subtotal - Cart subtotal
 * @param {string} promoCode - Promo code string
 * @returns {Object} Promo code result
 */
export const applyPromoCode = (subtotal, promoCode) => {
  const promos = {
    'SAVE10': { type: 'percentage', value: 10 },
    'SAVE20': { type: 'percentage', value: 20 },
    'WELCOME15': { type: 'percentage', value: 15 },
    'FREESHIP': { type: 'free_delivery', value: 0 },
  }

  const promo = promos[promoCode.toUpperCase()]
  
  if (!promo) {
    return {
      valid: false,
      message: 'Invalid promo code',
    }
  }

  let discount = 0
  let message = ''

  if (promo.type === 'percentage') {
    discount = (subtotal * promo.value) / 100
    message = `${promo.value}% discount applied`
  } else if (promo.type === 'free_delivery') {
    discount = 0 // Delivery fee will be handled separately
    message = 'Free delivery applied'
  }

  return {
    valid: true,
    discount,
    type: promo.type,
    value: promo.value,
    message,
    code: promoCode.toUpperCase(),
  }
}

/**
 * Calculate savings compared to original prices
 * @param {Array} cartItems - Array of cart items with possible original prices
 * @returns {Object} Savings details
 */
export const calculateSavingsFromCart = (cartItems) => {
  let originalTotal = 0
  let currentTotal = 0

  cartItems.forEach(item => {
    const originalPrice = item.originalPrice || item.price
    originalTotal += originalPrice * item.quantity
    currentTotal += item.price * item.quantity
  })

  const savings = originalTotal - currentTotal
  const savingsPercent = originalTotal > 0 ? (savings / originalTotal) * 100 : 0

  return {
    originalTotal,
    currentTotal,
    savings,
    savingsPercent,
    hasSavings: savings > 0,
  }
}

export default {
  calculateSubtotal,
  calculateDeliveryFee,
  calculateTax,
  calculateDiscount,
  calculateCartTotal,
  getCartSummary,
  validateCartItems,
  applyPromoCode,
  calculateSavingsFromCart,
}