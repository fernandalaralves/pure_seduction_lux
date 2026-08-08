const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { Admin, Customer } = require('../models');

function extractToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) return token;
  return null;
}

/** Requires a valid customer JWT. Attaches req.customer. */
async function requireCustomerAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Autenticação necessária.' });

    const payload = jwt.verify(token, config.jwt.customerSecret);
    const customer = await Customer.findByPk(payload.sub);
    if (!customer) return res.status(401).json({ error: 'Sessão inválida.' });

    req.customer = customer;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
}

/** Optionally attaches req.customer if a valid token is present; never blocks. */
async function optionalCustomerAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = jwt.verify(token, config.jwt.customerSecret);
    const customer = await Customer.findByPk(payload.sub);
    if (customer) req.customer = customer;
  } catch (err) {
    // ignore invalid/expired tokens for optional auth
  }
  next();
}

/** Requires a valid admin JWT. Attaches req.admin. */
async function requireAdminAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Autenticação de administrador necessária.' });

    const payload = jwt.verify(token, config.jwt.adminSecret);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });

    const admin = await Admin.findByPk(payload.sub);
    if (!admin) return res.status(401).json({ error: 'Sessão inválida.' });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
}

module.exports = { requireCustomerAuth, optionalCustomerAuth, requireAdminAuth };
