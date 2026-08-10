class StorageService {
  constructor() {
    this.prefix = 'foodorder_'
    this.defaultTTL = 24 * 60 * 60 * 1000 // 24 hours
  }

  // Get full key with prefix
  getKey(key) {
    return this.prefix + key
  }

  // Set item with optional TTL
  set(key, value, ttl = null) {
    const item = {
      value: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    }
    
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(item))
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  }

  // Get item
  get(key, defaultValue = null) {
    try {
      const itemStr = localStorage.getItem(this.getKey(key))
      if (!itemStr) return defaultValue
      
      const item = JSON.parse(itemStr)
      const isExpired = Date.now() - item.timestamp > item.ttl
      
      if (isExpired) {
        this.remove(key)
        return defaultValue
      }
      
      return item.value
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  }

  // Remove item
  remove(key) {
    localStorage.removeItem(this.getKey(key))
  }

  // Clear all items with prefix
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  // Check if item exists and not expired
  has(key) {
    const itemStr = localStorage.getItem(this.getKey(key))
    if (!itemStr) return false
    
    try {
      const item = JSON.parse(itemStr)
      return Date.now() - item.timestamp <= item.ttl
    } catch {
      return false
    }
  }

  // Get item expiration time
  getExpiration(key) {
    const itemStr = localStorage.getItem(this.getKey(key))
    if (!itemStr) return null
    
    try {
      const item = JSON.parse(itemStr)
      return new Date(item.timestamp + item.ttl)
    } catch {
      return null
    }
  }

  // Set session item (cleared when browser closes)
  setSession(key, value) {
    try {
      sessionStorage.setItem(this.getKey(key), JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Session storage set error:', error)
      return false
    }
  }

  // Get session item
  getSession(key, defaultValue = null) {
    try {
      const value = sessionStorage.getItem(this.getKey(key))
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error('Session storage get error:', error)
      return defaultValue
    }
  }

  // Remove session item
  removeSession(key) {
    sessionStorage.removeItem(this.getKey(key))
  }

  // Clear all session items
  clearSession() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key)
      }
    })
  }

  // Set cookie
  setCookie(key, value, days = 7) {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${this.getKey(key)}=${value};expires=${expires.toUTCString()};path=/`
  }

  // Get cookie
  getCookie(key) {
    const name = `${this.getKey(key)}=`
    const decodedCookie = decodeURIComponent(document.cookie)
    const cookieArray = decodedCookie.split(';')
    
    for (let cookie of cookieArray) {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1)
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length)
      }
    }
    return null
  }

  // Delete cookie
  deleteCookie(key) {
    document.cookie = `${this.getKey(key)}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
  }

  // Get storage usage
  getStorageUsage() {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length
      }
    }
    return {
      used: (total / 1024).toFixed(2), // KB
      usedMB: (total / (1024 * 1024)).toFixed(2), // MB
      percentage: ((total / (5 * 1024 * 1024)) * 100).toFixed(2), // Assuming 5MB limit
    }
  }

  // Clear expired items
  clearExpired() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key))
          if (Date.now() - item.timestamp > item.ttl) {
            localStorage.removeItem(key)
          }
        } catch (error) {
          localStorage.removeItem(key)
        }
      }
    })
  }

  // Store user preferences
  setPreference(key, value) {
    const preferences = this.get('preferences', {})
    preferences[key] = value
    this.set('preferences', preferences, 30 * 24 * 60 * 60 * 1000) // 30 days
  }

  // Get user preference
  getPreference(key, defaultValue = null) {
    const preferences = this.get('preferences', {})
    return preferences[key] !== undefined ? preferences[key] : defaultValue
  }

  // Store last visited page
  setLastPage(page) {
    this.setSession('last_page', page)
  }

  // Get last visited page
  getLastPage() {
    return this.getSession('last_page', '/')
  }

  // Clear all application data (logout)
  clearAll() {
    this.clear()
    this.clearSession()
    // Clear specific auth cookies
    this.deleteCookie('auth_token')
  }
}

export default new StorageService()