const jwt = require('jsonwebtoken');
const { Customer } = require('../models');
const config = require('../config/env');
const { asyncHandler } = require('../middlewares/errorHandler');
const { hashPassword } = require('../utils/password');

function signCustomerToken(customer) {
  return jwt.sign({ sub: customer.id, role: 'customer' }, config.jwt.customerSecret, {
    expiresIn: config.jwt.expiresIn,
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const existing = await Customer.findOne({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' });
  }

  const password_hash = await hashPassword(password);
  const customer = await Customer.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || null,
    password_hash,
  });

  const token = signCustomerToken(customer);
  res.status(201).json({ token, customer: customer.toSafeJSON() });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const customer = await Customer.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!customer || !(await customer.checkPassword(password))) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const token = signCustomerToken(customer);
  res.json({ token, customer: customer.toSafeJSON() });
});

const me = asyncHandler(async (req, res) => {
  res.json({ customer: req.customer.toSafeJSON() });
});

module.exports = { register, login, me };
