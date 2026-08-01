// =============================================
// AUTH MIDDLEWARE
// =============================================
// Verifies JWT token on protected routes

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'ACCESS DENIED: No authentication token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Find the user in database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'ACCESS DENIED: User not found' 
      });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'ACCESS DENIED: Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'ACCESS DENIED: Token expired. Please login again.' });
    }
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = authMiddleware;
