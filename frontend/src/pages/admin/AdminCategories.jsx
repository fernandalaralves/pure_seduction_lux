import { useEffect, useState } from 'react';
import { adminApi, extractErrorMessage } from '../../api/client';
import './admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New category form
  const [newName, setNewName] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // Inline edit state (one category at a time)
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!newName.trim()) {
      setError('Dê um nome para a coleção.');
      return;
    }
    const formData = new FormData();
    formData.append('name', newName.trim());
    if (newFile) formData.append('image', newFile);

    setCreating(true);
    try {
      await adminApi.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewName('');
      setNewFile(null);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível criar a coleção.'));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditFile(null);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditFile(null);
  };

  const saveEdit = async (id) => {
    setError('');
    if (!editName.trim()) {
      setError('O nome da coleção não pode ficar vazio.');
      return;
    }
    const formData = new FormData();
    formData.append('name', editName.trim());
    if (editFile) formData.append('image', editFile);

    setSaving(true);
    try {
      await adminApi.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      cancelEdit();
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível salvar a coleção.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    const productWarning =
      'Os produtos que estão nela NÃO serão apagados, só ficarão sem coleção até você reorganizá-los.';
    if (!window.confirm(`Remover a coleção "${category.name}"?\n\n${productWarning}`)) return;
    setError('');
    try {
      await adminApi.delete(`/categories/${category.id}`);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível remover a coleção.'));
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Coleções</h1>
          <p>Gerencie as coleções mostradas na página inicial da loja</p>
        </div>
      </div>

      <form className="panel" onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <div className="admin-form-grid">
          <div className="field">
            <label>Nome da coleção</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Verão" required />
          </div>
          <div className="field">
            <label>Foto de capa (opcional - JPG, PNG ou WEBP)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setNewFile(e.target.files[0] || null)}
            />
          </div>
        </div>
        <button className="btn btn-gold" type="submit" disabled={creating}>
          {creating ? <span className="spinner" /> : '+ Adicionar coleção'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="text-center" style={{ padding: 60 }}>
          <span className="spinner" />
        </div>
      ) : (
        <>
          {categories.map((category) => {
            const isEditing = editingId === category.id;
            return (
              <div key={category.id} className="admin-product-row">
                <div className="admin-product-thumb">
                  {category.image_url ? <img src={category.image_url} alt={category.name} /> : null}
                </div>

                {isEditing ? (
                  <div className="field" style={{ margin: 0 }}>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setEditFile(e.target.files[0] || null)}
                      style={{ marginTop: 6 }}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="admin-product-name">{category.name}</div>
                    <div className="admin-product-meta">/{category.slug}</div>
                  </div>
                )}

                <div className="admin-product-actions">
                  {isEditing ? (
                    <>
                      <button
                        className="icon-btn"
                        aria-label="Salvar"
                        onClick={() => saveEdit(category.id)}
                        disabled={saving}
                      >
                        {saving ? <span className="spinner" /> : '✓'}
                      </button>
                      <button className="icon-btn" aria-label="Cancelar" onClick={cancelEdit} disabled={saving}>
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="icon-btn" aria-label="Editar" onClick={() => startEdit(category)}>
                        ✎
                      </button>
                      <button className="icon-btn danger" aria-label="Remover" onClick={() => remove(category)}>
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {categories.length === 0 && !error && <p className="helper-text">Nenhuma coleção cadastrada ainda.</p>}
        </>
      )}
    </div>
  );
}
