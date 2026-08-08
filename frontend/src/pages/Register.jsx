import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../api/client';
import './AuthForm.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ name, email, phone, password });
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível criar sua conta.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section-block auth-page">
      <form className="panel auth-form" onSubmit={handleSubmit}>
        <h1 className="section-title align-left">Criar conta</h1>
        <div className="field">
          <label>Nome completo</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>WhatsApp</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-gold" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? <span className="spinner" /> : 'Criar conta'}
        </button>
        <p className="helper-text text-center" style={{ marginTop: 16 }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
