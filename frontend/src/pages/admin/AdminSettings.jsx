import { useEffect, useState } from 'react';
import { adminApi, extractErrorMessage } from '../../api/client';
import './admin.css';

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    adminApi.get('/settings').then((res) => setForm(res.data.settings)).catch((err) => setError(extractErrorMessage(err)));
  }, []);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await adminApi.put('/settings', form);
      setForm(res.data.settings);
      setSuccess('Configurações salvas com sucesso.');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await adminApi.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess('Senha atualizada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(extractErrorMessage(err));
    }
  };

  if (!form) return <span className="spinner" />;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Configurações</h1>
          <p>Dados da loja e zona de entrega</p>
        </div>
      </div>

      <form className="panel" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <h2 className="section-title align-left">Loja</h2>
        <div className="field">
          <label>Nome da loja</label>
          <input value={form.store_name || ''} onChange={(e) => handleChange('store_name', e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Telefone</label>
            <input value={form.store_phone || ''} onChange={(e) => handleChange('store_phone', e.target.value)} />
          </div>
          <div className="field">
            <label>WhatsApp (com DDI, ex: 5588999999999)</label>
            <input value={form.store_whatsapp || ''} onChange={(e) => handleChange('store_whatsapp', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Endereço da loja (para retirada)</label>
          <input value={form.store_address || ''} onChange={(e) => handleChange('store_address', e.target.value)} />
        </div>

        <h2 className="section-title align-left" style={{ marginTop: 24 }}>
          Zona de entrega
        </h2>
        <p className="helper-text" style={{ marginBottom: 14 }}>
          Pedidos de entrega só são aceitos quando a cidade/estado do endereço do cliente forem
          exatamente estes. Fora dessa área, o cliente só pode escolher retirada na loja.
        </p>
        <div className="field-row">
          <div className="field">
            <label>Município</label>
            <input value={form.municipality_city || ''} onChange={(e) => handleChange('municipality_city', e.target.value)} />
          </div>
          <div className="field">
            <label>Estado (UF)</label>
            <input
              value={form.municipality_state || ''}
              maxLength={2}
              onChange={(e) => handleChange('municipality_state', e.target.value.toUpperCase())}
            />
          </div>
        </div>
        <div className="field">
          <label>Taxa de entrega (R$)</label>
          <input type="number" step="0.01" min="0" value={form.delivery_fee} onChange={(e) => handleChange('delivery_fee', e.target.value)} />
        </div>

        <h2 className="section-title align-left" style={{ marginTop: 24 }}>
          Pagamento via PIX
        </h2>
        <p className="helper-text" style={{ marginBottom: 14 }}>
          Essa é a chave PIX que aparece para o cliente no checkout (junto com o QR Code, gerado
          automaticamente a partir dela e do valor do pedido). Pode ser CPF/CNPJ, e-mail, telefone
          ou chave aleatória.
        </p>
        <div className="field">
          <label>Chave PIX</label>
          <input
            value={form.pix_key || ''}
            onChange={(e) => handleChange('pix_key', e.target.value)}
            placeholder="Ex: 00000000000 ou nome@email.com"
          />
        </div>

        <h2 className="section-title align-left" style={{ marginTop: 24 }}>
          Páginas do site
        </h2>
        <p className="helper-text" style={{ marginBottom: 14 }}>
          Esse texto aparece nas páginas públicas "Trocas e devoluções" e "Perguntas frequentes".
          Deixe uma linha em branco para separar parágrafos, comece uma linha com <code>## </code>{' '}
          para criar um título, e com <code>- </code> para criar uma lista.
        </p>
        <div className="field">
          <label>Trocas e devoluções</label>
          <textarea
            rows={12}
            value={form.returns_policy_content || ''}
            onChange={(e) => handleChange('returns_policy_content', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Perguntas frequentes</label>
          <textarea
            rows={12}
            value={form.faq_content || ''}
            onChange={(e) => handleChange('faq_content', e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button className="btn btn-gold" type="submit" disabled={saving}>
          {saving ? <span className="spinner" /> : 'Salvar configurações'}
        </button>
      </form>

      <form className="panel" onSubmit={handlePasswordSubmit}>
        <h2 className="section-title align-left">Alterar senha</h2>
        <div className="field">
          <label>Senha atual</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="field">
          <label>Nova senha</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} />
        </div>
        {passwordError && <div className="alert alert-error">{passwordError}</div>}
        {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
        <button className="btn btn-outline-gold" type="submit">
          Atualizar senha
        </button>
      </form>
    </div>
  );
}
