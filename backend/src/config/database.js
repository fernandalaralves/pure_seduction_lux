const { Sequelize } = require('sequelize');
const config = require('./env');

// Se existir a DATABASE_URL (padrão do Railway/Render), usa ela.
// Caso contrário, usa as variáveis separadas do seu arquivo env.js
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      define: {
        underscored: true,
        timestamps: true,
      },
    })
  : new Sequelize(config.db.name, config.db.user, config.db.password, {
      host: config.db.host,
      port: config.db.port,
      dialect: 'postgres',
      logging: config.env === 'development' ? console.log : false,
      define: {
        underscored: true,
        timestamps: true,
      },
    });

module.exports = sequelize;