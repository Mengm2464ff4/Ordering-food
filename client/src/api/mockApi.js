// // Mock data for frontend testing
// const mockFoods = [
//   {
//     _id: '1',
//     name: 'Beef Lok Lak',
//     description: 'Stir-fried beef with Cambodian spices, served with rice and fried egg',
//     price: 8.99,
//     category: 'Khmer Food',
//     image: 'https://via.placeholder.com/300x200?text=Beef+Lok+Lak',
//     isAvailable: true,
//     isPopular: true,
//     rating: 4.8,
//     numReviews: 124,
//     preparationTime: 20,
//     ingredients: ['Beef', 'Rice', 'Egg', 'Onion', 'Tomato', 'Lettuce']
//   },
//   {
//     _id: '2',
//     name: 'Fish Amok',
//     description: 'Steamed fish curry in coconut milk, wrapped in banana leaves',
//     price: 9.99,
//     category: 'Khmer Food',
//     image: 'https://via.placeholder.com/300x200?text=Fish+Amok',
//     isAvailable: true,
//     isPopular: true,
//     rating: 4.9,
//     numReviews: 98,
//     preparationTime: 25,
//     ingredients: ['Fish', 'Coconut Milk', 'Egg', 'Kroeung', 'Banana Leaf']
//   },
//   {
//     _id: '3',
//     name: 'Nom Banh Chok',
//     description: 'Traditional Khmer noodles with fish-based green curry gravy',
//     price: 5.99,
//     category: 'Noodles',
//     image: 'https://via.placeholder.com/300x200?text=Nom+Banh+Chok',
//     isAvailable: true,
//     isPopular: true,
//     rating: 4.7,
//     numReviews: 156,
//     preparationTime: 15,
//     ingredients: ['Rice Noodles', 'Fish', 'Cucumber', 'Banana Flower', 'Mint']
//   },
//   {
//     _id: '4',
//     name: 'Fried Rice',
//     description: 'Classic fried rice with egg, vegetables, and your choice of meat',
//     price: 6.99,
//     category: 'Rice',
//     image: 'https://via.placeholder.com/300x200?text=Fried+Rice',
//     isAvailable: true,
//     isPopular: false,
//     rating: 4.5,
//     numReviews: 89,
//     preparationTime: 15,
//     ingredients: ['Rice', 'Egg', 'Carrot', 'Peas', 'Onion']
//   },
//   {
//     _id: '5',
//     name: 'Pineapple Fried Rice',
//     description: 'Sweet and savory fried rice served in a pineapple boat',
//     price: 7.99,
//     category: 'Rice',
//     image: 'https://via.placeholder.com/300x200?text=Pineapple+Rice',
//     isAvailable: true,
//     isPopular: false,
//     rating: 4.6,
//     numReviews: 67,
//     preparationTime: 20,
//     ingredients: ['Rice', 'Pineapple', 'Shrimp', 'Cashew', 'Raisin']
//   },
//   {
//     _id: '6',
//     name: 'Spring Rolls',
//     description: 'Crispy fried spring rolls with vegetable and pork filling',
//     price: 4.99,
//     category: 'Appetizers',
//     image: 'https://via.placeholder.com/300x200?text=Spring+Rolls',
//     isAvailable: true,
//     isPopular: true,
//     rating: 4.8,
//     numReviews: 203,
//     preparationTime: 10,
//     ingredients: ['Pork', 'Carrot', 'Glass Noodle', 'Mushroom', 'Wrapper']
//   }
// ]

// const mockUsers = [
//   {
//     _id: '1',
//     name: 'Demo User',
//     email: 'user@example.com',
//     phone: '012345678',
//     role: 'user',
//     isActive: true
//   },
//   {
//     _id: '2',
//     name: 'Admin User',
//     email: 'admin@example.com',
//     phone: '098765432',
//     role: 'admin',
//     isActive: true
//   }
// ]

// const mockOrders = [
//   {
//     _id: 'ord_1',
//     user: { _id: '1', name: 'Demo User' },
//     orderItems: [
//       { food: '1', name: 'Beef Lok Lak', quantity: 2, price: 8.99, image: 'https://via.placeholder.com/100' }
//     ],
//     totalPrice: 21.97,
//     status: 'delivered',
//     isPaid: true,
//     paymentMethod: 'KHQR',
//     createdAt: new Date().toISOString()
//   }
// ]

// // Mock API functions
// export const mockLogin = async (email, password) => {
//   await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
  
//   const user = mockUsers.find(u => u.email === email)
//   if (user && password === 'password123') {
//     return {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       role: user.role,
//       token: 'mock_jwt_token'
//     }
//   }
//   throw new Error('Invalid email or password')
// }

// export const mockRegister = async (userData) => {
//   await new Promise(resolve => setTimeout(resolve, 1000))
  
//   return {
//     _id: Date.now().toString(),
//     name: userData.name,
//     email: userData.email,
//     phone: userData.phone,
//     role: 'user',
//     token: 'mock_jwt_token'
//   }
// }

// export const mockGetFoods = async (params = {}) => {
//   await new Promise(resolve => setTimeout(resolve, 500))
  
//   let filtered = [...mockFoods]
  
//   if (params.category && params.category !== 'all') {
//     filtered = filtered.filter(f => f.category === params.category)
//   }
  
//   if (params.search) {
//     filtered = filtered.filter(f => 
//       f.name.toLowerCase().includes(params.search.toLowerCase()) ||
//       f.description.toLowerCase().includes(params.search.toLowerCase())
//     )
//   }
  
//   const limit = params.limit || 12
//   const page = params.page || 1
//   const start = (page - 1) * limit
//   const paginated = filtered.slice(start, start + limit)
  
//   return {
//     foods: paginated,
//     page,
//     pages: Math.ceil(filtered.length / limit),
//     total: filtered.length
//   }
// }

// export const mockGetFoodById = async (id) => {
//   await new Promise(resolve => setTimeout(resolve, 300))
  
//   const food = mockFoods.find(f => f._id === id)
//   if (!food) throw new Error('Food not found')
//   return food
// }

// export const mockGetPopularFoods = async () => {
//   await new Promise(resolve => setTimeout(resolve, 300))
//   return mockFoods.filter(f => f.isPopular)
// }

// export const mockGetCategories = async () => {
//   await new Promise(resolve => setTimeout(resolve, 200))
//   const categories = [...new Set(mockFoods.map(f => f.category))]
//   return categories
// }

// export const mockCreateOrder = async (orderData) => {
//   await new Promise(resolve => setTimeout(resolve, 1000))
  
//   const newOrder = {
//     _id: 'ord_' + Date.now(),
//     ...orderData,
//     status: 'pending',
//     isPaid: false,
//     createdAt: new Date().toISOString()
//   }
  
//   return newOrder
// }

// export const mockGetMyOrders = async () => {
//   await new Promise(resolve => setTimeout(resolve, 500))
//   return mockOrders
// }

// export const mockCreateKHQRPayment = async (data) => {
//   await new Promise(resolve => setTimeout(resolve, 800))
  
//   return {
//     paymentId: 'pay_' + Date.now(),
//     qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KHQR_PAYMENT',
//     transactionId: 'txn_' + Date.now()
//   }
// }