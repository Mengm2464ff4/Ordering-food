import { format, formatDistance, formatRelative, parseISO, isValid } from 'date-fns'

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return format(dateObj, formatStr)
}

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy h:mm a')
}

/**
 * Format time only
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  return formatDate(date, 'h:mm a')
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

/**
 * Get relative date (e.g., "today", "yesterday")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative date string
 */
export const getRelativeDate = (date) => {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return formatRelative(dateObj, new Date())
}

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  
  return dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
}

/**
 * Check if date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj < new Date()
}

/**
 * Check if date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj > new Date()
}

/**
 * Get day name (e.g., "Monday")
 * @param {string|Date} date - Date to get day name from
 * @returns {string} Day name
 */
export const getDayName = (date) => {
  return formatDate(date, 'EEEE')
}

/**
 * Get month name (e.g., "January")
 * @param {string|Date} date - Date to get month name from
 * @returns {string} Month name
 */
export const getMonthName = (date) => {
  return formatDate(date, 'MMMM')
}

/**
 * Get year from date
 * @param {string|Date} date - Date to get year from
 * @returns {number} Year
 */
export const getYear = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj.getFullYear()
}

/**
 * Format date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate, 'MMM dd')
  const end = formatDate(endDate, 'MMM dd, yyyy')
  return `${start} - ${end}`
}

/**
 * Get time ago string (e.g., "Just now", "5 minutes ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Time ago string
 */
export const getTimeAgo = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const seconds = Math.floor((new Date() - dateObj) / 1000)
  
  if (seconds < 5) return 'Just now'
  if (seconds < 60) return `${seconds} seconds ago`
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  
  const years = Math.floor(days / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0 min'
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`
}

/**
 * Get order estimated delivery time
 * @param {Date} orderDate - Order creation date
 * @param {number} preparationTime - Preparation time in minutes
 * @returns {string} Estimated delivery time
 */
export const getEstimatedDeliveryTime = (orderDate, preparationTime = 30) => {
  const dateObj = typeof orderDate === 'string' ? parseISO(orderDate) : orderDate
  const deliveryTime = new Date(dateObj.getTime() + (preparationTime + 20) * 60000)
  return formatTime(deliveryTime)
}

/**
 * Parse date string safely
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null
 */
export const safeParseDate = (dateString) => {
  try {
    const date = parseISO(dateString)
    return isValid(date) ? date : null
  } catch {
    return null
  }
}

export default {
  formatDate,
  formatDateTime,
  formatTime,
  getRelativeTime,
  getRelativeDate,
  isToday,
  isPastDate,
  isFutureDate,
  getDayName,
  getMonthName,
  getYear,
  formatDateRange,
  getTimeAgo,
  formatDuration,
  getEstimatedDeliveryTime,
  safeParseDate,
}