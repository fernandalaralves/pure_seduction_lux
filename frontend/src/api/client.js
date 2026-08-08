import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

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

export function extractErrorMessage(error, fallback = 'Ocorreu um erro. Tente novamente.') {
  return error?.response?.data?.error || error?.message || fallback;
}
