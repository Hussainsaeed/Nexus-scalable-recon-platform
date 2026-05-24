const jwt = require('jsonwebtoken');

function createHttpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string') {
      return next(createHttpError(401, 'Authorization header missing'));
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(createHttpError(401, 'Invalid Authorization header format'));
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('Missing required env var: JWT_SECRET');

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
      username: decoded.username
    };

    return next();
  } catch (e) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }
}

module.exports = {
  requireAuth
};

