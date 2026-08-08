const app = require('./app');
const config = require('./config/env');
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log(`[db] Conexão com o banco de dados (${config.db.dialect}) estabelecida.`);

    if (config.env !== 'production') {
      // Convenience for local development only. In production, use real
      // migrations (see README) instead of sync().
      await sequelize.sync();
    }

    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] Pure Seduction Lux API rodando na porta ${config.port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[server] Falha ao iniciar:', err);
    process.exit(1);
  }
}

start();
