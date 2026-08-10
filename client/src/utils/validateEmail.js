/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validate email with detailed result
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with details
 */
export const validateEmailDetailed = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email must be a string' }
  }
  
  email = email.trim()
  
  if (email.length === 0) {
    return { isValid: false, error: 'Email cannot be empty' }
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' }
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }
  
  const [localPart, domain] = email.split('@')
  
  if (localPart.length > 64) {
    return { isValid: false, error: 'Local part is too long' }
  }
  
  if (domain.split('.').some(part => part.length > 63)) {
    return { isValid: false, error: 'Domain part is too long' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Sanitize email (trim and lowercase)
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return ''
  return email.trim().toLowerCase()
}

/**
 * Mask email for display (e.g., u***r@example.com)
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
export const maskEmail = (email) => {
  if (!validateEmail(email)) return email
  
  const [localPart, domain] = email.split('@')
  
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`
  }
  
  const maskedLocal = localPart[0] + '***' + localPart[localPart.length - 1]
  return `${maskedLocal}@${domain}`
}

/**
 * Get email domain
 * @param {string} email - Email address
 * @returns {string|null} Email domain or null
 */
export const getEmailDomain = (email) => {
  if (!validateEmail(email)) return null
  
  const [, domain] = email.split('@')
  return domain
}

/**
 * Check if email is from common providers
 * @param {string} email - Email to check
 * @returns {Object} Provider info
 */
export const getEmailProvider = (email) => {
  const domain = getEmailDomain(email)
  
  const providers = {
    'gmail.com': { name: 'Google', icon: 'gmail' },
    'yahoo.com': { name: 'Yahoo', icon: 'yahoo' },
    'outlook.com': { name: 'Microsoft', icon: 'outlook' },
    'hotmail.com': { name: 'Microsoft', icon: 'hotmail' },
    'icloud.com': { name: 'Apple', icon: 'icloud' },
  }
  
  return providers[domain] || { name: 'Other', icon: 'email' }
}

/**
 * Generate a random email for testing
 * @returns {string} Random email
 */
export const generateRandomEmail = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
  let local = ''
  for (let i = 0; i < 10; i++) {
    local += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${local}@example.com`
}

/**
 * Check if emails are similar (fuzzy match)
 * @param {string} email1 - First email
 * @param {string} email2 - Second email
 * @returns {boolean} True if emails are similar
 */
export const areEmailsSimilar = (email1, email2) => {
  const normalized1 = sanitizeEmail(email1)
  const normalized2 = sanitizeEmail(email2)
  
  if (normalized1 === normalized2) return true
  
  // Check for common typos (e.g., gmail.com vs gmail.co)
  const domain1 = getEmailDomain(normalized1)
  const domain2 = getEmailDomain(normalized2)
  
  if (domain1 && domain2 && domain1 !== domain2) {
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com']
    if (commonDomains.includes(domain1) && commonDomains.includes(domain2)) {
      return false
    }
  }
  
  return false
}

export default {
  validateEmail,
  validateEmailDetailed,
  sanitizeEmail,
  maskEmail,
  getEmailDomain,
  getEmailProvider,
  generateRandomEmail,
  areEmailsSimilar,
}