import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from '../api/axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { OrderContext } from '../context/OrderContext'
import { FiMapPin, FiPhone, FiUser, FiMail, FiCreditCard, FiTruck, FiCheckCircle, FiLock, FiShield } from 'react-icons/fi'
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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

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

        if (response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
          return;
        }

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

  // Polling for payment status
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

  // ==================== QR CODE SCREEN ====================
  if (showQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
          
          {/* Decorative background circle */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-50"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Scan to Pay</h2>
            <p className="text-gray-500 mb-6 font-medium">Open ABA Mobile or Bakong App</p>

            <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1 uppercase tracking-wide">Total Amount</p>
              <p className="text-5xl font-extrabold text-blue-700">${finalTotal.toFixed(2)}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-orange-100 shadow-sm mb-8 inline-block">
              <QRCode value={qrData} size={240} />
            </div>

            <div className="flex items-center justify-center gap-3 text-gray-600 font-medium mb-8 bg-gray-50 py-3 rounded-full">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Waiting for payment confirmation...</span>
            </div>

            <Button
              onClick={() => navigate('/profile')}
              className="w-full py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              I have paid / Go to Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ==================== MAIN CHECKOUT FORM ====================
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
          <p className="text-gray-500 mt-1">Complete your order to get delicious food delivered.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-orange-100 p-2 rounded-lg text-orange-500"><FiUser size={20} /></span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Full Name" name="name" register={register} validation={{ required: 'Name is required' }} error={errors.name?.message} icon={FiUser} />
                <Input label="Email" type="email" name="email" register={register} validation={{ required: 'Email is required' }} error={errors.email?.message} icon={FiMail} />
                <div className="sm:col-span-2">
                  <Input label="Phone Number" name="phone" register={register} validation={{ required: 'Phone is required' }} error={errors.phone?.message} icon={FiPhone} />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-orange-100 p-2 rounded-lg text-orange-500"><FiMapPin size={20} /></span>
                Delivery Address
              </h2>
              <div className="space-y-5">
                <Input label="Street Address" name="street" register={register} validation={{ required: 'Street address is required' }} error={errors.street?.message} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Input label="City" name="city" register={register} validation={{ required: 'City is required' }} error={errors.city?.message} />
                  <Input label="District" name="district" register={register} validation={{ required: 'District is required' }} error={errors.district?.message} />
                  <Input label="Commune" name="commune" register={register} />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-orange-100 p-2 rounded-lg text-orange-500"><FiCreditCard size={20} /></span>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* KHQR Option */}
                <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${paymentMethod === 'KHQR' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <input type="radio" value="KHQR" checked={paymentMethod === 'KHQR'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <div className="flex flex-col">
                    <span className="block text-sm font-semibold text-gray-900">KHQR Payment</span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">Scan QR with ABA or Bakong.</span>
                  </div>
                  {paymentMethod === 'KHQR' && <FiCheckCircle className="absolute top-4 right-4 text-orange-500 text-xl" />}
                </label>

                {/* Cash Option */}
                <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${paymentMethod === 'Cash' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <input type="radio" value="Cash" checked={paymentMethod === 'Cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <div className="flex flex-col">
                    <span className="block text-sm font-semibold text-gray-900">Cash on Delivery</span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">Pay when food arrives.</span>
                  </div>
                  {paymentMethod === 'Cash' && <FiCheckCircle className="absolute top-4 right-4 text-orange-500 text-xl" />}
                </label>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-orange-100 p-2 rounded-lg text-orange-500"><FiTruck size={20} /></span>
                Delivery Instructions <span className="text-sm font-normal text-gray-400">(Optional)</span>
              </h2>
              <textarea 
                {...register('instructions')} 
                rows={3} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none" 
                placeholder="e.g., Please leave at the front door, call when you arrive..." 
              />
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax (10%)</span>
                  <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-extrabold text-orange-500">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FiLock /> Place Order
                  </div>
                )}
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <FiShield className="text-green-500" /> Secure Checkout
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}

export default Checkout