const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403)
    throw new Error('Access denied. Admin privileges required.')
  }
}

const checkAdminOrPermission = (permission) => {
  return (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.permissions?.includes(permission))) {
      next()
    } else {
      res.status(403)
      throw new Error('Access denied. Insufficient permissions.')
    }
  }
}

module.exports = { adminMiddleware, checkAdminOrPermission }