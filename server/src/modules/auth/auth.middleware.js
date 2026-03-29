const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

  try {
    const bearer = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    const verified = jwt.verify(bearer, process.env.JWT_SECRET || 'fallback_secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access Denied: Requires ADMIN role' });
  }
};

module.exports = { verifyToken, isAdmin };
