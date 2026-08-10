import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState(null)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to load cart:', error)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, loading])

  const addToCart = useCallback((food, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.food === food._id)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        toast.success(`Updated ${food.name} quantity to ${newQuantity}`)
        return prevItems.map(item =>
          item.food === food._id
            ? { ...item, quantity: newQuantity }
            : item
        )
      }
      
      toast.success(`${food.name} added to cart!`)
      return [...prevItems, {
        food: food._id,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity: quantity,
      }]
    })
  }, [])

  const removeFromCart = useCallback((foodId) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item.food === foodId)
      if (item) {
        toast.success(`${item.name} removed from cart`)
      }
      return prevItems.filter(item => item.food !== foodId)
    })
  }, [])

  const updateQuantity = useCallback((foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId)
      return
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.food === foodId ? { ...item, quantity } : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCartItems([])
    localStorage.removeItem('cart')
    toast.success('Cart cleared')
  }, [])

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }, [cartItems])

  const getCartSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cartItems])

  const getCartTotal = useCallback(() => {
    const subtotal = getCartSubtotal()
    const deliveryFee = subtotal > 0 ? 2 : 0
    const tax = subtotal * 0.1
    return subtotal + deliveryFee + tax
  }, [getCartSubtotal])

  const getDeliveryFee = useCallback(() => {
    return getCartSubtotal() > 0 ? 2 : 0
  }, [getCartSubtotal])

  const getTaxAmount = useCallback(() => {
    return getCartSubtotal() * 0.1
  }, [getCartSubtotal])

  const applyPromoCode = useCallback((code) => {
    const validPromos = {
      'SAVE10': { discount: 10, type: 'percentage' },
      'SAVE20': { discount: 20, type: 'percentage' },
      'FREESHIP': { discount: 100, type: 'percentage' },
    }
    
    if (validPromos[code.toUpperCase()]) {
      setPromoCode(validPromos[code.toUpperCase()])
      toast.success(`Promo code applied!`)
      return true
    }
    toast.error('Invalid promo code')
    return false
  }, [])

  const removePromoCode = useCallback(() => {
    setPromoCode(null)
    toast.success('Promo code removed')
  }, [])

  const getDiscountAmount = useCallback(() => {
    if (!promoCode) return 0
    const subtotal = getCartSubtotal()
    if (promoCode.type === 'percentage') {
      return (subtotal * promoCode.discount) / 100
    }
    return promoCode.discount
  }, [promoCode, getCartSubtotal])

  const isCartEmpty = useCallback(() => {
    return cartItems.length === 0
  }, [cartItems])

  return (
    <CartContext.Provider value={{
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
    }}>
      {children}
    </CartContext.Provider>
  )
}