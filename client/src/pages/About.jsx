import React from 'react'
import { FiUsers, FiTruck, FiStar, FiHeart, FiAward, FiClock } from 'react-icons/fi'

const About = () => {
  const stats = [
    { number: '10k+', label: 'Happy Customers', icon: FiUsers },
    { number: '100+', label: 'Food Items', icon: FiStar },
    { number: '30+', label: 'Delivery Partners', icon: FiTruck },
    { number: '98%', label: 'Satisfaction Rate', icon: FiHeart },
  ]

  const values = [
    { title: 'Quality Food', description: 'We use only the freshest ingredients', icon: FiAward },
    { title: 'Fast Delivery', description: 'Quick and reliable delivery service', icon: FiTruck },
    { title: '24/7 Support', description: 'Always here to help you', icon: FiClock },
    { title: 'Best Price', description: 'Competitive prices guaranteed', icon: FiStar },
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">About FoodOrder</h1>
          <p className="text-lg lg:text-xl max-w-2xl mx-auto">
            We're on a mission to deliver delicious food to your doorstep with speed and quality
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Founded in 2023, FoodOrder started with a simple idea: to make great food accessible to everyone. 
                We believed that ordering food should be easy, fast, and enjoyable.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Today, we've grown into one of the leading food delivery platforms, partnering with 
                the best restaurants to bring you a wide variety of delicious options.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our commitment to quality, speed, and customer satisfaction has made us a trusted 
                choice for thousands of happy customers.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/about-story.jpg" 
                alt="Our Story" 
                className="rounded-xl shadow-lg w-full"
                onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=Our+Story'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="text-orange-500 text-2xl" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-orange-500 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600">The passionate people behind FoodOrder</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <img 
                  src={`/team-${i}.jpg`} 
                  alt={`Team member ${i}`}
                  className="w-40 h-40 rounded-full mx-auto object-cover mb-4"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/160x160?text=Team'}
                />
                <h3 className="text-xl font-semibold">Team Member {i}</h3>
                <p className="text-gray-500">Position</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default About