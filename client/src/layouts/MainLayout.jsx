import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

const MainLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart()
  const { user } = useAuth()
  const location = useLocation()

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close cart drawer when route changes
  useEffect(() => {
    setIsCartOpen(false)
  }, [location])

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <Navbar 
        onCartClick={() => setIsCartOpen(true)} 
        isScrolled={isScrolled}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="flex-grow"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getCartTotal={getCartTotal}
        getCartCount={getCartCount}
      />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />

      {/* Maintenance Mode Notice (Optional) */}
      {/* {process.env.REACT_APP_MAINTENANCE_MODE === 'true' && (
        <MaintenanceBanner />
      )} */}
      {import.meta.env.VITE_MAINTENANCE_MODE === 'true' && (
  <MaintenanceBanner />
)}
    </div>
  )
}

// Scroll to Top Button Component
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300)
    }
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-all z-40"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// WhatsApp Floating Button Component
const WhatsAppButton = () => {
  const phoneNumber = '+85512345678' // Replace with your WhatsApp number
  const message = encodeURIComponent('Hello! I would like to inquire about your food delivery service.')
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all z-40 animate-bounce"
      aria-label="Contact on WhatsApp"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.596 2.081.919 3.149.92h.003c3.18 0 5.767-2.587 5.768-5.766.001-3.18-2.585-5.766-5.767-5.766zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.068-.252-.08-.577-.187-.924-.335-2.654-1.131-3.439-3.643-3.457-3.763-.018-.12-.367-.83.064-1.701.143-.289.436-.451.724-.451h.054c.165.008.33.089.431.259.369.622.84 1.399.894 1.508.033.064.047.134.021.203-.033.09-.074.15-.148.231-.074.082-.303.333-.415.444-.112.111-.202.202-.097.388.105.186.466.77.995 1.236.684.602 1.26.79 1.433.874.137.066.295.063.392-.068.098-.13.424-.531.555-.712.126-.176.264-.196.444-.122.18.074.954.45 1.117.532.163.082.27.122.312.188.042.066.042.38-.102.785z"/>
      </svg>
    </a>
  )
}

// Maintenance Banner Component
const MaintenanceBanner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50">
      <p className="text-sm font-medium">
        ⚠️ We are currently under maintenance. Some features may be unavailable.
      </p>
    </div>
  )
}

export default MainLayout