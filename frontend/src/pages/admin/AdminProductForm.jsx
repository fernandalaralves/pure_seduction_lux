import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, extractErrorMessage } from '../../api/client';
import './admin.css';

const SIZE_OPTIONS = ['PP', 'P', 'M', 'G', 'GG'];

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [variantDescription, setVariantDescription] = useState('');
  const [color, setColor] = useState('');
  const [sizes, setSizes] = useState([]);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState('active');
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminApi.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    adminApi.get(`/products/${id}`).then((res) => {
      const p = res.data.product;
      setName(p.name);
      setVariantDescription(p.variant_description || '');
      setColor(p.color || '');
      setSizes(p.available_sizes || []);
      setDescription(p.description || '');
      setCategoryId(p.category_id || '');
      setPrice(p.price);
      setStock(String(p.stock));
      setSku(p.sku || '');
      setStatus(p.status);
      setExistingImages(p.images || []);
    });
  }, [id, isEditing]);

  const toggleSize = (size) => {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  const removeExistingImage = async (imageId) => {
    if (!isEditing) return;
    try {
      await adminApi.delete(`/products/${id}/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !price) {
      setError('Nome e preço são obrigatórios.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('variant_description', variantDescription);
    formData.append('color', color);
    sizes.forEach((s) => formData.append('available_sizes', s));
    formData.append('description', description);
    if (categoryId) formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('sku', sku);
    formData.append('status', status);
    newFiles.forEach((file) => formData.append('images', file));

    setSubmitting(true);
    try {
      if (isEditing) {
        await adminApi.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await adminApi.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/admin/produtos');
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível salvar o produto.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{isEditing ? 'Editar produto' : 'Adicionar produto'}</h1>
          <p>Preencha as informações da peça</p>
        </div>
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <div className="field">
            <label>Nome do produto</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Descrição curta (ex: "Renda Vinho")</label>
            <input value={variantDescription} onChange={(e) => setVariantDescription(e.target.value)} />
          </div>
          <div className="field">
            <label>Cor</label>
            <input value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="field">
            <label>Categoria</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Preço (R$)</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="field">
            <label>Estoque</label>
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          <div className="field">
            <label>SKU (opcional)</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Tamanhos disponíveis</label>
          <div className="size-selector">
            {SIZE_OPTIONS.map((size) => (
              <button type="button" key={size} className={sizes.includes(size) ? 'active' : ''} onClick={() => toggleSize(size)}>
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Descrição completa</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {existingImages.length > 0 && (
          <div className="field">
            <label>Imagens atuais</label>
            <div className="admin-image-preview-row">
              {existingImages.map((img) => (
                <div key={img.id} className="admin-image-preview">
                  <img src={img.url} alt="" />
                  <button type="button" onClick={() => removeExistingImage(img.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label>Adicionar imagens (JPG, PNG ou WEBP, até 20MB cada)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setNewFiles(Array.from(e.target.files))} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-gold" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? <span className="spinner" /> : isEditing ? 'Salvar alterações' : 'Adicionar produto'}
        </button>
      </form>
    </div>
  );
}
