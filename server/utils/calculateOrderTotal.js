const calculateOrderTotal = (orderItems, deliveryFee = 2, taxRate = 0.1) => {
  // Calculate items subtotal
  const itemsPrice = orderItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  )
  
  // Calculate tax
  const taxPrice = itemsPrice * taxRate
  
  // Calculate total
  const totalPrice = itemsPrice + deliveryFee + taxPrice
  
  return {
    itemsPrice: parseFloat(itemsPrice.toFixed(2)),
    taxPrice: parseFloat(taxPrice.toFixed(2)),
    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  }
}

const calculateDiscount = (total, discountPercent) => {
  const discountAmount = (total * discountPercent) / 100
  return {
    discountPercent,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    finalTotal: parseFloat((total - discountAmount).toFixed(2)),
  }
}

const calculatePriceWithTax = (price, taxRate = 0.1) => {
  const tax = price * taxRate
  return {
    original: parseFloat(price.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat((price + tax).toFixed(2)),
  }
}

const calculateBulkPrice = (unitPrice, quantity, discountThresholds = []) => {
  let finalUnitPrice = unitPrice
  let discountApplied = 0
  
  // Apply bulk discounts if thresholds are provided
  const sortedThresholds = [...discountThresholds].sort((a, b) => b.quantity - a.quantity)
  for (const threshold of sortedThresholds) {
    if (quantity >= threshold.quantity) {
      finalUnitPrice = unitPrice * (1 - threshold.discount / 100)
      discountApplied = threshold.discount
      break
    }
  }
  
  const totalPrice = finalUnitPrice * quantity
  
  return {
    unitPrice,
    finalUnitPrice: parseFloat(finalUnitPrice.toFixed(2)),
    quantity,
    discountApplied,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    savings: parseFloat(((unitPrice - finalUnitPrice) * quantity).toFixed(2)),
  }
}

module.exports = {
  calculateOrderTotal,
  calculateDiscount,
  calculatePriceWithTax,
  calculateBulkPrice,
}