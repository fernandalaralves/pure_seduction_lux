import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../api/client';
import './AuthForm.css';

export default function Login() {
  const { login } = useAuth();
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
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'E-mail ou senha incorretos.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section-block auth-page">
      <form className="panel auth-form" onSubmit={handleSubmit}>
        <h1 className="section-title align-left">Entrar</h1>
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-gold" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? <span className="spinner" /> : 'Entrar'}
        </button>
        <p className="helper-text text-center" style={{ marginTop: 16 }}>
          Não tem conta? <Link to="/registrar">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
