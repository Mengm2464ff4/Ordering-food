import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const axiosInstance = axios.create( {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
} )

axiosInstance.interceptors.request.use( ( config ) => {
  const userInfo = localStorage.getItem( 'userInfo' );

  if ( userInfo ) {
    try {
      const parsed = JSON.parse( userInfo );
      const token = parsed.token || parsed.accessToken;

      if ( token ) {
        config.headers.Authorization = `Bearer ${ token }`;
      }
    } catch ( e ) {
      // ignore invalid stored session
    }
  }

  // Critical for file uploads
  if ( config.data instanceof FormData ) {
    delete config.headers[ 'Content-Type' ];
  }

  return config;
} );

const MOCK_USERS_KEY = 'mockUsers'
const MOCK_ORDERS_KEY = 'mockOrders'
const MOCK_PAYMENTS_KEY = 'mockPayments'
const MOCK_FOODS_KEY = 'mockFoods'

const DEFAULT_MOCK_FOODS = [
  { _id: '1', name: 'Beef Lok Lak', price: 8.99, category: 'Khmer Food', image: '', isAvailable: true, rating: 4.5, description: 'Classic stir-fried beef with sauce.', ingredients: [], preparationTime: 15, isPopular: true },
  { _id: '2', name: 'Fish Amok', price: 9.99, category: 'Khmer Food', image: '', isAvailable: true, rating: 4.8, description: 'Traditional steamed fish curry.', ingredients: [], preparationTime: 20, isPopular: true },
  { _id: '3', name: 'Fried Rice', price: 6.5, category: 'Rice', image: '', isAvailable: true, rating: 4.3, description: 'Wok-fried rice with mixed vegetables.', ingredients: [], preparationTime: 15, isPopular: false },
]

const DEFAULT_MOCK_USERS = [
  {
    _id: 'admin123',
    name: 'Vutha',
    email: 'vuthadev@gmail.com',
    password: 'vutha123',
    role: 'admin',
  },
  {
    _id: 'user123',
    name: 'Demo User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
  },
]

const loadMockUsers = () => {
  try {
    const users = JSON.parse( localStorage.getItem( MOCK_USERS_KEY ) || '[]' )
    if ( Array.isArray( users ) && users.length > 0 ) {
      return users
    }
  } catch ( error ) {
    // Ignore parsing issues and reset default users.
  }
  localStorage.setItem( MOCK_USERS_KEY, JSON.stringify( DEFAULT_MOCK_USERS ) )
  return DEFAULT_MOCK_USERS
}

const saveMockUsers = ( users ) => {
  localStorage.setItem( MOCK_USERS_KEY, JSON.stringify( users ) )
}

const createAuthPayload = ( user ) => ( {
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || 'user',
  token: `mock-token-${ user._id }`,
} )

const isAuthError = ( error ) => {
  const status = error.response?.status
  return status === 401 || status === 403
}

/** Only use offline mocks when the API is unreachable, not when auth fails. */
const isOfflineError = ( error ) => !error.response || error.code === 'ERR_NETWORK'

const getPathFromUrl = ( url = '', baseURL = API_URL ) => {
  if ( !url ) return ''
  try {
    const parsed = new URL( url, baseURL )
    const normalized = parsed.pathname
      .replace( /^\/api/, '' )
      .replace( /\/+$/, '' )
    return normalized || '/'
  } catch ( error ) {
    return String( url ).split( '?' )[ 0 ].replace( /\/+$/, '' ) || '/'
  }
}

const loadCollection = ( key ) => {
  try {
    const data = JSON.parse( localStorage.getItem( key ) || '[]' )
    return Array.isArray( data ) ? data : []
  } catch ( error ) {
    return []
  }
}

const saveCollection = ( key, value ) => {
  localStorage.setItem( key, JSON.stringify( value ) )
}

const loadMockOrders = () => loadCollection( MOCK_ORDERS_KEY )
const saveMockOrders = ( orders ) => saveCollection( MOCK_ORDERS_KEY, orders )
const loadMockPayments = () => loadCollection( MOCK_PAYMENTS_KEY )
const saveMockPayments = ( payments ) => saveCollection( MOCK_PAYMENTS_KEY, payments )

const loadMockFoods = () => {
  try {
    const foods = JSON.parse( localStorage.getItem( MOCK_FOODS_KEY ) || '[]' )
    if ( Array.isArray( foods ) && foods.length > 0 ) {
      return foods
    }
  } catch ( error ) {
    // ignore
  }
  localStorage.setItem( MOCK_FOODS_KEY, JSON.stringify( DEFAULT_MOCK_FOODS ) )
  return DEFAULT_MOCK_FOODS
}

const saveMockFoods = ( foods ) => {
  localStorage.setItem( MOCK_FOODS_KEY, JSON.stringify( foods ) )
}

// Mock data for when backend is not available
const MOCK_DATA = {
  auth: {
    login: {
      _id: 'admin123',
      name: 'Admin User',
      email: 'vutha@example.com',
      role: 'admin',
      token: 'mock-token-123'
    }
  },
  admin: {
    stats: {
      stats: {
        totalRevenue: 12500,
        totalOrders: 342,
        totalUsers: 1289,
        totalFoods: 24
      },
      recentOrders: [
        { _id: 'ord_1', user: { name: 'John Doe' }, totalPrice: 45.99, status: 'delivered' },
        { _id: 'ord_2', user: { name: 'Jane Smith' }, totalPrice: 32.50, status: 'pending' }
      ]
    }
  }
}

// Mock interceptor - returns mock data instead of calling real API
axiosInstance.interceptors.response.use(
  ( response ) => response,
  async ( error ) => {
    const { config } = error
    if ( !config ) return Promise.reject( error )

    const method = String( config.method || 'get' ).toLowerCase()
    const path = getPathFromUrl( config.url || '', config.baseURL )

    // FAILSAFE: If POST /upload fails, always return mock data (for adding foods)
    // if (path === '/upload' && method === 'post') {
    //   console.warn('POST /upload failed (401), returning mock image URL. Error:', error.response?.status || error.message)
    //   const timestamp = Date.now()
    //   const mockImageUrl = `/uploads/foods/mock-${timestamp}.jpg`
    //   return {
    //     data: {
    //       imageUrl: mockImageUrl,
    //     },
    //   }
    // }
    if ( path === '/upload' && method === 'post' && isAuthError( error ) ) {
      return Promise.reject( error )
    }

    if ( path === '/upload' && method === 'post' && isOfflineError( error ) ) {
      const timestamp = Date.now();
      const mockImageUrl = `/uploads/foods/mock-${ timestamp }.jpg`;

      return Promise.resolve( {
        data: {
          imageUrl: mockImageUrl,
          message: 'Image uploaded (mock)'
        },
      } );
    }

    // FAILSAFE: If GET /foods fails, always return mock data
    if ( path === '/foods' && method === 'get' ) {
      console.warn( 'GET /foods failed, returning mock data. Error:', error.response?.status || error.message )
      const foods = loadMockFoods()
      return { data: { foods, total: foods.length, page: 1, pages: 1 } }
    }

    // Return mock data for specific endpoints
    if ( path === '/auth/login' && method === 'post' && isOfflineError( error ) ) {
      const payload = JSON.parse( config.data || '{}' )
      const users = loadMockUsers()
      const matchedUser = users.find(
        ( user ) =>
          user.email?.toLowerCase() === payload.email?.toLowerCase() &&
          user.password === payload.password
      )

      if ( !matchedUser ) {
        return Promise.reject( {
          response: { data: { message: 'Invalid email or password' } },
        } )
      }

      return { data: createAuthPayload( matchedUser ) }
    }

    if ( path === '/auth/register' && method === 'post' ) {
      const payload = JSON.parse( config.data || '{}' )
      const users = loadMockUsers()
      const exists = users.some(
        ( user ) => user.email?.toLowerCase() === payload.email?.toLowerCase()
      )

      if ( exists ) {
        return Promise.reject( {
          response: { data: { message: 'Email already exists' } },
        } )
      }

      const newUser = {
        _id: `user-${ Date.now() }`,
        name: payload.name || 'New User',
        email: payload.email,
        password: payload.password,
        role: 'user',
      }
      const updatedUsers = [ ...users, newUser ]
      saveMockUsers( updatedUsers )

      return { data: createAuthPayload( newUser ) }
    }

    if ( path === '/auth/profile' && method === 'get' ) {
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( userInfo ) {
          return { data: userInfo }
        }
      } catch ( err ) {
        // Fall through to reject below.
      }

      return Promise.reject( {
        response: { data: { message: 'User not authenticated' } },
      } )
    }

    if ( path === '/auth/profile' && method === 'put' ) {
      const payload = JSON.parse( config.data || '{}' )
      const currentUser = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )

      if ( !currentUser ) {
        return Promise.reject( {
          response: { data: { message: 'User not authenticated' } },
        } )
      }

      const mergedUser = { ...currentUser, ...payload }
      const users = loadMockUsers()
      const updatedUsers = users.map( ( user ) =>
        user._id === currentUser._id ? { ...user, ...payload } : user
      )
      saveMockUsers( updatedUsers )
      localStorage.setItem( 'userInfo', JSON.stringify( mergedUser ) )

      return { data: mergedUser }
    }

    if ( path === '/admin/stats' ) {
      return { data: MOCK_DATA.admin.stats }
    }

    // if (path === '/users') {
    //   return { data: [
    //     { _id: '1', name: 'Vutha', email: 'vuthadev@gmail.com', role: 'admin', isActive: true },
    //     { _id: '2', name: 'John Doe', email: 'john@example.com', role: 'user', isActive: true }
    //   ]}
    // }
    // GET ALL USERS
    if ( path === '/users' && method === 'get' ) {
      // Check if user is authenticated and is admin
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: {
              data: {
                message: 'Not authorized as an admin',
              },
            },
          } )
        }
      } catch ( err ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'Not authorized, no token',
            },
          },
        } )
      }

      const users = loadMockUsers()

      return {
        data: users.map( ( user ) => ( {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          isActive: user.isActive !== false,
          createdAt: user.createdAt || new Date().toISOString(),
        } ) ),
      }
    }

    // CREATE USER
    if ( path === '/users' && method === 'post' ) {
      // Check if user is authenticated and is admin
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: {
              data: {
                message: 'Not authorized as an admin',
              },
            },
          } )
        }
      } catch ( err ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'Not authorized, no token',
            },
          },
        } )
      }

      const payload = JSON.parse( config.data || '{}' )

      const users = loadMockUsers()

      // CHECK EMAIL EXIST
      const exists = users.some(
        ( user ) =>
          user.email?.toLowerCase() === payload.email?.toLowerCase()
      )

      if ( exists ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'User already exists',
            },
          },
        } )
      }

      // CREATE NEW USER
      const newUser = {
        _id: `user-${ Date.now() }`,
        name: payload.name || 'New User',
        email: payload.email,
        password: payload.password || '123456',
        phone: payload.phone || '000000000',
        role: payload.role || 'user',
        isActive: true,
        createdAt: new Date().toISOString(),
      }

      // SAVE USER
      const updatedUsers = [ ...users, newUser ]

      saveMockUsers( updatedUsers )

      return {
        data: {
          message: 'User created successfully',
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
          },
        },
      }
    }

    // DELETE USER
    if ( path.startsWith( '/users/' ) && method === 'delete' ) {
      // Check if user is authenticated and is admin
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: {
              data: {
                message: 'Not authorized as an admin',
              },
            },
          } )
        }
      } catch ( err ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'Not authorized, no token',
            },
          },
        } )
      }

      const userId = path.split( '/' )[ 2 ]

      const users = loadMockUsers()

      const updatedUsers = users.filter(
        ( user ) => user._id !== userId
      )

      saveMockUsers( updatedUsers )

      return {
        data: {
          message: 'User deleted successfully',
        },
      }
    }

    // UPDATE USER
    if ( path.startsWith( '/users/' ) && method === 'put' && !path.includes( 'toggle-status' ) ) {
      // Check if user is authenticated and is admin
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: {
              data: {
                message: 'Not authorized as an admin',
              },
            },
          } )
        }
      } catch ( err ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'Not authorized, no token',
            },
          },
        } )
      }

      const userId = path.split( '/' )[ 2 ]

      const payload = JSON.parse( config.data || '{}' )

      const users = loadMockUsers()

      const updatedUsers = users.map( ( user ) => {
        if ( user._id === userId ) {
          return {
            ...user,
            name: payload.name || user.name,
            email: payload.email || user.email,
            role: payload.role || user.role,
          }
        }

        return user
      } )

      saveMockUsers( updatedUsers )

      const updatedUser = updatedUsers.find(
        ( user ) => user._id === userId
      )

      return {
        data: {
          message: 'User updated successfully',
          user: updatedUser,
        },
      }
    }

    // TOGGLE USER STATUS
    if ( path.includes( '/users/' ) && path.includes( '/toggle-status' ) && method === 'put' ) {
      // Check if user is authenticated and is admin
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: {
              data: {
                message: 'Not authorized as an admin',
              },
            },
          } )
        }
      } catch ( err ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'Not authorized, no token',
            },
          },
        } )
      }

      const userId = path.split( '/' )[ 2 ]
      const payload = JSON.parse( config.data || '{}' )

      const users = loadMockUsers()

      const updatedUsers = users.map( ( user ) => {
        if ( user._id === userId ) {
          return {
            ...user,
            isActive: payload.isActive !== undefined ? payload.isActive : user.isActive,
          }
        }
        return user
      } )

      saveMockUsers( updatedUsers )

      return {
        data: {
          message: 'User status updated successfully',
        },
      }
    }
    if ( path === '/orders' && method === 'post' ) {
      const payload = JSON.parse( config.data || '{}' )
      const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
      const orders = loadMockOrders()

      const newOrder = {
        _id: `ord-${ Date.now() }`,
        user: userInfo?._id || 'guest',
        orderItems: payload.orderItems || [],
        shippingAddress: payload.shippingAddress || {},
        paymentMethod: payload.paymentMethod || 'Cash',
        itemsPrice: Number( payload.itemsPrice || 0 ),
        taxPrice: Number( payload.taxPrice || 0 ),
        deliveryPrice: Number( payload.deliveryPrice || 0 ),
        totalPrice: Number( payload.totalPrice || 0 ),
        status: 'pending',
        isPaid: false,
        paidAt: null,
        createdAt: new Date().toISOString(),
      }

      saveMockOrders( [ newOrder, ...orders ] )
      return { data: newOrder }
    }

    if ( path.startsWith( '/orders/' ) && path.endsWith( '/pay' ) && method === 'put' ) {
      const orderId = path.split( '/' )[ 2 ]
      const paymentsPayload = JSON.parse( config.data || '{}' )
      const orders = loadMockOrders()
      const updatedOrders = orders.map( ( order ) =>
        order._id === orderId
          ? {
            ...order,
            isPaid: true,
            paidAt: new Date().toISOString(),
            paymentResult: paymentsPayload,
          }
          : order
      )
      const updatedOrder = updatedOrders.find( ( order ) => order._id === orderId )
      if ( !updatedOrder ) {
        return Promise.reject( { response: { data: { message: 'Order not found' } } } )
      }
      saveMockOrders( updatedOrders )
      return { data: updatedOrder }
    }

    if ( path === '/orders/myorders' && method === 'get' ) {
      const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
      const orders = loadMockOrders()
      const userOrders = userInfo?._id ? orders.filter( ( order ) => order.user === userInfo._id ) : []
      return { data: userOrders }
    }

    if ( path.startsWith( '/orders/' ) && method === 'get' ) {
      const orderId = path.split( '/' )[ 2 ]
      const orders = loadMockOrders()
      const order = orders.find( ( item ) => item._id === orderId )
      if ( !order ) {
        return Promise.reject( { response: { data: { message: 'Order not found' } } } )
      }
      return { data: order }
    }

    if ( path === '/payments/khqr' && method === 'post' ) {
      const payload = JSON.parse( config.data || '{}' )
      const orders = loadMockOrders()
      const order = orders.find( ( item ) => item._id === payload.orderId )

      if ( !order ) {
        return Promise.reject( { response: { data: { message: 'Order not found for payment' } } } )
      }

      const paymentId = `pay-${ Date.now() }`
      const amount = Number( payload.amount || order.totalPrice || 0 )
      const qrData = `KHQR|${ payload.orderId }|${ amount }|Food Ordering App`
      const payment = {
        paymentId,
        orderId: payload.orderId,
        amount,
        status: 'pending',
        createdAt: Date.now(),
        qrData,
        qrString: qrData,
      }

      const payments = loadMockPayments()
      saveMockPayments( [ payment, ...payments ] )
      return { data: payment }
    }

    if ( path.match( /^\/payments\/status\/[^/]+$/ ) && method === 'get' ) {
      const paymentId = path.split( '/' )[ 3 ]
      const payments = loadMockPayments()
      const payment = payments.find( ( item ) => item.paymentId === paymentId )

      if ( !payment ) {
        return Promise.reject( { response: { data: { message: 'Payment not found' } } } )
      }

      // Auto-complete mock payment after a short delay to simulate bank confirmation.
      const elapsedMs = Date.now() - payment.createdAt
      const shouldComplete = elapsedMs > 15000 && payment.status === 'pending'

      if ( shouldComplete ) {
        const updatedPayment = {
          ...payment,
          status: 'completed',
          transactionId: `txn-${ Date.now() }`,
          paidAt: new Date().toISOString(),
        }

        const updatedPayments = payments.map( ( item ) =>
          item.paymentId === paymentId ? updatedPayment : item
        )
        saveMockPayments( updatedPayments )

        const orders = loadMockOrders()
        const updatedOrders = orders.map( ( order ) =>
          order._id === updatedPayment.orderId
            ? {
              ...order,
              isPaid: true,
              paidAt: updatedPayment.paidAt,
              paymentResult: {
                id: updatedPayment.transactionId,
                status: updatedPayment.status,
                update_time: updatedPayment.paidAt,
              },
            }
            : order
        )
        saveMockOrders( updatedOrders )

        return { data: { status: 'completed', paymentId, transactionId: updatedPayment.transactionId } }
      }

      return { data: { status: payment.status, paymentId } }
    }

    if ( path === '/payments' && method === 'get' ) {
      return { data: { payments: loadMockPayments() } }
    }

    if ( path === '/foods' && method === 'get' ) {
      const foods = loadMockFoods()
      return { data: { foods, total: foods.length, page: 1, pages: 1 } }
    }

    // CREATE FOOD
    // if (path === '/foods' && method === 'post') {
    //   // Check if user is authenticated and is admin
    //   try {
    //     const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
    //     if (!userInfo || userInfo.role !== 'admin') {
    //       return Promise.reject({
    //         response: {
    //           data: {
    //             message: 'Not authorized as an admin',
    //           },
    //         },
    //       })
    //     }
    //   } catch (err) {
    //     return Promise.reject({
    //       response: {
    //         data: {
    //           message: 'Not authorized, no token',
    //         },
    //       },
    //     })
    //   }

    //   const payload = JSON.parse(config.data || '{}')

    //   const newFood = {
    //     _id: `food-${Date.now()}`,
    //     name: payload.name,
    //     description: payload.description,
    //     price: payload.price,
    //     category: payload.category,
    //     image: payload.image || '',
    //     ingredients: payload.ingredients || [],
    //     preparationTime: payload.preparationTime || 15,
    //     isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : true,
    //     isPopular: payload.isPopular !== undefined ? payload.isPopular : false,
    //     rating: 0,
    //   }

    //   return {
    //     data: {
    //       message: 'Food created successfully',
    //       food: newFood,
    //     },
    //   }
    // }

    // CREATE FOOD - offline mock only
    if ( path === '/foods' && method === 'post' && isOfflineError( error ) ) {
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' );
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: { data: { message: 'Not authorized as an admin' } }
          } );
        }
      } catch ( err ) {
        return Promise.reject( {
          response: { data: { message: 'Not authorized, no token' } }
        } );
      }

      const payload = JSON.parse( config.data || '{}' );

      const newFood = {
        _id: `food-${ Date.now() }`,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        image: payload.image || '',
        ingredients: payload.ingredients || [],
        preparationTime: payload.preparationTime || 15,
        isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : true,
        isPopular: payload.isPopular !== undefined ? payload.isPopular : false,
        rating: 0,
        numReviews: 0,
      };

      const foods = loadMockFoods()
      saveMockFoods( [ newFood, ...foods ] )

      return Promise.resolve( { data: newFood } );
    }

    if ( path.startsWith( '/foods/' ) && method === 'get' ) {
      const foodId = path.split( '/' )[ 2 ]
      const foods = loadMockFoods()

      if ( path === '/foods/popular' ) {
        return { data: foods.slice( 0, 2 ) }
      }

      if ( path === '/foods/categories/all' ) {
        return { data: [ 'Khmer Food', 'Rice' ] }
      }

      const food = foods.find( ( item ) => item._id === foodId )
      if ( !food ) {
        return Promise.reject( { response: { data: { message: 'Food not found' } } } )
      }
      return { data: food }
    }

    // UPDATE FOOD
    if ( path.startsWith( '/foods/' ) && method === 'put' && !path.includes( '/toggle' ) ) {
      // Check if user is authenticated and is admin
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: {
              data: {
                message: 'Not authorized as an admin',
              },
            },
          } )
        }
      } catch ( err ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'Not authorized, no token',
            },
          },
        } )
      }

      const foodId = path.split( '/' )[ 2 ]
      const payload = JSON.parse( config.data || '{}' )
      const foods = loadMockFoods()
      const updatedFoods = foods.map( ( food ) =>
        food._id === foodId ? { ...food, ...payload } : food
      )
      saveMockFoods( updatedFoods )
      const updatedFood = updatedFoods.find( ( food ) => food._id === foodId )

      return { data: updatedFood || payload }
    }

    // DELETE FOOD
    if ( path.startsWith( '/foods/' ) && method === 'delete' ) {
      // Check if user is authenticated and is admin
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: {
              data: {
                message: 'Not authorized as an admin',
              },
            },
          } )
        }
      } catch ( err ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'Not authorized, no token',
            },
          },
        } )
      }

      const foodId = path.split( '/' )[ 2 ]
      const foods = loadMockFoods()
      saveMockFoods( foods.filter( ( food ) => food._id !== foodId ) )

      return {
        data: {
          message: 'Food deleted successfully',
        },
      }
    }

    // TOGGLE FOOD AVAILABILITY
    if ( path.includes( '/foods/' ) && path.includes( '/toggle' ) && method === 'put' ) {
      // Check if user is authenticated and is admin
      try {
        const userInfo = JSON.parse( localStorage.getItem( 'userInfo' ) || 'null' )
        if ( !userInfo || userInfo.role !== 'admin' ) {
          return Promise.reject( {
            response: {
              data: {
                message: 'Not authorized as an admin',
              },
            },
          } )
        }
      } catch ( err ) {
        return Promise.reject( {
          response: {
            data: {
              message: 'Not authorized, no token',
            },
          },
        } )
      }

      const foodId = path.split( '/' )[ 2 ]
      const payload = JSON.parse( config.data || '{}' )
      const foods = loadMockFoods()
      const updatedFoods = foods.map( ( food ) =>
        food._id === foodId
          ? { ...food, isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : !food.isAvailable }
          : food
      )
      saveMockFoods( updatedFoods )

      return {
        data: {
          message: 'Food availability updated successfully',
          isAvailable: payload.isAvailable,
        },
      }
    }

    if ( path === '/reviews' ) {
      return { data: [] }
    }

    return Promise.reject( error )
  }
)

export default axiosInstance