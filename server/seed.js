const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Food = require('./models/Food'); // ត្រូវប្រាកដថា Path ត្រឹមត្រូវ

dotenv.config();

const foods = [
  {
    name: 'Beef Lok Lak',
    description: 'Classic stir-fried beef with sauce.',
    price: 8.99,
    category: 'Khmer Food',
    image: 'https://via.placeholder.com/300x200?text=Beef+Lok+ Lak',
    isAvailable: true,
    rating: 4.5,
    preparationTime: 15,
    isPopular: true,
  },
  {
    name: 'Fish Amok',
    description: 'Traditional steamed fish curry.',
    price: 9.99,
    category: 'Khmer Food',
    image: 'https://via.placeholder.com/300x200?text=Fish+Amok',
    isAvailable: true,
    rating: 4.8,
    preparationTime: 20,
    isPopular: true,
  },
  {
    name: 'Fried Rice',
    description: 'Wok-fried rice with mixed vegetables.',
    price: 6.5,
    category: 'Rice',
    image: 'https://via.placeholder.com/300x200?text=Fried+Rice',
    isAvailable: true,
    rating: 4.3,
    preparationTime: 15,
    isPopular: false,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // លុបទិន្នន័យចាស់ចេញ (ប្រសិនបើមាន)
    await Food.deleteMany({});
    console.log('Old foods deleted');

    // បញ្ចូលទិន្នន័យថ្មី
    await Food.insertMany(foods);
    console.log('Foods seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();