const formatError = (error) => {
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0]
    return {
      message: `${field} already exists`,
      statusCode: 400,
      field,
    }
  }
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message)
    return {
      message: errors.join(', '),
      statusCode: 400,
      errors,
    }
  }
  
  // JWT error
  if (error.name === 'JsonWebTokenError') {
    return {
      message: 'Invalid token',
      statusCode: 401,
    }
  }
  
  if (error.name === 'TokenExpiredError') {
    return {
      message: 'Token expired',
      statusCode: 401,
    }
  }
  
  // Multer error
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      message: 'File too large. Maximum size is 5MB.',
      statusCode: 400,
    }
  }
  
  // Default error
  return {
    message: error.message || 'Something went wrong',
    statusCode: error.statusCode || 500,
  }
}

const formatSuccess = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    statusCode,
    data,
  }
}

const formatPaginationResponse = (items, page, limit, total) => {
  const totalPages = Math.ceil(total / limit)
  
  return {
    items,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

const formatValidationErrors = (errors) => {
  return errors.array().map(err => ({
    field: err.param,
    message: err.msg,
    value: err.value,
  }))
}

module.exports = {
  formatError,
  formatSuccess,
  formatPaginationResponse,
  formatValidationErrors,
}