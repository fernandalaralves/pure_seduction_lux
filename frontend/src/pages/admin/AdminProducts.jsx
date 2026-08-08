import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, extractErrorMessage } from '../../api/client';
import './admin.css';

function formatPrice(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recentes');
  const [status, setStatus] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .get('/products', { params: { search, sort, status } })
      .then((res) => setProducts(res.data.products))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [sort, status]);

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') load();
  };

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await adminApi.patch(`/products/${product.id}/status`, { status: newStatus });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Remover "${product.name}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await adminApi.delete(`/products/${product.id}`);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Produtos</h1>
          <p>Gerencie os produtos da sua loja</p>
        </div>
        <Link to="/admin/produtos/novo" className="btn btn-gold">
          + Adicionar produto
        </Link>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recentes">Ordenar por: Mais recentes</option>
          <option value="preco-asc">Ordenar por: Menor preço</option>
          <option value="preco-desc">Ordenar por: Maior preço</option>
          <option value="nome-asc">Ordenar por: Nome A-Z</option>
          <option value="estoque">Ordenar por: Estoque</option>
        </select>
        <button className="btn btn-outline-gold" type="button" onClick={() => setShowFilters((s) => !s)}>
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="admin-toolbar">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="text-center" style={{ padding: 60 }}>
          <span className="spinner" />
        </div>
      ) : (
        <>
          {products.map((product) => {
            const image = product.cover_image_url || product.images?.[0]?.url;
            return (
              <div key={product.id} className="admin-product-row">
                <div className="admin-product-thumb">
                  {image ? <img src={image} alt={product.name} /> : null}
                </div>
                <div>
                  <div className="admin-product-name">{product.name}</div>
                  {product.variant_description && (
                    <div className="admin-product-meta">{product.variant_description}</div>
                  )}
                  <div className="admin-product-price">{formatPrice(product.price)}</div>
                  <div className="admin-product-meta">Estoque: {product.stock}</div>
                </div>
                <div className="admin-product-actions">
                  <Link to={`/admin/produtos/${product.id}`} className="icon-btn" aria-label="Editar">
                    ✎
                  </Link>
                  <button className="icon-btn danger" onClick={() => remove(product)} aria-label="Remover">
                    🗑
                  </button>
                </div>
                <div className="admin-product-status">
                  <button
                    className={`badge ${product.status === 'active' ? 'badge-active' : 'badge-inactive'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    onClick={() => toggleStatus(product)}
                    title="Clique para alternar o status"
                  >
                    {product.status === 'active' ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
            );
          })}
          {products.length === 0 && !error && <p className="helper-text">Nenhum produto encontrado.</p>}
        </>
      )}
    </div>
  );
}
