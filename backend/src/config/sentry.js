const Sentry = require('@sentry/node');
const config = require('./env');

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.env,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}

module.exports = Sentry;