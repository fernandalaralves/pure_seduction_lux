import axios from 'axios';

// Detecta automaticamente se está rodando localmente ou em produção
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Em produção, força a URL oficial da API. Em desenvolvimento, usa o .env ou localhost.
const baseURL = isDevelopment 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:4000') 
  : 'https://api.pureseductionlux.com.br';

export const api = axios.create({ baseURL: `${baseURL}/api` });

// Attaches the customer JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('psl_customer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminApi = axios.create({ baseURL: `${baseURL}/api/admin` });

// Attaches the admin JWT (if present) to every admin request.
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('psl_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If an admin session expires, bounce back to the admin login screen.
adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/admin/login')) {
      localStorage.removeItem('psl_admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export function getImageUrl(path) {
  if (!path) return '';
  // Se o caminho já for uma URL completa (http...), retorna como está
  if (path.startsWith('http')) return path;
  // Se for um caminho relativo, adiciona o domínio da API
  return `${baseURL}${path}`;
}

export function extractErrorMessage(error, fallback = 'Ocorreu um erro. Tente novamente.') {
  return error?.response?.data?.error || error?.message || fallback;

}
