const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { createError } = require('./errors');

async function getUser(authorization) {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError('Token não informado.', 401);
  }

  const token = authorization.slice(7).trim();
  let data;

  try {
    data = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createError('Token inválido ou expirado.', 401);
  }

  const user = await User.findById(data.userId);
  if (!user) {
    throw createError('Usuário não encontrado.', 401);
  }

  return user;
}

async function authMiddleware(request, _response, next) {
  request.user = await getUser(request.headers.authorization);
  next();
}

module.exports = { getUser, authMiddleware };
