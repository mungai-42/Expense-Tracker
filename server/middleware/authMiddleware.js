const jwt = require('jsonwebtoken');
require('dotenv').config();

function protect(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer token
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = { id: decoded.id, role: decoded.role || 'user' };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = { protect, requireAdmin };
