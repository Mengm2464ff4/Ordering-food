import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiTag, FiX } from 'react-icons/fi'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartSubtotal, clearCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [appliedPromo, setAppliedPromo] = useState(null)

  const subtotal = getCartSubtotal()
  const deliveryFee = subtotal > 0 ? 2 : 0
  const tax = subtotal * 0.1
  const discountAmount = discount
  const total = subtotal + deliveryFee + tax - discountAmount

  const handleApplyPromo = () => {
    const promos = {
      'SAVE10': 10,
      'SAVE20': 20,
      'WELCOME': 15,
    }
    
    if (promos[promoCode.toUpperCase()]) {
      setDiscount(promos[promoCode.toUpperCase()])
      setAppliedPromo({ code: promoCode.toUpperCase(), amount: promos[promoCode.toUpperCase()] })
      setPromoCode('')
    } else {
      alert('Invalid promo code')
    }
  }

  const handleRemovePromo = () => {
    setDiscount(0)
    setAppliedPromo(null)
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } })
    } else {
      navigate('/checkout')
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          message="Looks like you haven't added any items to your cart yet. Browse our menu and find something delicious!"
          icon="cart"
          actionText="Browse Menu"
          onAction={() => navigate('/menu')}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-semibold text-gray-600">
              <div className="col-span-5">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {cartItems.map((item) => (
              <CartItemRow 
                key={item.food} 
                item={item} 
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
            
            {/* Clear Cart Button */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 flex items-center gap-2 text-sm"
              >
                <FiTrash2 /> Clear Cart
              </button>
            </div>
          </div>
          
          {/* Continue Shopping */}
          <Link 
            to="/menu" 
            className="inline-flex items-center gap-2 mt-4 text-orange-500 hover:text-orange-600"
          >
            <FiShoppingBag /> Continue Shopping
          </Link>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 pb-4 border-b">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 pb-4 border-b">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-500">${total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Promo Code */}
            <div className="pt-4">
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                  <span className="text-sm text-green-700">Promo "{appliedPromo.code}" applied!</span>
                  <button onClick={handleRemovePromo} className="text-green-700 hover:text-green-900">
                    <FiX />
                  </button>
                </div>
              )}
            </div>
            
            <Button onClick={handleCheckout} className="w-full mt-6">
              Proceed to Checkout <FiArrowRight className="inline ml-2" />
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Secure payment powered by KHQR
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const CartItemRow = ({ item, onUpdateQuantity, onRemove }) => {
  const total = item.price * item.quantity
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b items-center">
      <div className="col-span-5 flex gap-3">
        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
        <div>
          <Link to={`/food/${item.food}`} className="font-semibold hover:text-orange-500">
            {item.name}
          </Link>
          <p className="text-sm text-gray-500">${item.price}</p>
        </div>
      </div>
      
      <div className="col-span-3 flex items-center justify-start md:justify-center gap-3">
        <button
          onClick={() => onUpdateQuantity(item.food, item.quantity - 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
          disabled={item.quantity <= 1}
        >
          <FiMinus size={14} />
        </button>
        <span className="font-medium w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.food, item.quantity + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          <FiPlus size={14} />
        </button>
      </div>
      
      <div className="col-span-2 text-right font-semibold hidden md:block">
        ${total.toFixed(2)}
      </div>
      
      <div className="col-span-2 flex justify-between items-center md:justify-end">
        <span className="font-semibold md:hidden">${total.toFixed(2)}</span>
        <button
          onClick={() => onRemove(item.food)}
          className="text-red-500 hover:text-red-600 ml-2"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  )
}

export default Cart