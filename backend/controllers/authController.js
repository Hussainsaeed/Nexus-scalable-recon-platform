const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

function createHttpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function signJwt(user) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  if (!JWT_SECRET) throw new Error('Missing required env var: JWT_SECRET');

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body || {};

    if (!username || typeof username !== 'string') {
      return next(createHttpError(400, 'username is required'));
    }
    if (!email || typeof email !== 'string') {
      return next(createHttpError(400, 'email is required'));
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return next(createHttpError(400, 'password must be a string with at least 8 characters'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const existingByEmail = await User.findOne({ email: normalizedEmail });
    if (existingByEmail) return next(createHttpError(409, 'email already in use'));

    const existingByUsername = await User.findOne({ username: normalizedUsername });
    if (existingByUsername) return next(createHttpError(409, 'username already in use'));

    const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: 'user'
    });

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return next(createHttpError(500, 'Failed to register'));
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string') {
      return next(createHttpError(400, 'email is required'));
    }
    if (!password || typeof password !== 'string') {
      return next(createHttpError(400, 'password is required'));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return next(createHttpError(401, 'invalid credentials'));

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return next(createHttpError(401, 'invalid credentials'));

    const token = signJwt(user);

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return next(createHttpError(500, 'Failed to login'));
  }
}

module.exports = {
  register,
  login
};

