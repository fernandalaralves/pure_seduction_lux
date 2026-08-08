import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('psl_customer_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setCustomer(res.data.customer))
      .catch(() => localStorage.removeItem('psl_customer_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('psl_customer_token', res.data.token);
    setCustomer(res.data.customer);
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('psl_customer_token', res.data.token);
    setCustomer(res.data.customer);
  };

  const logout = () => {
    localStorage.removeItem('psl_customer_token');
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}
