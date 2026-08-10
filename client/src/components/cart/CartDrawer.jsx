import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiX, FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import CartItem from './CartItem'
import { motion, AnimatePresence } from 'framer-motion'

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  updateQuantity, 
  removeFromCart, 
  getCartTotal,
  getCartCount 
}) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Safe function calls with fallbacks
  const subtotal = getCartTotal && typeof getCartTotal === 'function' ? getCartTotal() : 0
  const deliveryFee = subtotal > 0 ? 2 : 0
  const total = subtotal + deliveryFee
  const itemCount = getCartCount && typeof getCartCount === 'function' ? getCartCount() : cartItems?.length || 0

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  const handleViewCart = () => {
    onClose()
    navigate('/cart')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <FiShoppingBag className="text-orange-500" size={24} />
                <h2 className="text-xl font-bold">Your Cart</h2>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm">
                  {itemCount} items
                </span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-2">
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!cartItems || cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FiShoppingBag size={64} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <button onClick={onClose} className="mt-4 text-orange-500 hover:text-orange-600">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.food}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {cartItems && cartItems.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-orange-500">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleViewCart}
                    className="flex-1 px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer