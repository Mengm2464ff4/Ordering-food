import { useContext, useCallback, useMemo } from 'react'
import { CartContext } from '../context/CartContext'

export const useCart = () => {
  const context = useContext(CartContext)
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  const {
    cartItems,
    loading,
    promoCode,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartSubtotal,
    getCartTotal,
    getDeliveryFee,
    getTaxAmount,
    applyPromoCode,
    removePromoCode,
    getDiscountAmount,
    isCartEmpty,
  } = context

  // Check if item exists in cart
  const isItemInCart = useCallback((foodId) => {
    return cartItems.some(item => item.food === foodId)
  }, [cartItems])

  // Get item quantity
  const getItemQuantity = useCallback((foodId) => {
    const item = cartItems.find(item => item.food === foodId)
    return item?.quantity || 0
  }, [cartItems])

  // Get cart summary
  const getCartSummary = useCallback(() => {
    const subtotal = getCartSubtotal()
    const deliveryFee = getDeliveryFee()
    const tax = getTaxAmount()
    const discount = getDiscountAmount()
    const total = subtotal + deliveryFee + tax - discount

    return {
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      itemCount: getCartCount(),
    }
  }, [getCartSubtotal, getDeliveryFee, getTaxAmount, getDiscountAmount, getCartCount])

  // Add multiple items at once
  const addMultipleItems = useCallback((items) => {
    items.forEach(item => {
      addToCart(item.food, item.quantity)
    })
  }, [addToCart])

  // Replace cart with new items
  const replaceCart = useCallback((newItems) => {
    clearCart()
    newItems.forEach(item => {
      addToCart(item.food, item.quantity)
    })
  }, [clearCart, addToCart])

  // Get formatted cart items for API
  const getCartItemsForAPI = useCallback(() => {
    return cartItems.map(item => ({
      food: item.food,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }))
  }, [cartItems])

  // Calculate savings
  const getTotalSavings = useCallback(() => {
    return getDiscountAmount()
  }, [getDiscountAmount])

  // Check if free delivery is available
  const isFreeDeliveryAvailable = useCallback(() => {
    return getCartSubtotal() > 50 // Free delivery on orders over $50
  }, [getCartSubtotal])

  return {
    // State
    cartItems,
    loading,
    promoCode,
    isCartEmpty: isCartEmpty(),
    cartCount: getCartCount(),
    cartSubtotal: getCartSubtotal(),
    cartTotal: getCartTotal(),
    
    // Basic operations
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Advanced operations
    isItemInCart,
    getItemQuantity,
    getCartSummary,
    addMultipleItems,
    replaceCart,
    getCartItemsForAPI,
    
    // Promo operations
    applyPromoCode,
    removePromoCode,
    getDiscountAmount,
    getTotalSavings,
    
    // Utility
    isFreeDeliveryAvailable,
  }
}