import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, extractErrorMessage } from '../api/client';
import ProductCard from '../components/ProductCard';
import './Shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('busca') || '';
  const category = searchParams.get('categoria') || '';
  const sort = searchParams.get('ordenar') || 'recentes';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { search, category, sort } })
      .then((res) => setProducts(res.data.products))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="container section-block">
      <h1 className="page-title">Nossa Loja</h1>

      <div className="shop-toolbar">
        <input
          type="text"
          placeholder="Buscar produto..."
          defaultValue={search}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('busca', e.target.value)}
          onBlur={(e) => updateParam('busca', e.target.value)}
        />
        <select value={category} onChange={(e) => updateParam('categoria', e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => updateParam('ordenar', e.target.value)}>
          <option value="recentes">Mais recentes</option>
          <option value="preco-asc">Menor preço</option>
          <option value="preco-desc">Maior preço</option>
          <option value="nome-asc">Nome A-Z</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="text-center" style={{ padding: 60 }}>
          <span className="spinner" />
        </div>
      ) : (
        <div className="featured-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && !error && (
            <p className="helper-text">Nenhum produto encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
