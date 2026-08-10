const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('../models/User')
const Food = require('../models/Food')
const bcrypt = require('bcryptjs')

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food_ordering')
    console.log('MongoDB Connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

const foods = [
  {
    name: 'Beef Lok Lak',
    description: 'Stir-fried beef with Cambodian spices, served with rice and fried egg',
    price: 8.99,
    category: 'Khmer Food',
    image: 'https://i.pinimg.com/1200x/bb/fa/bd/bbfabd255ce6fd69d4a5e661908bcd81.jpg',
    isAvailable: true,
    isPopular: true,
    preparationTime: 20,
    ingredients: ['Beef', 'Rice', 'Egg', 'Onion', 'Tomato', 'Lettuce'],
  },
  {
    name: 'Fish Amok',
    description: 'Steamed fish curry in coconut milk, wrapped in banana leaves',
    price: 9.99,
    category: 'Khmer Food',
    image: 'https://i.pinimg.com/1200x/8c/ce/c1/8ccec1741358d39ab740ef10bc8c10ab.jpg',
    isAvailable: true,
    isPopular: true,
    preparationTime: 25,
    ingredients: ['Fish', 'Coconut Milk', 'Egg', 'Kroeung', 'Banana Leaf'],
  },
  {
    name: 'Nom Banh Chok',
    description: 'Traditional Khmer noodles with fish-based green curry gravy',
    price: 5.99,
    category: 'Noodles',
    image: 'https://i.pinimg.com/736x/c5/04/75/c504754eb7f988c41cdedfb289a068ec.jpg',
    isAvailable: true,
    isPopular: true,
    preparationTime: 15,
    ingredients: ['Rice Noodles', 'Fish', 'Cucumber', 'Banana Flower', 'Mint'],
  },
  {
    name: 'Pineapple Fried Rice',
    description: 'Sweet and savory fried rice served in a pineapple boat',
    price: 7.99,
    category: 'Rice',
    image: 'https://i.pinimg.com/1200x/f7/94/63/f79463a538c8b0d5b8902930edb562c1.jpg',
    isAvailable: true,
    isPopular: false,
    preparationTime: 20,
    ingredients: ['Rice', 'Pineapple', 'Shrimp', 'Cashew', 'Raisin'],
  },
]

const seedDatabase = async () => {
  try {
    await connectDB()

    // Clear existing data
    await User.deleteMany()
    await Food.deleteMany()
    console.log('Cleared existing data')

    // Create admin user with properly hashed password
    // const salt = await bcrypt.genSalt(10)
    // const hashedAdminPassword = await bcrypt.hash('admin123', salt)
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      // password: hashedAdminPassword,
      password: 'admin123',
      phone: '012345678',
      role: 'admin',
      isActive: true,
    })

    console.log('✅ Admin user created:', admin.email)

    // const hashedVuthaPassword = await bcrypt.hash('vutha123', salt)

    const vuthaAdmin = await User.create({
      name: 'Vutha',
      email: 'vuthadev@gmail.com',
      // password: hashedVuthaPassword,
      password: 'vutha123',
      phone: '0123456789',
      role: 'admin',
      isActive: true,
    })

    console.log('✅ Admin user created:', vuthaAdmin.email)

    // Create test user with properly hashed password
    // const hashedUserPassword = await bcrypt.hash('password123', salt)
    
    const user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      phone: '098765432',
      role: 'user',
      isActive: true,
    })

    console.log('✅ Test user created:', user.email)

    // Insert foods
    const insertedFoods = await Food.insertMany(foods)
    console.log(`✅ ${insertedFoods.length} foods inserted`)

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📋 Login credentials:')
    console.log('=' .repeat(40))
    console.log('👑 ADMIN:')
    console.log('   Email: admin@example.com')
    console.log('   Password: admin123')
    console.log('   Email: vuthadev@gmail.com')
    console.log('   Password: vutha123')
    console.log('')
    console.log('👤 USER:')
    console.log('   Email: user@example.com')
    console.log('   Password: password123')
    console.log('=' .repeat(40))
    
    process.exit()
  } catch (error) {
    console.error('❌ Error seeding database:', error.message)
    process.exit(1)
  }
}

seedDatabase()