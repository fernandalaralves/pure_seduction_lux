const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/env');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// The Mercado Pago webhook needs the raw body path to work like any other
// JSON endpoint here since we only read `type`/`data.id`, so a normal JSON
// parser is fine for our whole API.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded product images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Basic protection against brute-force login attempts / API abuse.
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/admin/auth/login', authLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
