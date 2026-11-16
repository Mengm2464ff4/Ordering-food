import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from '../api/axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { OrderContext } from '../context/OrderContext'
import { 
  FiMapPin, FiPhone, FiUser, FiMail, FiCreditCard, FiTruck, 
  FiCheckCircle, FiLock, FiShield, FiClock, FiSmartphone 
} from 'react-icons/fi'
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

  // ✅ Timer State (3 minutes = 180 seconds)
  const [timeLeft, setTimeLeft] = useState(180)

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

  // ✅ Countdown Timer Logic
  useEffect(() => {
    let timer
    if (showQR && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      toast.error('QR Code expired! Please try again.')
      setShowQR(false)
      navigate('/cart')
    }
    return () => clearInterval(timer)
  }, [showQR, timeLeft, navigate])

  // Format time (e.g., 03:00)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

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
          setTimeLeft(180) // Reset timer to 3 mins
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
    if (showQR && paymentId && timeLeft > 0) {
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
  }, [showQR, paymentId, orderId, navigate, timeLeft])

  // ==================== QR CODE SCREEN ====================
  if (showQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
          
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-50"></div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Scan to Pay</h2>
            <p className="text-gray-500 mb-4 text-sm sm:text-base font-medium">Open ABA Mobile or Bakong App</p>

            {/* ✅ 3-Minute Timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border ${
                timeLeft < 30 
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                  : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                <FiClock /> Time remaining: {formatTime(timeLeft)}
              </span>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Total Amount</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-700">${finalTotal.toFixed(2)}</p>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-orange-100 shadow-sm mb-6 inline-block">
              <QRCode value={qrData} size={200} className="w-full max-w-[200px] h-auto" />
            </div>

            {/* ✅ Direct App Payment Buttons */}
            <div className="space-y-3 mb-6">
              <a 
                href={`abamobilebank://ababank.com?type=payway&qrcode=${encodeURIComponent(qrData)}`}
                className="flex items-center justify-center gap-2 w-full bg-[#005A9C] text-white py-3 rounded-xl font-bold hover:bg-[#004a80] transition-all shadow-md"
              >
                <FiSmartphone size={20} /> Pay with ABA Mobile
              </a>
              <a 
                href={`bakong://pay?qrcode=${encodeURIComponent(qrData)}`}
                className="flex items-center justify-center gap-2 w-full bg-[#E31B23] text-white py-3 rounded-xl font-bold hover:bg-[#c4161d] transition-all shadow-md"
              >
                <FiSmartphone size={20} /> Pay with Bakong
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs font-medium mb-6">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Waiting for payment confirmation...</span>
            </div>

            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="w-full py-3 rounded-xl border-gray-200 text-gray-600"
            >
              Cancel & Go Back
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
                
                <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${paymentMethod === 'KHQR' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <input type="radio" value="KHQR" checked={paymentMethod === 'KHQR'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <div className="flex flex-col">
                    <span className="block text-sm font-semibold text-gray-900">KHQR Payment</span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">Scan QR with ABA or Bakong.</span>
                  </div>
                  {paymentMethod === 'KHQR' && <FiCheckCircle className="absolute top-4 right-4 text-orange-500 text-xl" />}
                </label>

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