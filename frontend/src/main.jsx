import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
// Self-hosted (bundled) instead of pulled from Google Fonts at runtime, so
// "Sua essência" always renders in the exact script face used in the
// Figma design, with no dependency on an external font request succeeding.
import '@fontsource/great-vibes';
import './styles/theme.css';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p role="alert">Ocorreu um erro inesperado.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
