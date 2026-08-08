const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const config = require('../config/env');
const { asyncHandler } = require('../middlewares/errorHandler');
const { hashPassword } = require('../utils/password');

function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, role: 'admin' }, config.jwt.adminSecret, {
    expiresIn: config.jwt.expiresIn,
  });
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const admin = await Admin.findOne({ where: { email: email.toLowerCase().trim() } });
  // Deliberately generic error message to avoid revealing whether the email exists.
  if (!admin || !(await admin.checkPassword(password))) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const token = signAdminToken(admin);
  res.json({ token, admin: admin.toSafeJSON() });
});

const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin.toSafeJSON() });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' });
  }

  const admin = req.admin;
  if (!(await admin.checkPassword(currentPassword))) {
    return res.status(401).json({ error: 'Senha atual incorreta.' });
  }

  admin.password_hash = await hashPassword(newPassword);
  await admin.save();
  res.json({ message: 'Senha atualizada com sucesso.' });
});

module.exports = { login, me, changePassword };
