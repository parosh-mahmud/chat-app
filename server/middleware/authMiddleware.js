const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token and verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the decoded ID and exclude the password field
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
});

module.exports = protect;
