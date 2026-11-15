import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from '../api/axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { OrderContext } from '../context/OrderContext'
import { FiMapPin, FiPhone, FiUser, FiMail, FiCreditCard, FiTruck, FiCheckCircle } from 'react-icons/fi'
import QRCode from 'react-qr-code'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const Checkout = () => {
  const { user } = useContext(AuthContext)
  const { cartItems, getCartSubtotal, getCartTotal, getDeliveryFee, getTaxAmount, clearCart } = useContext(CartContext)
  const { createNewOrder } = useContext(OrderContext)
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('KHQR')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [qrData, setQrData] = useState('')
  const [paymentId, setPaymentId] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [finalTotal, setFinalTotal] = useState(0)

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

  useEffect(() => {
    if (cartItems.length === 0 && !showQR) {
      navigate('/cart')
    }
  }, [cartItems, navigate, showQR])

  const subtotal = getCartSubtotal()
  const deliveryFee = getDeliveryFee()
  const tax = getTaxAmount()
  const total = getCartTotal()

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    if (total <= 0) {
      toast.error('Invalid order total')
      setIsSubmitting(false)
      return
    }

    const orderItems = cartItems.map(item => ({
      food: item.food?._id || item.food,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }))

    const orderData = {
      orderItems,
      shippingAddress: {
        street: data.street || 'N/A',
        city: data.city || 'N/A',
        district: data.district || 'N/A',
        commune: data.commune || 'N/A',
        phone: data.phone || 'N/A',
      },
      paymentMethod,
      itemsPrice: subtotal,
      taxPrice: tax,
      deliveryPrice: deliveryFee,
      totalPrice: total,
    }

    try {
      const order = await createNewOrder(orderData)

            if (order && paymentMethod === 'KHQR') {
        const response = await axios.post('/payments/aba-payway', {
          orderId: order._id,
          amount: total,
        })

        // ✅ Redirect to PayWay Checkout URL
        if (response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
          return;
        }

        // Fallback if QR string is returned
        const qrString = response.data.qrData || response.data.qrImage
        if (qrString) {
          setQrData(qrString)
          setPaymentId(response.data.paymentId)
          setOrderId(order._id)
          setFinalTotal(total)
          setShowQR(true)
          setTimeout(() => { clearCart() }, 1000)
        } else {
          toast.error('No payment URL received from server')
          setIsSubmitting(false)
        }
      } else if (order) {
        clearCart()
        navigate(`/orders/${order._id}`, { state: { success: true } })
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to create QR code')
    }

    setIsSubmitting(false)
  }

  useEffect(() => {
    let interval
    if (showQR && paymentId) {
      interval = setInterval(async () => {
        try {
          const response = await axios.post('/payments/verify', { paymentId })

          if (response.data.paid) {
            clearInterval(interval)
            toast.success('Payment successful!')
            navigate(`/orders/${orderId}`)
          }
        } catch (error) {
          console.error('Payment check error:', error)
        }
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [showQR, paymentId, orderId, navigate])

  if (showQR) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan to Pay</h2>
          <p className="text-gray-500 mb-6">Open ABA Mobile or Bakong App</p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-600 mb-1">Total Amount</p>
            <p className="text-4xl font-bold text-blue-700">${finalTotal.toFixed(2)}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 inline-block">
            <QRCode value={qrData} size={220} />
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-6">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Waiting for payment confirmation...</span>
          </div>

          <Button
            onClick={() => navigate('/profile')}
            variant="primary"
            className="w-full py-3 text-lg"
          >
            I have paid / Go to Profile
          </Button>
        </div>
      </div>
    )
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
              <Input label="Full Name" name="name" register={register} validation={{ required: 'Name is required' }} error={errors.name?.message} icon={FiUser} />
              <Input label="Email" type="email" name="email" register={register} validation={{ required: 'Email is required' }} error={errors.email?.message} icon={FiMail} />
              <Input label="Phone Number" name="phone" register={register} validation={{ required: 'Phone is required' }} error={errors.phone?.message} icon={FiPhone} />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiMapPin className="text-orange-500" />
              Delivery Address
            </h2>
            <div className="space-y-4">
              <Input label="Street Address" name="street" register={register} validation={{ required: 'Street address is required' }} error={errors.street?.message} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="City" name="city" register={register} validation={{ required: 'City is required' }} error={errors.city?.message} />
                <Input label="District" name="district" register={register} validation={{ required: 'District is required' }} error={errors.district?.message} />
                <Input label="Commune" name="commune" register={register} />
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
                <input type="radio" value="KHQR" checked={paymentMethod === 'KHQR'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-orange-500 focus:ring-orange-500" />
                <div className="ml-3">
                  <span className="font-medium">KHQR Payment</span>
                  <p className="text-sm text-gray-500">Pay using KHQR (Scan QR code with your banking app)</p>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input type="radio" value="Cash" checked={paymentMethod === 'Cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-orange-500 focus:ring-orange-500" />
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
            <textarea {...register('instructions')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Any special instructions for delivery..." />
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