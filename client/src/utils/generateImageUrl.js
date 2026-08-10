const svgPlaceholder = (label, bg = '#f3f4f6', fg = '#9ca3af') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="${bg}" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-family="system-ui,sans-serif" font-size="20">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const PLACEHOLDER_SVGS = {
  food: svgPlaceholder('No image'),
  user: svgPlaceholder('User', '#e0e7ff', '#6366f1'),
  category: svgPlaceholder('Category', '#fef3c7', '#d97706'),
  banner: svgPlaceholder('Banner', '#fce7f3', '#db2777'),
}

/**
 * Inline placeholder (never 404s — no file on disk required).
 */
export const getPlaceholderImage = (category = 'food') => {
  return PLACEHOLDER_SVGS[category] || PLACEHOLDER_SVGS.food
}

/**
 * Use on <img onError={...}> — sets placeholder once and stops infinite retries.
 */
export const handleImageError = (event, category = 'food') => {
  const img = event?.currentTarget
  if (!img) return
  const fallback = getPlaceholderImage(category)
  if (img.src === fallback) return
  img.onerror = null
  img.src = fallback
}

/**
 * Generate image URL with fallback
 * @param {string} imagePath - Image path or URL
 * @param {string} category - Image category (food, user, category)
 * @returns {string} Valid image URL
 */
export const generateImageUrl = (imagePath, category = 'food') => {
  if (!imagePath || (typeof imagePath === 'string' && !imagePath.trim())) {
    return getPlaceholderImage(category)
  }
  
  // Check if it's already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Check if it's a base64 image
  if (imagePath.startsWith('data:image')) {
    return imagePath
  }
  
  // Construct full URL for local images (API base often ends with /api)
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const serverBase = apiBase.replace(/\/api\/?$/, '')
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${serverBase}${path}`
}

/**
 * Optimize image URL with transformations
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export const optimizeImage = (imageUrl, options = {}) => {
  const {
    width = 400,
    height = 400,
    quality = 80,
    format = 'auto',
  } = options
  
  if (!imageUrl || !imageUrl.includes('cloudinary')) {
    return imageUrl
  }
  
  // Cloudinary transformation
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_fill`,
    `q_${quality}`,
    `f_${format}`,
  ]
  
  const parts = imageUrl.split('/upload/')
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`
  }
  
  return imageUrl
}

/**
 * Get image dimensions
 * @param {string} imageUrl - Image URL
 * @returns {Promise<Object>} Image dimensions
 */
export const getImageDimensions = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
      })
    }
    img.onerror = () => {
      resolve({ width: 0, height: 0, aspectRatio: 0 })
    }
    img.src = imageUrl
  })
}

/**
 * Check if image exists and is accessible
 * @param {string} imageUrl - Image URL to check
 * @returns {Promise<boolean>} True if image exists
 */
export const imageExists = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Generate responsive image srcset
 * @param {string} imageUrl - Base image URL
 * @param {Array} sizes - Array of sizes to generate
 * @returns {string} Srcset string
 */
export const generateSrcSet = (imageUrl, sizes = [400, 800, 1200]) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) {
    return imageUrl
  }
  
  const srcset = sizes.map(size => {
    const optimized = optimizeImage(imageUrl, { width: size })
    return `${optimized} ${size}w`
  }).join(', ')
  
  return srcset
}

/**
 * Convert file to base64
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WEBP.' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 5MB.' }
  }
  
  return { valid: true, error: null }
}

/**
 * Get image color palette (using Canvas API)
 * @param {string} imageUrl - Image URL
 * @returns {Promise<Array>} Array of dominant colors
 */
export const getImageColors = async (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const colors = {}
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const rgb = `${r},${g},${b}`
        colors[rgb] = (colors[rgb] || 0) + 1
      }
      
      const sortedColors = Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color]) => `rgb(${color})`)
      
      resolve(sortedColors)
    }
    img.onerror = () => resolve([])
    img.src = imageUrl
  })
}

export default {
  generateImageUrl,
  getPlaceholderImage,
  handleImageError,
  optimizeImage,
  getImageDimensions,
  imageExists,
  generateSrcSet,
  fileToBase64,
  validateImageFile,
  getImageColors,
}