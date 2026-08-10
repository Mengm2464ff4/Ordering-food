import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthContext } from '../../context/AuthContext'
import { CartContext } from '../../context/CartContext'
import { createOrder } from '../../api/orderApi'
import { createKHQRPayment } from '../../api/paymentApi'
import { FiMapPin, FiPhone, FiUser, FiMail, FiCreditCard, FiTruck, FiCheckCircle } from 'react-icons/fi'
import Button from '../common/Button'
import Input from '../common/Input'
import toast from 'react-hot-toast'

const CheckoutForm = ({ onSubmit, initialData, isLoading }) => {
  const { user } = useContext(AuthContext)
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext)
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('KHQR')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      district: user?.address?.district || '',
      commune: user?.address?.commune || '',
    }
  })

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
      setValue('phone', user.phone)
      if (user.address) {
        setValue('street', user.address.street || '')
        setValue('city', user.address.city || '')
        setValue('district', user.address.district || '')
        setValue('commune', user.address.commune || '')
      }
    }
  }, [user, setValue])

  const subtotal = getCartTotal()
  const deliveryFee = subtotal > 0 ? 2 : 0
  const tax = subtotal * 0.1
  const total = subtotal + deliveryFee + tax

  const handleFormSubmit = async (data) => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

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

    try {
      const order = await createOrder(orderData)
      
      if (paymentMethod === 'KHQR') {
        const payment = await createKHQRPayment({
          orderId: order._id,
          amount: total,
        })
        
        navigate(`/payment/${order._id}`, {
          state: { paymentId: payment.paymentId, qrCode: payment.qrCode, order }
        })
      } else {
        toast.success('Order placed successfully!')
        clearCart()
        navigate(`/orders/${order._id}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
            required
            error={errors.name?.message}
            icon={FiUser}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            register={register}
            required
            error={errors.email?.message}
            icon={FiMail}
          />
          <Input
            label="Phone Number"
            name="phone"
            register={register}
            required
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Street Address"
              name="street"
              register={register}
              required
              error={errors.street?.message}
            />
          </div>
          <Input
            label="City"
            name="city"
            register={register}
            required
            error={errors.city?.message}
          />
          <Input
            label="District"
            name="district"
            register={register}
            required
            error={errors.district?.message}
          />
          <Input
            label="Commune"
            name="commune"
            register={register}
            error={errors.commune?.message}
          />
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
              <p className="text-sm text-gray-500">Pay using KHQR (Scan QR code)</p>
            </div>
            <img src="/khqr-logo.png" alt="KHQR" className="ml-auto h-8" />
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
        <div className="space-y-2 mb-4">
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

        <Button
          type="submit"
          disabled={isSubmitting || cartItems.length === 0}
          className="w-full"
        >
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
  )
}

export default CheckoutForm