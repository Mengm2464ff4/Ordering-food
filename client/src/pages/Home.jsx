import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getPopularFoods, getCategories } from '../api/foodApi'
import FoodCard from '../components/food/FoodCard'
import Loader from '../components/common/Loader'
import { FiTruck, FiClock, FiShield, FiStar, FiArrowRight } from 'react-icons/fi'
import { GiNoodles, GiRiceCooker, GiHotMeal } from 'react-icons/gi';
import { FaUtensils, FaFish, FaBirthdayCake, FaGlassWhiskey, FaLeaf } from 'react-icons/fa'
import {
  Soup,
  Fish,
  CakeSlice,
  CupSoda,
  Salad,
  CookingPot,
  UtensilsCrossed
} from 'lucide-react'
const Home = () => {
  const { data: popularFoods, isLoading: loadingPopular } = useQuery({
    queryKey: ['popularFoods'],
    queryFn: getPopularFoods
  })
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })

  const features = [
    { icon: FiTruck, title: 'Fast Delivery', description: '30-40 min delivery', color: 'bg-orange-100 text-orange-600' },
    { icon: FiClock, title: '24/7 Service', description: 'Order anytime', color: 'bg-blue-100 text-blue-600' },
    { icon: FiShield, title: 'Safe Payment', description: 'Secure transactions', color: 'bg-green-100 text-green-600' },
    { icon: FiStar, title: 'Quality Food', description: 'Premium ingredients', color: 'bg-purple-100 text-purple-600' },
  ]

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-48 -mb-48"></div>
        
        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                Delicious Food Delivered to Your Doorstep
              </h1>
              <p className="text-lg lg:text-xl mb-8 text-orange-100">
                Order your favorite meals from the best restaurants in town. Fast delivery, great taste!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/menu" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
                >
                  Order Now <FiArrowRight />
                </Link>
                <Link 
                  to="/about" 
                  className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition"
                >
                  Learn More
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-orange-400">
                <div>
                  <p className="text-2xl font-bold">100+</p>
                  <p className="text-sm text-orange-100">Food Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-sm text-orange-100">Restaurants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">10k+</p>
                  <p className="text-sm text-orange-100">Happy Customers</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img 
                src="/hero-food.png" 
                alt="Delicious Food" 
                className="rounded-2xl shadow-2xl"
                onError={(e) => e.target.src = 'https://i.pinimg.com/1200x/bc/41/bf/bc41bf717e4ac114bd09748656900ab3.jpg'}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the best food delivery experience with quality service
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition`}>
                  <feature.icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      {!loadingCategories && categories && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Popular Categories</h2>
              <p className="text-gray-600">Explore our wide variety of food categories</p>
            </motion.div>
            
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {categories.slice(0, 8).map((category, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Link
                    to={`/menu?category=${category}`}
                    className="block bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                    </div>
                    <h3 className="font-semibold">{category}</h3>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Popular Foods Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Popular Dishes</h2>
            <p className="text-gray-600">Most loved dishes by our customers</p>
          </motion.div>
          
          {loadingPopular ? (
            <Loader />
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {popularFoods?.slice(0, 10).map((food, index) => (
                <motion.div key={food._id} variants={fadeInUp}>
                  <FoodCard food={food} />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              to="/menu" 
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              View Full Menu <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-lg mb-8">Get your favorite food delivered in minutes</p>
          <Link 
            to="/menu" 
            className="inline-block bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Start Ordering
          </Link>
        </div>
      </section>
    </div>
  )
}

// Helper function for category icons
const getCategoryIcon = (category) => {
  const icons = {
    'Khmer Food': <Soup />,
    'Noodles': <GiNoodles />,
    'Rice': <GiRiceCooker />,
    'Seafood': <Fish />,
    'Desserts': <CakeSlice />,
    'Beverages': <CupSoda />,
    'Salads': <Salad />,
    'Soups': <CookingPot />,
  }
  return icons[category] || <UtensilsCrossed />
}

export default Home