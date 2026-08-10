const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('../models/User')

dotenv.config()

const ADMINS = [
  {
    name: 'Vutha',
    email: 'vuthadev@gmail.com',
    password: 'vutha123',
    phone: '0123456789',
    role: 'admin',
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '012345678',
    role: 'admin',
  },
]

const ensureAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food_ordering')
    console.log('MongoDB Connected')

    for (const adminData of ADMINS) {
      let user = await User.findOne({ email: adminData.email })

      if (user) {
        user.name = adminData.name
        user.role = 'admin'
        user.phone = adminData.phone || user.phone
        user.isActive = true
        if (adminData.password) {
          user.password = adminData.password
        }
        await user.save()
        console.log(`✅ Updated admin: ${user.email}`)
      } else {
        user = await User.create(adminData)
        console.log(`✅ Created admin: ${user.email}`)
      }
    }

    console.log('\nAdmin accounts ready:')
    ADMINS.forEach((a) => {
      console.log(`  ${a.email} / ${a.password}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

ensureAdmins()
