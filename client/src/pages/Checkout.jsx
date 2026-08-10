import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { OrderContext } from '../context/OrderContext'
import { FiMapPin, FiPhone, FiUser, FiMail, FiCreditCard, FiTruck, FiCheckCircle } from 'react-icons/fi'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const Checkout = () => {
  const { user } = useContext(AuthContext)
  const { cartItems, getCartSubtotal, getCartTotal, getDeliveryFee, getTaxAmount, clearCart } = useContext(CartContext)
  const { createNewOrder } = useContext(OrderContext)
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('KHQR')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('phone', user.phone || '')
      setValue('street', user.address?.street || '')
      setValue('city', user.address?.city || '')
      setValue('district', user.address?.district || '')
      setValue('commune', user.address?.commune || '')
    }
  }, [user, setValue])

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart')
    }
  }, [cartItems, navigate])

  const subtotal = getCartSubtotal()
  const deliveryFee = getDeliveryFee()
  const tax = getTaxAmount()
  const total = getCartTotal()

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    const orderData = {
      orderItems: cartItems.map(item => ({
        food: item.food,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      shippingAddress: {
        street: data.street,
        city: data.city,
        district: data.district,
        commune: data.commune,
        phone: data.phone,
      },
      paymentMethod,
      itemsPrice: subtotal,
      taxPrice: tax,
      deliveryPrice: deliveryFee,
      totalPrice: total,
    }

    const order = await createNewOrder(orderData)
    
    if (order) {
      const orderId = order._id || order.id
      if (!orderId) {
        setIsSubmitting(false)
        return
      }

      clearCart()
      if (paymentMethod === 'KHQR') {
        navigate(`/payment/${orderId}`, { state: { order } })
      } else {
        navigate(`/orders/${orderId}`, { state: { success: true } })
      }
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Complete your order information</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiUser className="text-orange-500" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                register={register}
                validation={{ required: 'Name is required' }}
                error={errors.name?.message}
                icon={FiUser}
              />
              <Input
                label="Email"
                type="email"
                name="email"
                register={register}
                validation={{ required: 'Email is required' }}
                error={errors.email?.message}
                icon={FiMail}
              />
              <Input
                label="Phone Number"
                name="phone"
                register={register}
                validation={{ required: 'Phone is required' }}
                error={errors.phone?.message}
                icon={FiPhone}
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiMapPin className="text-orange-500" />
              Delivery Address
            </h2>
            <div className="space-y-4">
              <Input
                label="Street Address"
                name="street"
                register={register}
                validation={{ required: 'Street address is required' }}
                error={errors.street?.message}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  name="city"
                  register={register}
                  validation={{ required: 'City is required' }}
                  error={errors.city?.message}
                />
                <Input
                  label="District"
                  name="district"
                  register={register}
                  validation={{ required: 'District is required' }}
                  error={errors.district?.message}
                />
                <Input
                  label="Commune"
                  name="commune"
                  register={register}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiCreditCard className="text-orange-500" />
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="KHQR"
                  checked={paymentMethod === 'KHQR'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <span className="font-medium">KHQR Payment</span>
                  <p className="text-sm text-gray-500">Pay using KHQR (Scan QR code with your banking app)</p>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="Cash"
                  checked={paymentMethod === 'Cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <span className="font-medium">Cash on Delivery</span>
                  <p className="text-sm text-gray-500">Pay when you receive your order</p>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Instructions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiTruck className="text-orange-500" />
              Delivery Instructions (Optional)
            </h2>
            <textarea
              {...register('instructions')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Any special instructions for delivery..."
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-500">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FiCheckCircle />
                  Place Order
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout