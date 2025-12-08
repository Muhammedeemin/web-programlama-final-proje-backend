const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authGuard = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
      });

      if (!req.user || !req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive'
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authGuard;

