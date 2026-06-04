/**
 * isAdmin middleware
 * Must be used AFTER the `protect` middleware so req.user is populated.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.',
  })
}

module.exports = isAdmin
