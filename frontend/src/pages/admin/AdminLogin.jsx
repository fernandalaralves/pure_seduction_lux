import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { extractErrorMessage } from '../../api/client';
import './admin.css';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin/produtos');
    } catch (err) {
      setError(extractErrorMessage(err, 'E-mail ou senha incorretos.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="silk-bg admin-login-page">
      <form className="panel admin-login-form" onSubmit={handleSubmit}>
        <div className="admin-login-brand">
          <Logo size={64} />
          <h1>PURE SEDUCTION LUX</h1>
          <p>Painel Administrativo</p>
        </div>
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-gold" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? <span className="spinner" /> : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
