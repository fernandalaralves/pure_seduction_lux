import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Self-hosted (bundled) instead of pulled from Google Fonts at runtime, so
// "Sua essência" always renders in the exact script face used in the
// Figma design, with no dependency on an external font request succeeding.
import '@fontsource/great-vibes';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
