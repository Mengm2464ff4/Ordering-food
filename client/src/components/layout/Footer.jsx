import React from 'react'
import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-orange-500 mb-4">FoodOrder</h3>
            <p className="text-gray-400 mb-4">
              Delicious food delivered to your doorstep. Quality ingredients, great taste, fast delivery.
            </p>
            <div className="flex space-x-4">
              <a href="https://web.facebook.com/me.ng.733350" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-orange-500 transition">
                <FiFacebook size={20} />
              </a>
              {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-orange-500 transition">
                <FiTwitter size={20} />
              </a> */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-orange-500 transition">
                <FiInstagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/vuthy-vutha-8770703bb/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-orange-500 transition">
                <FiLinkedin size={20} />
              </a>
              <a href="https://github.com/Mengm2464ff4" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-400 hover:text-orange-500 transition">
                <FiGithub size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-orange-500 transition">Home</Link></li>
              <li><Link to="/menu" className="text-gray-400 hover:text-orange-500 transition">Menu</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-orange-500 transition">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-orange-500 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/menu" className="text-gray-400 hover:text-orange-500 transition">Browse Menu</Link></li>
              <li><Link to="/orders" className="text-gray-400 hover:text-orange-500 transition">Track Orders</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-orange-500 transition">Support</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-orange-500 transition">Our Story</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiMapPin className="text-orange-500" />
                <span className="text-gray-400">271 Food Street, Phnom Penh</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-orange-500" />
                <span className="text-gray-400">+855 96 31 93 606</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="text-orange-500" />
                <span className="text-gray-400">vuthadev@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} FoodOrder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer