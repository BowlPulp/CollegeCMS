const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');

const authenticateJWT = (req, res, next) => {
  // Check for token in cookies first
  let token = req.cookies?.token;
  if (!token) {
    // Fallback to Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'No token provided'));
    }
    token = authHeader.split(' ')[1];
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = { authenticateJWT };
