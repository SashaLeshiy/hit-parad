const jwt = require('jsonwebtoken');

require('dotenv').config();

const { JWT_SECRET = 'strong-dev-secret' } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    const err = new Error('Необходима авторизация');
    err.statusCode = 401;
    next(err);
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new Error('Необходима авторизация');
    error.statusCode = 401;
    next(error);
  }
  req.user = payload;
  next();
  return req.user;
};
