const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Autentificare necesară' });

  const token = authHeader.split(' ')[1];
  try {
    const userData = jwt.verify(token, JWT_SECRET);
    req.user = userData; // userId, email, etc.
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

module.exports = authMiddleware;
