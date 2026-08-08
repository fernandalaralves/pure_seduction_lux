require('dotenv').config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[config] Warning: environment variable ${name} is not set.`);
  }
  return value;
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  db: {
    // 'postgres' (recommended for production) or 'sqlite' (zero-config local
    // file database - no server/user/password needed, great for trying the
    // project out quickly).
    dialect: process.env.DB_DIALECT || 'postgres',
    storage: process.env.DB_STORAGE || require('path').join(__dirname, '..', '..', 'data', 'database.sqlite'),
    host: required('DB_HOST', 'localhost'),
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: required('DB_NAME', 'pure_seduction_lux'),
    user: required('DB_USER', 'psl_user'),
    password: required('DB_PASSWORD', ''),
    ssl: process.env.DB_SSL === 'true',
  },

  jwt: {
    customerSecret: required('JWT_CUSTOMER_SECRET', 'dev-only-insecure-customer-secret'),
    adminSecret: required('JWT_ADMIN_SECRET', 'dev-only-insecure-admin-secret'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'Administrador',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@pureseductionlux.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'change_this_password_123',
  },

  store: {
    municipalityCity: process.env.STORE_MUNICIPALITY_CITY || 'Boa Viagem',
    municipalityState: process.env.STORE_MUNICIPALITY_STATE || 'CE',
    deliveryFee: parseFloat(process.env.STORE_DELIVERY_FEE || '8.00'),
    name: process.env.STORE_NAME || 'Pure Seduction Lux',
    phone: process.env.STORE_PHONE || '',
    whatsapp: process.env.STORE_WHATSAPP || '',
  },

  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    publicKey: process.env.MP_PUBLIC_KEY || '',
    webhookSecret: process.env.MP_WEBHOOK_SECRET || '',
  },
};
