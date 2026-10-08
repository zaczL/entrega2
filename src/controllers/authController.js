const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validation');
const { createError } = require('../errors');

function userData(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register(data) {
  const values = registerSchema.parse(data);
  const existingUser = await User.findOne({ email: values.email });

  if (existingUser) {
    throw createError('Este e-mail já está cadastrado.', 409);
  }

  const encryptedPassword = await bcrypt.hash(values.password, 10);
  const user = await User.create({
    name: values.name,
    email: values.email,
    password: encryptedPassword,
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  return { user: userData(user), token };
}

async function login(data) {
  const values = loginSchema.parse(data);
  const user = await User.findOne({ email: values.email }).select('+password');

  if (!user || !(await bcrypt.compare(values.password, user.password))) {
    throw createError('E-mail ou senha incorretos.', 401);
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  return { user: userData(user), token };
}

module.exports = { register, login };
