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

  const teamMembers = [
    { name: 'Vutha Dev', position: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop' },
    { name: 'Sophea Chan', position: 'Head Chef', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop' },
    { name: 'Dara Kim', position: 'Delivery Manager', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
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
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&fit=crop" 
                alt="Our Story" 
                className="rounded-xl shadow-lg w-full object-cover h-[400px]"
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
      {[
        { name: 'Vutha Dev', position: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop' },
        { name: 'Sophea Chan', position: 'Head Chef', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop' },
        { name: 'Dara Kim', position: 'Delivery Manager', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
      ].map((member, index) => (
        <div key={index} className="text-center">
          <img 
            src={member.image} 
            alt={member.name}
            className="w-40 h-40 rounded-full mx-auto object-cover mb-4 border-4 border-white shadow-lg"
            onError={(e) => e.target.src = 'https://via.placeholder.com/400?text=Team+Member'}
          />
          <h3 className="text-xl font-semibold">{member.name}</h3>
          <p className="text-gray-500">{member.position}</p>
        </div>
      ))}
    </div>
  </div>
</div>
    </div>
  )
}

export default About