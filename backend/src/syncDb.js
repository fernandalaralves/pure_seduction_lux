/**
 * One-off script to create/update all tables from the current models.
 * Run with: npm run db:sync
 * (For production use, prefer proper Sequelize migrations instead of sync.)
 */
const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao sincronizar o banco de dados:', err);
    process.exit(1);
  }
})();
