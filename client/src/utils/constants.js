import { getPlaceholderImage } from './generateImageUrl'

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// App Configuration
export const APP_CONFIG = {
  NAME: 'FoodOrder',
  VERSION: '1.0.0',
  DESCRIPTION: 'Delicious food delivery service',
  CONTACT_EMAIL: 'info@foodorder.com',
  CONTACT_PHONE: '+855 12 345 678',
  ADDRESS: '123 Food Street, Phnom Penh, Cambodia',
}

// Food Categories
export const FOOD_CATEGORIES = [
  { id: 'khmer', name: 'Khmer Food', icon: '🍜', color: '#f97316' },
  { id: 'noodles', name: 'Noodles', icon: '🍜', color: '#3b82f6' },
  { id: 'rice', name: 'Rice', icon: '🍚', color: '#10b981' },
  { id: 'seafood', name: 'Seafood', icon: '🦐', color: '#06b6d4' },
  { id: 'desserts', name: 'Desserts', icon: '🍰', color: '#ec4899' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: '#8b5cf6' },
  { id: 'salads', name: 'Salads', icon: '🥗', color: '#84cc16' },
  { id: 'soups', name: 'Soups', icon: '🍲', color: '#f59e0b' },
]

// Order Status
export const ORDER_STATUS = {
  PENDING: { value: 'pending', label: 'Pending', color: 'yellow', icon: '⏳' },
  CONFIRMED: { value: 'confirmed', label: 'Confirmed', color: 'blue', icon: '✓' },
  PREPARING: { value: 'preparing', label: 'Preparing', color: 'purple', icon: '🍳' },
  READY: { value: 'ready', label: 'Ready', color: 'indigo', icon: '✅' },
  DELIVERED: { value: 'delivered', label: 'Delivered', color: 'green', icon: '🚚' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'red', icon: '✗' },
}

// Payment Methods
export const PAYMENT_METHODS = {
  KHQR: { id: 'KHQR', name: 'KHQR Payment', icon: '📱', enabled: true },
  CASH: { id: 'Cash', name: 'Cash on Delivery', icon: '💵', enabled: true },
}

// Cart Configuration
export const CART_CONFIG = {
  DELIVERY_FEE: 2,
  FREE_DELIVERY_THRESHOLD: 50,
  TAX_RATE: 0.1,
  MAX_QUANTITY_PER_ITEM: 99,
  MIN_QUANTITY_PER_ITEM: 1,
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  LIMIT_OPTIONS: [12, 24, 48, 96],
}

// Sort Options
export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
  { value: 'name', label: 'Name: A to Z' },
]

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  PAYMENT_VERIFICATION: 120000, // 2 minutes
  SESSION_TIMEOUT: 1800000, // 30 minutes
  CART_SAVE_DELAY: 500,
  SEARCH_DEBOUNCE: 300,
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  CART: 'shopping_cart',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference',
  LAST_PAGE: 'last_visited_page',
}

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{3,6}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  VALIDATION_ERROR: 'Please check your input and try again.',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  LOGOUT: 'Logged out successfully',
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
}

// Routes
export const ROUTES = {
  HOME: '/',
  MENU: '/menu',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    FOODS: '/admin/foods',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    PAYMENTS: '/admin/payments',
  },
}

// Social Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/foodorder',
  INSTAGRAM: 'https://instagram.com/foodorder',
  TWITTER: 'https://twitter.com/foodorder',
  TELEGRAM: 'https://t.me/foodorder',
}

// Supported Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'km', name: 'ភាសាខ្មែរ', flag: '🇰🇭' },
]

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

// Default Values
export const DEFAULTS = {
  IMAGE_PLACEHOLDER: getPlaceholderImage('food'),
  AVATAR_PLACEHOLDER: getPlaceholderImage('user'),
  DEFAULT_PAGE_TITLE: 'FoodOrder - Delicious Food Delivery',
  DEFAULT_META_DESCRIPTION: 'Order delicious food online for fast delivery',
}

// Feature Flags
export const FEATURES = {
  ENABLE_KHQR: true,
  ENABLE_CASH: true,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_PROMO_CODES: true,
  ENABLE_REVIEWS: true,
  ENABLE_WISHLIST: false,
  ENABLE_LIVE_TRACKING: false,
}

export default {
  API_CONFIG,
  APP_CONFIG,
  FOOD_CATEGORIES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  CART_CONFIG,
  PAGINATION,
  SORT_OPTIONS,
  TIMEOUTS,
  STORAGE_KEYS,
  REGEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  SOCIAL_LINKS,
  LANGUAGES,
  THEMES,
  DEFAULTS,
  FEATURES,
}