const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('./env');

let sequelize;

if (config.db.dialect === 'sqlite') {
  // Zero-config local file database - no server, user or password needed.
  fs.mkdirSync(path.dirname(config.db.storage), { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.storage,
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  });
} else {
  sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    logging: false,
    dialectOptions: config.db.ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    define: {
      underscored: true,
      timestamps: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

module.exports = sequelize;
